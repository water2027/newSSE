import { showMsg } from '@/components/MessageBox'
import { requestFunc } from '../req'
import { setPassword } from './utils'

/**
 * @description
 * @param {string} email
 * @param {string} password1 未加密的密码
 * @param {string} password2 未加密的密码
 * @param {string} valiCode
 * @returns
 */
async function updatePassword(email, password1, password2, valiCode) {
  try {
    const res = await requestFunc(`/auth/modifyPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email,
        password: setPassword(password1, '16bit secret key'),
        password2: setPassword(password2, '16bit secret key'),
        valiCode,
      },
    }, false)
    const data = await res.json()
    return data
  }
  catch (e) {
    console.error(e)
    showMsg('修改密码失败')
  }
}

export { updatePassword }
