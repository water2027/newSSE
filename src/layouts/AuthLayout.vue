<script setup lang="ts">
import { onUnmounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()

const { isLogin } = useUserStore()

const stop = watchEffect(() => {
  if (isLogin.value) {
    const query = route.query
    if (!query || !('redirect' in query)) {
      router.push('/')
    }
    let redirect = query.redirect as string || '/'
    const otherParams = new URLSearchParams()
    for (const key in query) {
      if (key === 'redirect')
        continue
      const value = query[key] as string
      otherParams.append(key, value)
    }
    if (otherParams.toString()) {
      const separator = redirect.includes('?') ? '&' : '?'
      redirect += separator + otherParams.toString()
    }
    router.push(redirect)
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
