<script setup lang="ts">
import {
  onBeforeMount,
  onUnmounted,
} from 'vue'
import { getInfo } from './api/info/getInfo'
import { userLogin } from './api/LoginAndRegister/login'
import { useUserStore } from './store/userStore'

const { setUserInfo, token, refreshToken, setToken, setRefreshToken } = useUserStore()

/**
 * @description 离开页面时，如果localStorage.rememberMe不存在，删除token
 */
function handleBeforeUnload() {
  localStorage.removeItem('token')
}

onBeforeMount(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  const hasLegacyCreds = !!(localStorage.email && localStorage.password)
  const hasToken = !!token.value
  const hasRefreshToken = !!refreshToken.value

  // 过渡到双Token制用：仅在旧 email/password 自动登录成功后再清理它们
  if (hasLegacyCreds && !hasToken && !hasRefreshToken) {
    try {
      const email = localStorage.email
      const password = localStorage.password
      if (email && password) {
        const result = await userLogin(email, password)
        if (result) {
          localStorage.setItem('rememberMe', 'true')

          setToken(result.token)
          setRefreshToken(result.refresh_token)
          const info = await getInfo()
          if (info && info.userID && info.userID !== 0)
            setUserInfo(info)

          localStorage.removeItem('email')
          localStorage.removeItem('password')
          return
        }
      }
    }
    catch (e) {
      console.error('兼容旧版本自动登录失败', e)
    }
    // 登录失败时保留，用户仍可手动登录
  }

  // 清理旧版本信息（已有 token 或完全未登录的情况）
  if (hasLegacyCreds) {
    localStorage.removeItem('email')
    localStorage.removeItem('password')
  }

  // 未登录不尝试获取用户信息
  if (!hasToken && !hasRefreshToken)
    return

  try {
    const info = await getInfo()
    if (info && info.userID && info.userID !== 0) {
      setUserInfo(info)
    }
  }
  catch {
    // 优先使用 refresh_token 静默续期
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <router-view />
</template>
