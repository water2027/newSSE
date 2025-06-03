import { requestFunc } from '../req'

export interface getInfoResponse {
  code: number
  data: {
    user: UserInfo
  } | null
}

export interface UserInfo {
  userID: number
  name: string
  avatarURL: string
  phone: string
  email: string
  identity: string
}

/**
 * @description 获取用户的邮箱、身份、用户名、手机
 *              只有登录的时候使用
 *
 */
async function getInfo(): Promise<UserInfo> {
  try {
    const res = await requestFunc(
      `/auth/info`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      true,
    )
    const data = await res!.json()
    return data.data.user
  }
  catch (e) {
    console.error(e)
    return {
      userID: 0,
      name: '',
      avatarURL: '',
      phone: '',
      email: '',
      identity: '',
    }
  }
}

export interface AllInfo {
  avatarURL: string
  ban: string
  email: string
  intro: string
  name: string
  phone: string
  punishnum: number
  score: number
  userID: number
  emailpush: boolean
}

/**
 * @description 返回更详细的信息，个人信息页面使用
 * @param {string} userTelephone
 */
async function getAllInfo(userTelephone: string): Promise<AllInfo> {
  try {
    const res = await requestFunc(
      `/auth/getInfo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { phone: userTelephone },
      },
      true,
    )
    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error(e)
    return {
      avatarURL: '',
      ban: '',
      email: '',
      intro: '',
      name: '',
      phone: '',
      punishnum: 0,
      score: 0,
      userID: 0,
      emailpush: false,
    }
  }
}

async function getInfoById(userID: number) {
  try {
    const res = await requestFunc(
      `/auth/getInfo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { userID },
      },
      true,
    )
    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error(e)
  }
}

export { getAllInfo, getInfo, getInfoById }
