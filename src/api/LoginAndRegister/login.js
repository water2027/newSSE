import { requestFunc } from '../req'
import { setPassword } from './utils'

// 后端那边是七天过期，以防万一7天减去1小时
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000 - 1000 * 60 * 60
function setItemWithExpiry(key, value, ttl) {
  const now = new Date()
  const item = {
    value,
    expiry: now.getTime() + ttl,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

/**
 *
 * @param {string} userEmail
 * @param {string} userPassword 未加密的密码
 * @returns {Promise<string>} token
 */
async function userLogin(userEmail, userPassword) {
  try {
    const res = await requestFunc(`/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email: userEmail,
        password: setPassword(userPassword, '16bit secret key'),
      },
    }, false)
    const data = await res.json()
    const token = data.data?.token
    if (token) {
      setItemWithExpiry('token', data.data.token, SEVEN_DAYS_IN_MS)
      return token
    }
    else {
      return ''
    }
  }
  catch (e) {
    console.error(e)
    return ''
  }
}

export { userLogin }
