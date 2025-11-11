// 获取环境变量（带默认值）
const MIN_CLICK_GAP = Number(import.meta.env.VITE_MIN_CLICK_GAP) || 1000

// 防抖函数（第一次点击有效）
export function debounce<T extends (...args: any[]) => void>(fn: T): ((...args: Parameters<T>) => void) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>): void => {
    if (!timeout) {
      fn(...args)
      timeout = setTimeout(() => {
        timeout = null
      }, MIN_CLICK_GAP)
    }
  }
}

// 异步防抖函数（第一次点击有效）
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(fn: T): ((...args: Parameters<T>) => Promise<ReturnType<T>>) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (!timeout) {
        timeout = setTimeout(() => timeout = null, MIN_CLICK_GAP)
        fn(...args)
          .then(resolve)
          .catch(reject)
      }
      else {
        reject(new Error('操作太频繁，请稍后再试'))
      }
    })
  }
}
