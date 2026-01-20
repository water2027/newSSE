<script lang="ts" setup>
import { computed, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const props = defineProps<{
  unreadNoticeNum: number
  unreadChatNum: number
  menuOpen?: boolean
}>()

const emit = defineEmits<{
  'update:menuOpen': [value: boolean]
}>()

const router = useRouter()
const sinfo = useTemplateRef('sinfo')
const { userInfo } = useUserStore()
const defaultAvatar = `${import.meta.env.BASE_URL}default-avatar.svg`

const isMenuOpen = computed({
  get: () => props.menuOpen ?? true,
  set: (value: boolean) => emit('update:menuOpen', value),
})

// 检查是否可以返回上一页
// 使用performance.navigation或performance.getEntriesByType来检测
const canGoBack = computed(() => {
  // 如果当前路径不是根路径，通常可以返回
  const currentPath = router.currentRoute.value.path
  if (currentPath !== '/') {
    return true
  }
  // 检查是否有历史记录
  return window.history.length > 1
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function goBack() {
  if (canGoBack.value) {
    router.back()
  }
}

function search() {
  const el = sinfo.value as HTMLInputElement
  if (!el || !el.value)
    return
  if (el.value === '年度报告') {
    router.push('/annual2025')
    el.value = ''
    return
  }
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === '/partition/课程交流'
    // 如果先搜索一次然后返回，再次搜索时path会被URI编码
    || currentRoute.path === `/partition/${encodeURIComponent('课程交流')}`
    || currentRoute?.query?.partition === '课程交流'
    || currentRoute?.query?.partition === encodeURIComponent('课程交流')) {
    router.push(`/search?sinfo=${encodeURIComponent(el.value)}&partition=课程交流`)
  }
  else {
    router.push(`/search?sinfo=${encodeURIComponent(el.value)}`)
  }
  el.value = ''
}
</script>

<template>
  <!-- PWA模式下的常驻侧边栏菜单 -->
  <div class="pwa-sidebar" :class="{ collapsed: !isMenuOpen }">
    <div class="sidebar-header" />
    <div class="sidebar-links">
      <router-link to="/" :class="{ 'router-link-active': router.currentRoute.value.name === 'Home' }" active-class="">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=59809&format=png&color=000000);" />
        <span>首页</span>
      </router-link>
      <router-link to="/post">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=89802&format=png&color=000000); background-size: 90% 90%;" />
        <span>发帖</span>
      </router-link>
      <router-link to="/partitions">
        <div class="icon" style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729566876258317319_icons8-top-wide-sidebar-followed-by-partition-at-bottom-24.png); background-size: 80% 80%;" />
        <span>分区</span>
      </router-link>
      <router-link to="/course">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=85872&format=png&color=000000); background-size: 95% 95%;" />
        <span>课程专区</span>
      </router-link>
      <router-link to="/feedback">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=85500&format=png&color=000000);" />
        <span>反馈</span>
      </router-link>
      <router-link to="/shop">
        <div class="icon" style="background-image: url(https://img.icons8.com/ios-filled/100/shopping-bag.png);" />
        <span>闲置</span>
      </router-link>
      <router-link to="/rating">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=60985&format=png&color=000000);" />
        <span>打分</span>
      </router-link>
      <div class="sidebar-divider" />
      <router-link to="/save">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=85185&format=png&color=000000);" />
        <span>收藏</span>
      </router-link>
      <router-link to="/history">
        <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=83976&format=png&color=000000); background-size: 90% 90%;" />
        <span>历史</span>
      </router-link>
      <router-link to="/notice">
        <div class="icon-wrapper">
          <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=32058&format=png&color=000000);" />
          <div v-if="unreadNoticeNum" class="notice-num">
            {{ unreadNoticeNum }}
          </div>
        </div>
        <span>通知</span>
      </router-link>
      <div class="sidebar-bottom">
        <router-link to="/chat">
          <div class="icon-wrapper">
            <div class="icon" style="background-image: url(https://img.icons8.com/?size=100&id=83142&format=png&color=000000);" />
            <div v-if="unreadChatNum" class="notice-num">
              {{ unreadChatNum }}
            </div>
          </div>
          <span>私信</span>
        </router-link>
        <router-link to="/options">
          <div class="user-avatar-icon">
            <img :src="userInfo.avatarURL || defaultAvatar" alt="avatar">
          </div>
          <span>{{ userInfo.name }}</span>
        </router-link>
      </div>
    </div>
  </div>

  <!-- PWA模式下的搜索Header -->
  <div class="site-header pwa-header" :class="{ 'menu-collapsed': !isMenuOpen }">
    <button type="button" class="menu-button" @click="toggleMenu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
    <button type="button" class="back-button" :disabled="!canGoBack" @click="goBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div class="search-container">
      <form class="search" @submit.prevent="search">
        <input
          id="sinfo"
          ref="sinfo"
          name="sinfo"
          placeholder="搜索..."
        >
        <button type="submit">
          <div
            class="icon"
            style="
								background-image: url(https://img.icons8.com/?size=100&id=131&format=png&color=000000);
								background-size: 75% 75%;
								background-position: 0px 0px;
							"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* PWA模式样式 */
.pwa-sidebar {
  position: fixed;
  top: 3em;
  left: 0;
  width: 280px;
  height: calc(100vh - 3em);
  background: #ffffffa0;
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1998;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.pwa-sidebar.collapsed {
  transform: translateX(-100%);
}

.site-header.pwa-header {
  display: flex;
  background: #ffffffa0;
  backdrop-filter: blur(10px);
  height: 3em;
  color: #444;
  align-items: center;
  padding: 0 1em;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
  width: 100%;
  justify-content: flex-start;
  gap: 0.5em;
  position: relative;
  z-index: 1999;
}

.site-header.pwa-header .search-container {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  justify-content: center;
}

.site-header.pwa-header.menu-collapsed .search-container {
  margin-left: 0;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #444;
  flex-shrink: 0;
}

.menu-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #444;
  flex-shrink: 0;
}

.back-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.back-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.site-header.pwa-header .search-container .search {
  flex: 1;
  margin: 0 1em;
  text-align: center;
  max-width: 48em;
}

.site-header.pwa-header .search input {
  width: 100%;
  max-width: 48em;
  height: 2em;
  padding: 0 2em 0 0.75em;
  border: 1px solid #ccc;
  border-radius: 5px;
  line-height: 0.8;
  vertical-align: middle;
}

.site-header.pwa-header .search button {
  background: unset;
  height: 1em;
  width: 1em;
  padding: 0;
  margin: 0 0 0 -1.5em;
  vertical-align: middle;
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #444;
}

.sidebar-links {
  flex: 1;
  padding: 0.5em 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-links a {
  display: flex;
  align-items: center;
  padding: 0.75em 1.5em;
  text-decoration: none;
  color: #444;
  transition: background-color 0.2s;
  position: relative;
  gap: 0.75em;
}

.sidebar-links a:hover {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-links a.router-link-active:not([active-class='']) {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-links a .icon-wrapper {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-links a .icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.sidebar-links a .user-avatar-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-links a .user-avatar-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar-links a span {
  flex: 1;
}

.sidebar-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0.5em 1.5em;
}

.notice-num {
  position: absolute;
  top: -4px;
  right: -3px;
  border-radius: 9px;
  background: #ff5050;
  color: #eee;
  height: 1rem;
  text-align: center;
  line-height: 1;
  font-size: 11px;
  padding: 2px 4px;
  z-index: 10;
  min-width: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 20px;
  height: 20px;
  background-size: cover;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 0px 3px;
  display: inline-block;
}

/* 暗色模式 */
.dark-mode .pwa-sidebar {
  background: #000000a0;
  color: #ddd;
}

.dark-mode .site-header.pwa-header {
  background: #000000a0;
  color: #ddd;
}

.dark-mode .menu-button {
  color: #ddd;
}

.dark-mode .menu-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode .back-button {
  color: #ddd;
}

.dark-mode .back-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode .site-header.pwa-header .search input {
  background: #88888880;
  border: 1px solid #ccc;
  color: #ccc;
}

.dark-mode .site-header.pwa-header .search input::placeholder {
  color: #aaa;
}

.dark-mode .sidebar-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .sidebar-header h3 {
  color: #ddd;
}

.dark-mode .sidebar-links a {
  color: #ddd;
}

.dark-mode .sidebar-links a:hover,
.dark-mode .sidebar-links a.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode .sidebar-divider {
  background: rgba(255, 255, 255, 0.1);
}

body.dark-mode .icon {
  filter: invert(1);
}
</style>
