import { requestFunc } from '../req'
import { setPassword } from './utils'

/**
 *
 * @param {string} userEmail
 * @param {string} userPassword 未加密的密码
 * @returns {Promise<string>} token
 */
async function userLogin(userEmail: string, userPassword: string): Promise<string> {
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
    const data = await res?.json()
    const token = data.data?.token
    if (token) {
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
