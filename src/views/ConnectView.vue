<script setup lang="ts">
import type { OAuth2Info } from '@/api/oauth2/oauth2'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllInfo } from '@/api/info/getInfo'
import { authorizeOAuth2App, checkOAuth2App } from '@/api/oauth2/oauth2'
import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()
const { isLogin, userInfo } = useUserStore()

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

// 用户基本信息
const userBasicInfo = ref({
  avatarURL: '',
  name: '',
  intro: '',
  email: '',
})

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
    error.value = '暂不支持'
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
 * 获取用户基本信息
 */
async function fetchuserBasicInfo() {
  try {
    const detailInfo = await getAllInfo(userInfo.phone)
    userBasicInfo.value = {
      avatarURL: detailInfo.avatarURL,
      name: detailInfo.name,
      intro: detailInfo.intro,
      email: detailInfo.email,
    }
  }
  catch (err) {
    console.error('获取用户基本信息出错:', err)
    userBasicInfo.value = {
      avatarURL: userInfo.avatarURL,
      name: userInfo.name,
      intro: '',
      email: userInfo.email,
    }
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
    window.location.href = result.redirect_url
  }
  catch (err) {
    loading.value = false
    showMsg(err instanceof Error ? err.message : '授权失败')
  }
}

/**
 * 取消授权
 */
function cancelAuthorize(){
  // 暂先返回三方界面
  let ref = ''
  if (document.referrer.length > 0) ref = document.referrer
  try {
    if (ref.length == 0 && opener.location.href.length > 0)
      ref = opener.location.href
  } catch (e) {}

 window.location.href = ref
}

onMounted(async () => {
  // 检查用户是否已登录
  if (!isLogin.value) {
    const currentUrl = window.location.href
    router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
    return
  }

  if (getOAuth2Params()) {
    await Promise.all([
      checkAppInfo(),
      fetchuserBasicInfo(),
    ])
  }
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
        授权过程出错
      </div>
      <div class="mb-6 text-gray-600">
        {{ error }}
      </div>
      <button
        class="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
        @click="router.push('/')"
      >
        返回首页
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

      <div v-if="appInfo.description" class="mt-2 text-center text-m text-gray-600">
        {{ appInfo.description }}
      </div>

      <!-- 权限说明 -->
      <div class="mt-4 rounded-lg bg-gray-50 p-4">
        <div class="mb-2 text-m text-gray-700">
          <strong>{{ appInfo.app_name }}</strong> 希望：
        </div>
        <div class="text-m text-gray-600">
          {{ scopeDescriptions[oauth2Params.scope] || '访问您的信息' }}
        </div>
      </div>

      <!-- 用户基本信息卡片 -->
      <div v-if="oauth2Params.scope === 'read_basic'" class="mb-6 rounded-lg bg-gray-50 p-4">
        <div class="flex items-center space-x-3">
          <img
            :src="userBasicInfo.avatarURL || '/default-avatar.svg'"
            class="h-12 w-12 border-2 border-gray-200 rounded-full object-cover"
          >
          <div class="min-w-0 flex-1">
            <div class="truncate text-m text-gray-900 font-medium">
              {{ userBasicInfo.name || '未设置昵称' }}
            </div>
            <div v-if="userBasicInfo.intro" class="text-sm text-gray-600">
              {{ userBasicInfo.intro }}
            </div>
            <div class="truncate text-sm text-gray-500">
              {{ userBasicInfo.email }}
            </div>
          </div>
        </div>
      </div>

      <!-- 授权按钮 -->
      <div class="mt-6 space-y-3">
        <button
          :disabled="loading"
          class="h-[48px] w-full flex cursor-pointer items-center justify-center border-0 rounded-[24px] bg-[#eb6b26] text-lg text-white transition-colors disabled:bg-zinc-600 hover:bg-[#ff7e3b]"
          @click="handleAuthorize"
        >
          {{ loading ? '授权中...' : '允许' }}
        </button>
        <button
          class="h-[48px] w-full flex cursor-pointer items-center justify-center border-0 rounded-[24px] bg-transparent text-lg transition-colors disabled:bg-zinc-600"
          @click="cancelAuthorize"
        >
          取消
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
