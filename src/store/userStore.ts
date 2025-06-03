import { computed, reactive } from 'vue'

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000 - 1000 * 60 * 60

export interface UserInfo {
  userID: number
  name: string
  avatarURL: string
  phone: string
  email: string
  identity: string
}

interface TokenInfo {
  value: string
  expiry: number
}

const userInfo = reactive<UserInfo>({
  userID: 0,
  name: '',
  avatarURL: '',
  phone: '',
  email: '',
  identity: '',
})
const tokenInfo = reactive<TokenInfo>({
  value: '',
  expiry: 0,
})

const token = computed(() => {
  const now = new Date()
  if (now.getTime() > tokenInfo.expiry) {
    return ''
  }
  return tokenInfo.value
})
const isLogin = computed(() => {
  return token.value.length > 0 && userInfo.userID > 0
})
function setToken(newToken: string) {
  const now = new Date()
  tokenInfo.value = newToken
  tokenInfo.expiry = now.getTime() + SEVEN_DAYS_IN_MS
}

function setUserInfo(newUserInfo: UserInfo) {
  Object.assign(userInfo, newUserInfo)
}
export function useUserStore() {
  return {
    token,
    isLogin,
    userInfo,
    setToken,
    setUserInfo,
  }
}
