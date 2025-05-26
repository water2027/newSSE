<script setup>
import { onUnmounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const router = useRouter()

const { isLogin } = useUserStore()

const stop = watchEffect(() => {
  if (isLogin.value) {
    // 从url的params获取重定向地址
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/'
    router.push(redirectUrl)
  }
},
)
onUnmounted(() => {
  stop()
})
</script>

<template>
  <router-view />
</template>
