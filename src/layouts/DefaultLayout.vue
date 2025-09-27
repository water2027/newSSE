<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
} from 'vue'

import { useRoute, useRouter } from 'vue-router'

import ModeButton from '@/components/ModeButton.vue'
import { useChat } from '@/composables/useChat'
import { useNewPostsStore } from '@/store/newPostsStore'
import { useNoticeStore } from '@/store/noticeStore'
import { showSnackbar } from '@/utils/snackbar'

const HeatList = defineAsyncComponent(
  () => import('@/components/HeatList.vue'),
)
const BottomNavbar = defineAsyncComponent(
  () => import('@/components/BottomNavbar.vue'),
)
const PcHeader = defineAsyncComponent(
  () => import('@/components/PcHeader.vue'),
)

const PartitionList = defineAsyncComponent(() => import('@/components/PartitionList.vue'))
const MobileHeader = defineAsyncComponent(() => import('@/components/MobileHeader.vue'))
const route = useRoute()
const router = useRouter()

const { noticeNum, refreshNoticeNum } = useNoticeStore()
const { startPolling, stopPolling, newPostsNotification, hideNotification } = useNewPostsStore()

const { connect, disconnect, chatNum } = useChat()

const windowWidth = ref(window.innerWidth)
const isPC = computed(() => {
  return windowWidth.value > 768
})
provide('isPC', isPC)
function updateWidth() {
  windowWidth.value = window.innerWidth
}

const isHomePage = computed(() => {
  const url = route.path.split('/')[1]
  const allows = ['', 'partition']
  if (allows.includes(url)) {
    return true
  }
  return false
})

/**
 * @description 发帖和看帖的时候隐藏热榜
 */
const heatPostsIsHidden = computed(() => {
  return /^\/(?:post|shop|myproducts|sale|productdetail)/.test(route.fullPath)
})

const { headerHeight, handleTouchStart, handleTouchEnd } = (() => {
  const headerHeight = ref('3em')
  let startY = 0
  let endY = 0
  const handleTouchStart = (event: TouchEvent) => {
    startY = event.touches[0].clientY
  }
  const handleTouchEnd = (event: TouchEvent) => {
    endY = event.changedTouches[0].clientY
    if (Math.abs(startY - endY) < 10)
      return
    if (startY > endY) {
      headerHeight.value = '0'
    }
    else {
      headerHeight.value = '3em'
    }
  }

  return {
    headerHeight,
    handleTouchStart,
    handleTouchEnd,
  }
})()

onMounted(() => {
  connect()
  refreshNoticeNum()
  window.addEventListener('resize', updateWidth)
  if (!isPC.value) {
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
  }
  // 启动新帖子轮询
  startPolling()
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
  if (!isPC.value) {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchend', handleTouchEnd)
  }
  // 停止新帖子轮询
  stopPolling()
  disconnect()
})

// 监听新帖子通知变化，显示Snackbar
watch(() => newPostsNotification.updatedAt, (updatedAt: number) => {
  if (updatedAt > 0 && newPostsNotification.isVisible) {
    const isCurrentlyOnHomePage = route.path === '/' || route.path === '/partition'

    showSnackbar({
      id: 'new-posts-notification',
      message: `有 ${newPostsNotification.newPostIds.length} 条未查看的新帖子`,
      actionText: isCurrentlyOnHomePage ? '去查看' : '去首页查看',
      type: 'info',
      position: isPC.value ? 'top' : 'bottom', // PC端在上方，移动端在下方
      alwaysShow: true,
      onAction: () => {
        hideNotification()
        router.push({ path: '/', query: { refresh: Date.now() } })
      },
      onClose: () => {
        hideNotification()
      },
    })
  }
})
</script>

<template>
  <div
    class="root w-full"
  >
    <header>
      <div class="site-top">
        <div class="top-left" />
        <RouterLink
          class="title"
          to="/"
        >
          SSE MARKET
        </RouterLink>
        <div class="top-right">
          <ModeButton />
        </div>
      </div>
      <template v-if="isPC">
        <PcHeader :unread-chat-num="chatNum" :unread-notice-num="noticeNum.unreadTotalNum" />
      </template>
      <template v-else>
        <MobileHeader :style="{ height: headerHeight }" />
      </template>
    </header>
    <template v-if="!isPC">
      <BottomNavbar
        :notice-num="noticeNum.unreadTotalNum"
        :chat-num="chatNum"
      />
    </template>
    <main class="mt-2 w-full flex flex-row p-0">
      <div class="content">
        <template
          v-if="!isPC && isHomePage"
        >
          <PartitionList />
        </template>
        <router-view v-slot="{ Component }">
          <KeepAlive include="HomeView,PartitionView">
            <component :is="Component" :key="route.fullPath" />
          </KeepAlive>
        </router-view>
      </div>
      <HeatList v-if="isPC && !heatPostsIsHidden" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1999;
}

.site-top {
  display: flex;
  background: #0f172a;

  .title {
    flex: 1;
    color: #eee;
    text-align: center;
    margin: 0.25em;
    margin-left: 0.5em;
    letter-spacing: 0.25em;
    font-size: 18px;
    font-family: 'Ubuntu Mono', Arial, Helvetica, sans-serif;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .top-left,
  .top-right {
    width: 0;
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 0 0.8rem;
  }
}

.content {
  width: 100%;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 大屏幕样式 >768px */
@media screen and (min-width: 768px) {
  .content {
    padding-left: 5%;
    padding-right: 5%;
  }
}
</style>
