import { reactive, ref, shallowRef } from 'vue'
import { useUserStore } from '@/store/userStore'
import { useEventBus } from './useEventBus'

export interface RelevantUser {
  userID: number
  email: string
  name: string
  avatarURL: string
  identity: string
  score: number
  unRead: number
}

export interface ChatMessageItem {
  chatMsgID: number
  targetUserID: number
  senderUserID: number
  content: string
  unread: number
  createdAt: string
}

interface ChatEventMap {
  RelevantUsers: {
    relevantUsers: RelevantUser[]
  }
  NewMessage: ChatMessageItem
  MessageAck: { code: number, msg: string }
}

interface WebSocketEventMap {
  Open: Event
  Close: CloseEvent
  Error: Event
}

const WebSocketStatus = {
  Unconnected: 0,
  Connecting: 1,
  Connected: 2,
} as const

// 客户端发送的信息
interface ChatMessage {
  Beat: { userID: number, beat: number }
  NewMessage: {
    senderUserID: number
    targetUserID: number
    content: string
  }
}

function isRelevantUsers(event: any): event is ChatEventMap['RelevantUsers'] {
  return 'relevantUsers' in event
}

function isNewMessage(event: any): event is ChatEventMap['NewMessage'] {
  return 'chatMsgID' in event && 'targetUserID' in event && 'senderUserID' in event && 'content' in event
}

// function isMessageAck(event: any): event is ChatEventMap['MessageAck'] {
//   return 'code' in event && 'msg' in event
// }

type ChatEvent = keyof ChatEventMap
type ChatEventMessage = ChatEventMap[ChatEvent]

// 单例模式
const websocketClient = ref<WebSocket | null>(null)
const heartbeatInterval = ref<number | null>(null)
const connectionInfo = reactive({
  status: WebSocketStatus.Unconnected as typeof WebSocketStatus[keyof typeof WebSocketStatus],
  retryTimes: 0,
  reconnectTimeout: null as number | null,
})
const MAX_RETRY = 5
const { on, emit, off, cleanup: eventBusCleanup } = useEventBus<ChatEventMap & WebSocketEventMap>()
const { userInfo, token } = useUserStore()
const handleWebSocketError = shallowRef<(event: Event) => void>()
// const messageQueue: {
//   resolve: () => void
//   reject: (reason?: any) => void
// }[] = []

export function useChat() {
  const sendMessage = <T extends keyof ChatMessage>(message: ChatMessage[T]) => {
    // return new Promise<void>((resolve, reject) => {
    //   if (websocketClient.value && websocketClient.value.readyState === WebSocket.OPEN) {
    //     websocketClient.value.send(JSON.stringify(message))
    //     messageQueue.push({ resolve, reject })
    //   }
    //   else {
    //     reject(new Error('WebSocket is not connected'))
    //   }
    // })
    if (websocketClient.value && websocketClient.value.readyState === WebSocket.OPEN) {
      websocketClient.value.send(JSON.stringify(message))
      return true
    }
    else {
      return false
    }
  }

  const handleSocketMessage = (event: MessageEvent<string>) => {
    let data: ChatEventMessage
    try {
      data = JSON.parse(event.data) as ChatEventMessage
    }
    catch (e) {
      emit('Error', new ErrorEvent('error', {
        error: new Error(`MessageParseError: ${(e as Error).message}`),
      }))
      return
    }

    if (!data)
      return

    if (isRelevantUsers(data)) {
      emit('RelevantUsers', data)
      return
    }

    if (isNewMessage(data)) {
      emit('NewMessage', data)
    }

    // if (isMessageAck(data)) {
    //   // 没有办法知道哪条信息发送成功了
    //   // 多端登录100%有问题
    //   const { code, msg } = data
    //   const handler = messageQueue.shift()
    //   if (!handler) {
    //     // 大概率是其它端
    //     return
    //   }
    //   const { resolve, reject } = handler
    //   if (code === 0) {
    //     resolve()
    //   }
    //   else {
    //     reject(new Error(msg || 'Message send failed'))
    //   }
    // }
  }

  const cleanupLastConnection = () => {
    if (websocketClient.value) {
      websocketClient.value.removeEventListener('message', handleSocketMessage)
      websocketClient.value.close()
      websocketClient.value = null
    }
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }
  }

  // 心跳
  const keepConnection = () => {
    const state = websocketClient.value ? websocketClient.value.readyState : WebSocket.CLOSED
    if (state === WebSocket.OPEN) {
      try {
        sendMessage({ userID: userInfo.userID, beat: 1 })
      }
      catch (error) {
        console.warn('Heartbeat failed:', error)
      }
    }
  }

  const connect = () => {
    // 避免重复连接
    if (websocketClient.value && websocketClient.value.readyState === WebSocket.OPEN) {
      connectionInfo.status = WebSocketStatus.Connected
      return
    }
    if (connectionInfo.status === WebSocketStatus.Connecting) {
      return
    }
    connectionInfo.status = WebSocketStatus.Connecting

    const wsURL = new URL('/websocket/auth/chat', import.meta.env.VITE_API_BASE_URL)
    wsURL.searchParams.append('token', token.value)
    wsURL.protocol = wsURL.protocol.replace('http', 'ws')
    websocketClient.value = new WebSocket(wsURL)
    websocketClient.value.addEventListener('close', (e) => {
      emit('Close', e)
    }, {
      once: true,
    })
    websocketClient.value.addEventListener('open', (e) => {
      connectionInfo.retryTimes = 0
      heartbeatInterval.value = setInterval(keepConnection, 30000)
      connectionInfo.status = WebSocketStatus.Connected
      emit('Open', e)
    }, {
      once: true,
    })
    websocketClient.value.addEventListener('error', (e) => {
      connectionInfo.status = WebSocketStatus.Unconnected
      emit('Error', e)
    }, {
      once: true,
    })
    websocketClient.value.addEventListener('message', handleSocketMessage)
  }

  const reconnect = () => {
    cleanupLastConnection()
    if (connectionInfo.reconnectTimeout) {
      clearTimeout(connectionInfo.reconnectTimeout)
    }
    connectionInfo.reconnectTimeout = setTimeout(() => {
      if (connectionInfo.retryTimes >= MAX_RETRY) {
        connectionInfo.status = WebSocketStatus.Unconnected
        return
      }

      if (connectionInfo.status === WebSocketStatus.Connecting)
        return

      connectionInfo.retryTimes += 1
      connect()
    }, 500 * 2 ** (connectionInfo.retryTimes + 1))
  }

  const disconnect = () => {
    if (connectionInfo.reconnectTimeout) {
      clearTimeout(connectionInfo.reconnectTimeout)
      connectionInfo.reconnectTimeout = null
    }
    connectionInfo.status = WebSocketStatus.Unconnected
    connectionInfo.retryTimes = 0

    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }

    if (websocketClient.value) {
      websocketClient.value.removeEventListener('message', handleSocketMessage)
      websocketClient.value.close()
      websocketClient.value = null
    }

    eventBusCleanup()
  }

  if (!handleWebSocketError.value) {
    handleWebSocketError.value = (event: Event) => {
      if (event.target instanceof WebSocket) {
        reconnect()
      }
    }
    on('Error', handleWebSocketError.value!)
  }

  return {
    connect,
    disconnect,
    on,
    off,
    sendMessage,
  }
}
