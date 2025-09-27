// 如果indexedDB的api改变, 这里大概率也要改
export function useIndexedDB(dbName: string, options?: { version?: number, onUpgradeneeded?: (event: IDBVersionChangeEvent) => void }) {
  const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(dbName, options?.version)
    req.addEventListener('upgradeneeded', (event) => {
      options?.onUpgradeneeded?.(event)
    }, { once: true })
    req.addEventListener('success', () => {
      resolve(req.result)
    }, { once: true })
    req.addEventListener('error', () => {
      reject(req.error)
    }, { once: true })
  }).then(database => database)

  const request = <T>(dbRequest: IDBRequest<T>) => {
    return new Promise<T>((resolve, reject) => {
      dbRequest.addEventListener('success', () => {
        resolve(dbRequest.result)
      }, { once: true })
      dbRequest.addEventListener('error', () => {
        reject(dbRequest.error)
      }, { once: true })
    })
  }

  const transaction = async (...args: Parameters<IDBDatabase['transaction']>) => {
    const db = await dbPromise
    const tx = db.transaction(...args)
    // TODO: 用代理类型提示不好
    return new Proxy(tx, {
      get(target, prop, receiver) {
        const original = Reflect.get(target, prop, receiver)
        if (typeof original !== 'function') {
          return original
        }
        if (prop === 'objectStore') {
          return (...storeArgs: Parameters<IDBTransaction['objectStore']>) => {
            const store = original.apply(target, storeArgs)

            return new Proxy(store, {
              get(storeTarget, storeProp, storeReceiver) {
                const storeOriginal = Reflect.get(storeTarget, storeProp, storeReceiver)
                if (typeof storeOriginal !== 'function') {
                  return storeOriginal
                }

                return (...args: unknown[]) => {
                  const result = storeOriginal.apply(storeTarget, args)
                  if (result instanceof IDBRequest) {
                    return request(result)
                  }

                  return result
                }
              },
            })
          }
        }
        // 是函数的话, 包装一下返回 Promise
        return original.bind(target)
      },
    })
  }

  return {
    transaction,
  }
}
