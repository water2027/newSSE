import { computed, reactive } from 'vue'

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000 - 1000 * 60 * 60

const userInfo = reactive({})
const tokenInfo = reactive({
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
export function useUserStore() {
  const setToken = (newToken) => {
    const now = new Date()
    tokenInfo.value = newToken
    tokenInfo.expiry = now.getTime() + SEVEN_DAYS_IN_MS
  }

  const setUserInfo = (newUserInfo) => {
    Object.assign(userInfo, newUserInfo)
  }

  const isLogin = computed(() => {
    return Object.keys(userInfo).length > 0 && token.value.length > 0
  })

  return {
    token,
    isLogin,
    userInfo,
    setToken,
    setUserInfo,
  }
}
