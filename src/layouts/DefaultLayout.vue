<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from 'vue'

import { useRoute } from 'vue-router'
import { getChatNotice } from '@/api/chat/chat'

import ModeButton from '@/components/ModeButton.vue'
import { useNoticeStore } from '@/store/noticeStore'
import { useUserStore } from '@/store/userStore'

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

const { userInfo } = useUserStore()
const { noticeNum, refreshNoticeNum } = useNoticeStore()

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
  return /^\/post/.test(route.fullPath)
})

const chatNum = ref(0)

provide('chatNum', chatNum)

async function updateChatNum(n: number | undefined) {
  if (n !== undefined) {
    chatNum.value = n
  }
  else {
    const temp = await getChatNotice(userInfo.userID)
    chatNum.value = temp.data.noticeNum
  }
}

provide('updateChatNum', updateChatNum)

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
  refreshNoticeNum()
  updateChatNum(undefined)
  window.addEventListener('resize', updateWidth)
  if (!isPC.value) {
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
  }
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
  if (!isPC.value) {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<template>
  <div
    class="root"
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
        <MobileHeader :style="{ height: headerHeight }" :is-home-page="isHomePage" />
      </template>
    </header>
    <main>
      <template v-if="!isPC">
        <BottomNavbar
          :notice-num="noticeNum.unreadTotalNum"
        />
      </template>
      <div class="content">
        <template
          v-if="!isPC && isHomePage"
        >
          <PartitionList />
        </template>
        <router-view v-slot="{ Component }">
          <KeepAlive include="HomeView">
            <component :is="Component" :key="route.fullPath" />
          </KeepAlive>
        </router-view>
      </div>
      <HeatList v-if="isPC && !heatPostsIsHidden" />
      <div class="h-13vw" />
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
  margin-bottom: 13vh !important;
  display: flex;
  flex-direction: column;
  align-items: center;
}

main {
  width: 100%;
  padding: 0;
  margin-top: 10px;
}

/* 大屏幕样式 >768px */
@media screen and (min-width: 768px) {
  main {
    display: flex;
    flex-direction: row;
  }

  .content {
    margin-left: 5%;
    margin-right: 5%;
    width: 100%;
    height: auto;
  }

  h2 {
    margin-left: auto;
    margin-right: auto;
    padding: 10px;
  }

  footer {
    display: none;
  }
}

/* 小屏幕样式 <768px */
@media screen and (max-width: 768px) {
  main {
    padding: 0;
  }

  .content {
    width: 100%;
    margin: 0;
    border: none;
  }
}
</style>
