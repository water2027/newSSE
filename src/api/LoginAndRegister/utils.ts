import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import pad from 'crypto-js/pad-zeropadding'
import SHA256 from 'crypto-js/sha256'
import { showMsg } from '@/components/MessageBox'
import { requestFunc } from '../req'
/**
 *
 * @param {string} data 待加密数据
 * @param {string} key 密钥，默认为'16bit secret key'
 */
function setPassword(data: string, key: string = '16bit secret key'): string {
  const cypherKey = Utf8.parse(key)
  pad.pad(cypherKey, 4)
  const iv = SHA256(key).toString()
  const cfg = { iv: Utf8.parse(iv) }
  return AES.encrypt(data, cypherKey, cfg).toString()
}

/***
 * @param {string} email
 * @param {0|1} mode 模式，未注册要用0，注册了的要用1
 */
async function sendCode(email: string, mode: 0 | 1) {
  try {
    const res = await requestFunc(
      `/auth/validateEmail`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email,
          mode,
        },
      },
      false,
    )
    if (!res!.ok) {
      showMsg('发送验证码失败, 请重新获取')
      return null
    }
    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error(e)
    showMsg('发送验证码失败, 请重新获取')
  }
}

export { sendCode, setPassword }
