<script setup lang="ts">
import type { OAuth2Info } from '@/api/oauth2/oauth2'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authorizeOAuth2App, checkOAuth2App } from '@/api/oauth2/oauth2'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()
const { isLogin } = useUserStore()

// OAuth2参数
const oauth2Params = ref<OAuth2Info>({
  app_id: '',
  redirect_uri: '',
  response_type: '',
  scope: '',
  state: '',
})

// Oauth2应用信息
const appInfo = ref({
  app_name: '',
  app_icon: '',
  description: '',
})

const loading = ref(false)
const checking = ref(true)
const error = ref('')

// 目前权限只做了read_basic，注意这里改后端也要对应改
const scopeDescriptions: Record<string, string> = {
  read_basic: '访问您在集市的头像、用户名等基本信息',
}

/**
 * 从URL参数中获取OAuth2参数
 */
function getOAuth2Params() {
  const query = route.query

  // 检查必需参数
  const requiredParams = ['appid', 'redirect_uri', 'scope', 'response_type']
  const missingParams = requiredParams.filter(param => !query[param])

  if (missingParams.length > 0) {
    error.value = `缺少必需参数: ${missingParams.join(', ')}`
    checking.value = false
    return false
  }

  oauth2Params.value = {
    app_id: query.appid as string,
    redirect_uri: query.redirect_uri as string,
    response_type: query.response_type as string,
    scope: query.scope as string,
    state: query.state as string || '',
  }

  if (oauth2Params.value.scope !== 'read_basic') {
    error.value = '暂不支持此类授权'
    checking.value = false
    return false
  }

  return true
}

/**
 * 检查应用信息
 */
async function checkAppInfo() {
  try {
    const info = await checkOAuth2App(oauth2Params.value.app_id)
    appInfo.value = info
    checking.value = false
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '获取应用信息失败'
    checking.value = false
  }
}

/**
 * 处理授权
 */
async function handleAuthorize() {
  if (loading.value)
    return

  loading.value = true

  try {
    const result = await authorizeOAuth2App(oauth2Params.value)

    // 跳转到重定向URL
    if (result.redirect_url)
      window.location.href = result.redirect_url
  }
  catch (e) {
    console.log(e)
    loading.value = false
  }
}

onMounted(() => {
  // 检查用户是否已登录
  if (!isLogin.value) {
    const currentUrl = window.location.href
    router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
    return
  }

  if (getOAuth2Params())
    checkAppInfo()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4" :class="{ 'min-h-screen': checking || error }">
    <!-- 加载状态 -->
    <div v-if="checking" class="flex flex-col items-center justify-center">
      <div class="text-gray-600">
        正在验证应用信息...
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center text-center">
      <div class="mb-2 text-lg text-red-600 font-semibold">
        授权出错
      </div>
      <div class="mb-6 text-gray-600">
        {{ error }}
      </div>
      <button
        class="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
        @click="router.back()"
      >
        返回
      </button>
    </div>

    <!-- 授权界面 -->
    <div v-else class="mt-6 max-w-md w-full">
      <div class="mt-5 flex flex-row items-center justify-center">
        <img :src="appInfo.app_icon" class="h-16 w-16 border-2 border-gray-200 rounded-[50%] object-cover">
        <div class="text-sm text-gray-500">
          ----连接----
        </div>
        <img src="/apple-touch-icon.png" class="h-16 w-16 border-2 border-gray-200 rounded-[50%]">
      </div>

      <div class="mt-4 text-center text-2xl font-bold">
        授权给 {{ appInfo.app_name }}
      </div>

      <div v-if="appInfo.description" class="mt-2 text-center text-sm text-gray-600">
        {{ appInfo.description }}
      </div>

      <!-- 权限说明 -->
      <div class="mt-4 rounded-lg bg-gray-50 p-4">
        <div class="mb-2 text-sm text-gray-700">
          <strong>{{ appInfo.app_name }}</strong> 希望：
        </div>
        <div class="text-sm text-gray-600">
          {{ scopeDescriptions[oauth2Params.scope] || '访问您的信息' }}
        </div>
      </div>

      <!-- 授权按钮 -->
      <div class="mt-6 space-y-3">
        <button
          :disabled="loading"
          class="h-12 w-full flex cursor-pointer items-center justify-center border-0 rounded-[20px] bg-[#eb6b26] text-lg text-white transition-colors disabled:bg-zinc-600 hover:bg-[#ff7e3b]"
          @click="handleAuthorize"
        >
          {{ loading ? '授权中...' : '允许' }}
        </button>
      </div>

      <!-- todo
      <div class="mt-4 text-center text-sm text-gray-500">
        授权记录可以在我的界面查看
      </div>
      -->
    </div>
  </div>
</template>
