import { useEventBus } from './useEventBus'

const WebSocketStatus = {
  Unconnected: 0,
  Connecting: 1,
  Connected: 2,
} as const

interface WebSocketEventMap<T> {
  Open: Event
  Close: CloseEvent
  Error: Event
  Message: T
}

interface WebSocketOptions {
  reconnectOptions?: {
    maxRetries?: number
    initialDelay?: number
  }
  keepAliveOptions?: {
    interval?: number
    fn?: (sendMessage: (msg: any) => boolean) => void
  }
}

export function useWebSocket<Received extends Record<string, any>, Sent extends Record<string, any>>(url: string | URL, options?: WebSocketOptions) {
    type WebSocketEvent = keyof Received
    type WebSocketEventMessage = Received[WebSocketEvent]

    const { reconnectOptions = {}, keepAliveOptions } = options || {}
    const { maxRetries = 5, initialDelay = 1000 } = reconnectOptions

    let websocketClient: WebSocket | null = null
    let heartbeatInterval: number | null = null
    const connectionInfo = {
      status: WebSocketStatus.Unconnected as typeof WebSocketStatus[keyof typeof WebSocketStatus],
      retryTimes: 0,
      reconnectTimeout: null as number | null,
    }
    const { on, emit, off, cleanup: eventBusCleanup } = useEventBus<WebSocketEventMap<WebSocketEventMessage>>()

    const sendWebSocketMessage = <K extends keyof Sent>(message: Sent[K]) => {
      if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
        websocketClient.send(JSON.stringify(message))
        return true
      }
      else {
        return false
      }
    }

    const handleSocketMessage = (event: MessageEvent<string>) => {
      let data: WebSocketEventMessage
      try {
        data = JSON.parse(event.data) as WebSocketEventMessage
      }
      catch (e) {
        emit('Error', new ErrorEvent('error', {
          error: new Error(`MessageParseError: ${(e as Error).message}`),
        }))
        return
      }

      if (!data)
        return

      emit('Message', data)
    }

    const cleanupLastConnection = () => {
      if (websocketClient) {
        websocketClient.removeEventListener('message', handleSocketMessage)
        websocketClient.close()
        websocketClient = null
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
        heartbeatInterval = null
      }
    }

    // 心跳
    const keepConnection = () => {
      const state = websocketClient ? websocketClient.readyState : WebSocket.CLOSED
      if (state === WebSocket.OPEN) {
        try {
          options!.keepAliveOptions!.fn!(sendWebSocketMessage)
        }
        catch (error) {
          console.warn('Heartbeat failed:', error)
        }
      }
    }

    const connect = () => {
    // 避免重复连接
      if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
        connectionInfo.status = WebSocketStatus.Connected
        return
      }
      if (connectionInfo.status === WebSocketStatus.Connecting) {
        return
      }
      connectionInfo.status = WebSocketStatus.Connecting

      websocketClient = new WebSocket(url)
      websocketClient.addEventListener('close', (e) => {
        emit('Close', e)
      }, {
        once: true,
      })
      websocketClient.addEventListener('open', (e) => {
        connectionInfo.retryTimes = 0
        if (keepAliveOptions?.interval && keepAliveOptions.fn) {
          heartbeatInterval = setInterval(keepConnection, keepAliveOptions.interval)
        }
        connectionInfo.status = WebSocketStatus.Connected
        emit('Open', e)
      }, {
        once: true,
      })
      websocketClient.addEventListener('error', (e) => {
        connectionInfo.status = WebSocketStatus.Unconnected
        emit('Error', e)
      }, {
        once: true,
      })
      websocketClient.addEventListener('message', handleSocketMessage)
    }

    const reconnect = () => {
      cleanupLastConnection()
      if (connectionInfo.reconnectTimeout) {
        clearTimeout(connectionInfo.reconnectTimeout)
      }
      connectionInfo.reconnectTimeout = setTimeout(() => {
        if (connectionInfo.retryTimes >= maxRetries) {
          connectionInfo.status = WebSocketStatus.Unconnected
          return
        }

        if (connectionInfo.status === WebSocketStatus.Connecting)
          return

        connectionInfo.retryTimes += 1
        connect()
      }, initialDelay * 2 ** (connectionInfo.retryTimes + 1))
    }

    const disconnect = () => {
      if (connectionInfo.reconnectTimeout) {
        clearTimeout(connectionInfo.reconnectTimeout)
        connectionInfo.reconnectTimeout = null
      }
      connectionInfo.status = WebSocketStatus.Unconnected
      connectionInfo.retryTimes = 0

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
        heartbeatInterval = null
      }

      if (websocketClient) {
        websocketClient.removeEventListener('message', handleSocketMessage)
        websocketClient.close()
        websocketClient = null
      }

      eventBusCleanup()
    }

    const handleWebSocketError = (event: Event) => {
      if (event.target instanceof WebSocket) {
        reconnect()
      }
    }
    // 避免相互调用, 单独抽出来监听Error了
    on('Error', handleWebSocketError)

    return {
      connect,
      disconnect,
      on,
      off,
      sendWebSocketMessage,
    }
}
