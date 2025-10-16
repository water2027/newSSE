// 获取环境变量（带默认值）
const MIN_CLICK_GAP = Number(import.meta.env.VITE_MIN_CLICK_GAP) || 1000

// 防抖函数
export function debounce<T extends (...args: any[]) => void>(fn: T): ((...args: Parameters<T>) => void) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => fn(...args), MIN_CLICK_GAP)
  }
}

// 异步防抖函数
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(fn: T): ((...args: Parameters<T>) => Promise<ReturnType<T>>) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, MIN_CLICK_GAP)
    })
  }
}