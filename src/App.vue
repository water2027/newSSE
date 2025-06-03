<script setup lang="ts">
import {
  onBeforeMount,
  onUnmounted,
} from 'vue'
import { getInfo } from './api/info/getInfo'
import { userLogin } from './api/LoginAndRegister/login'

import { showMsg } from './components/MessageBox'
import { useUserStore } from './store/userStore'

const { setToken, setUserInfo } = useUserStore()

/**
 * @description 离开页面时，如果localStorage.rememberMe不存在，删除token
 */
function handleBeforeUnload() {
  localStorage.removeItem('token')
  if (!localStorage.rememberMe) {
    localStorage.removeItem('email')
    localStorage.removeItem('password')
  }
}

async function autoLogin() {
  const email = localStorage.email
  const password = localStorage.password
  try {
    const token = await userLogin(email, password)
    if (token) {
      setToken(token)
      const info = await getInfo()
      setUserInfo(info)
    }
  }
  catch (e) {
    showMsg(`自动登录失败：${e}`)
  }
}

onBeforeMount(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  if (!localStorage.rememberMe) return
  await autoLogin()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <router-view />
</template>
