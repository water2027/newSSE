import { showMsg } from '@/components/MessageBox'
import { requestFunc } from '../req'
import { setPassword } from './utils'

async function userRegister(
  CDKey,
  email,
  name,
  password1,
  password2,
  valiCode,
) {
  try {
    const res = await requestFunc(
      `/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          CDKey,
          email,
          name,
          password: setPassword(password1, '16bit secret key'),
          password2: setPassword(password2, '16bit secret key'),
          phone: '',
          valiCode,
        },
      },
      false,
    )
    const data = await res.json()
    return data
  }
  catch (e) {
    showMsg(e)
    return null
  }
}

export { userRegister }
