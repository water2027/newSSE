<script setup>
import {
  onBeforeMount,
  onUnmounted,
  provide,
  ref,
} from 'vue'

import { getInfo } from './api/info/getInfo'

import { userLogin } from './api/LoginAndRegister/login'
import { showMsg } from './components/MessageBox'

const userInfo = ref({})
provide('userInfo', userInfo)
const isLogin = ref(false)
/***
 * @description 发送登录成功事件，成功了就获取用户信息，如果记住我就保存用户信息并刷新（移动端bug）
 * @param {Boolean} success 登录是否成功
 * @returns {void}
 */
async function sendLoginSuccess(success) {
  if (!success)
    return
  try {
    const info = await getInfo()
    userInfo.value = Object.freeze(info)
    isLogin.value = success
    if (localStorage.rememberMe) {
      localStorage.setItem('userInfo', JSON.stringify(info))
    }
  }
  catch (e) {
    showMsg(`获取用户信息失败：${e}`)
  }
}

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
    const loginSuccess = await userLogin(email, password)
    if (loginSuccess) {
      const info = await getInfo()
      userInfo.value = Object.freeze(info)
      isLogin.value = true
    }
  }
  catch (e) {
    showMsg(`自动登录失败：${e}`)
  }
}

onBeforeMount(async () => {
  /**
   * @description 页面加载时，如果localStorage.rememberMe存在，自动登录
   */
  if (localStorage.rememberMe) {
    await autoLogin()
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <!-- <HomeViewVue v-if="isLogin" />
  <LoginViewVue
    v-else
    @send-login-success="sendLoginSuccess"
  /> -->
  <router-view />
</template>
