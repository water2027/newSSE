import { showMsg } from '@/components/MessageBox'
import router from '@/router'
import { useUserStore } from '@/store/userStore'

const apiUrl = import.meta.env.VITE_API_BASE_URL

let refreshPromise: Promise<void> | null = null

async function refreshTokenIfNeeded() {
  const { refreshToken, setToken, setRefreshToken } = useUserStore()

  if (!refreshToken.value) {
    throw new Error('No refresh token')
  }

  const res = await fetch(`${apiUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken.value }),
  })

  if (!res.ok) {
    throw new Error('Refresh token request failed')
  }

  const data = await res.json()
  const token = data.data?.token
  const newRefreshToken = data.data?.refresh_token

  if (!token || !newRefreshToken) {
    throw new Error('Invalid refresh response')
  }

  setToken(token)
  setRefreshToken(newRefreshToken)
}

export interface RequestObject {
  method: string
  headers: HeadersInit
  body?: object
  query?: Record<string, string>
}

/***
 * @param {string} url api地址，只需写https://ssemarket.cn/api 后的部分
 * @param {{method:string,headers:object,body:object|null}} object 请求体
 * @param {boolean} tokenIsNeeded 是否需要token
 * @example requestFunc('/auth/deletePcomment',{
 *  headers:{'Content-Type': 'application/json'},
 *  body:{pcommentID:1}
 * },
 *  true)
 */
async function requestFunc(url: string, object: RequestObject, tokenIsNeeded: boolean = true) {
  if (tokenIsNeeded) {
    const store = useUserStore()
    const finalUrl = `${apiUrl}${url}?${new URLSearchParams(object.query).toString()}`

    const doRequest = async () => {
      return fetch(`${finalUrl}`, {
        method: object.method,
        headers: {
          ...object.headers,
          Authorization: `Bearer ${store.token.value}`,
        },
        body: JSON.stringify(object.body),
      })
    }

    let res: Response

    if (store.token.value) {
      res = await doRequest()
    }
    else if (store.refreshToken.value) {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            await refreshTokenIfNeeded()
          }
          finally {
            refreshPromise = null
          }
        })()
      }

      try {
        await refreshPromise
      }
      catch (e) {
        console.error('首次刷新 token 失败', e)
        showMsg('登录过期，请重新登录')
        store.setToken('')
        store.setRefreshToken('')
        router.push('/auth/login')
        return null
      }

      res = await doRequest()
    }
    else {
      showMsg('登录过期，请重新登录')
      store.setToken('')
      store.setRefreshToken('')
      return null
    }

    if (res.status !== 401) {
      return res
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          await refreshTokenIfNeeded()
        }
        finally {
          refreshPromise = null
        }
      })()
    }

    try {
      await refreshPromise
    }
    catch (e) {
      console.error('刷新 token 失败', e)
      showMsg('登录过期，请重新登录')
      store.setToken('')
      store.setRefreshToken('')
      router.push('/auth/login')
      return null
    }

    res = await doRequest()
    return res
  }
  else {
    const res = await fetch(`${apiUrl}${url}`, {
      method: object.method,
      headers: object.headers,
      body: JSON.stringify(object.body),
    })
    return res
  }
}

export { requestFunc }
