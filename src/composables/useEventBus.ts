export function useEventBus<T extends Record<string, any>>() {
  const eventCallbacks: { [K in keyof T]: Set<(data: T[K]) => void> } = {} as any

  const on = <K extends keyof T>(event: K, callback: (data: T[K]) => void) => {
    if (!eventCallbacks[event]) {
      eventCallbacks[event] = new Set()
    }
    eventCallbacks[event].add(callback)
    return () => {
      eventCallbacks[event].delete(callback)
    }
  }

  const emit = <K extends keyof T>(event: K, data: T[K]) => {
    eventCallbacks[event]?.forEach((callback) => {
      callback(data)
    })
  }

  const off = <K extends keyof T>(event: K, callback: (data: T[K]) => void) => {
    eventCallbacks[event]?.delete(callback)
  }

  // 清理所有事件监听器
  const cleanup = () => {
    Object.keys(eventCallbacks).forEach((key) => {
      eventCallbacks[key as keyof T].clear()
    })
  }

  return { on, emit, off, cleanup }
}
