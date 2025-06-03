import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'

const apiUrl = import.meta.env.VITE_API_BASE_URL

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
    const { token } = useUserStore()
    if (!token.value) {
      showMsg('登录过期，请重新登录')
      window.location.reload()
      return null
    }
    const finalUrl = `${apiUrl}${url}?${new URLSearchParams(object.query).toString()}`
    const res = await fetch(`${finalUrl}`, {
      method: object.method,
      headers: {
        ...object.headers,
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(object.body),
    })
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
