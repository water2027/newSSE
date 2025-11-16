<script setup lang="ts">
import {
  onBeforeMount,
  onUnmounted,
  ref,
} from 'vue'
import { getInfo } from './api/info/getInfo'
import { userLogin } from './api/LoginAndRegister/login'
import { useUserStore } from './store/userStore'

const { setUserInfo, token, refreshToken, setToken, setRefreshToken } = useUserStore()

const isUserReady = ref(false)

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

  try {
    // 过渡到双Token制用
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

    if (hasToken || hasRefreshToken) {
      try {
        const info = await getInfo()
        if (info && info.userID && info.userID !== 0) {
          setUserInfo(info)
        }
      }
      catch {
        // 优先使用 refresh_token 静默续期
      }
    }
  }
  finally {
    isUserReady.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <router-view v-if="isUserReady" />
</template>
