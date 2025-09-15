<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'

const { noticeNum = 0 } = defineProps<{
  noticeNum?: number
}>()
const route = useRoute()
const selected = computed<string>(() => {
  const path = route.path
  const params = route.params
  if ('name' in params)
    return params.name as string
  return path
})
const chatNum = inject('chatNum')
const displayBool = computed(() =>
  noticeNum === 0 ? 'none' : 'block',
)

// 控制 "我的" 菜单的显示与隐藏
const myMenuVisible = ref(false)
function toggleMyMenu() {
  myMenuVisible.value = !myMenuVisible.value
}
</script>

<template>
  <div
    id="bottomNavBar"
    class="root bottom-nav-bar flex flex-row justify-around"
  >
    <router-link
      class="nav"
      :class="{ selected: selected === '/' }"
      to="/"
    >
      <div
        class="icon"
        style="
					background-image: url(https://img.icons8.com/?size=100&id=59809&format=png&color=000000);
				"
      />
      主页
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected === '/heat' }"
      to="/heat"
    >
      <div
        class="icon"
        style="
					background-image: url(https://img.icons8.com/?size=100&id=60985&format=png&color=000000);
				"
      />
      热榜
    </router-link>
    <router-link
      id="shop"
      class="nav"
      :class="{ selected: selected === '/shop' }"
      to="/shop"
    >
      <div
        class="icon"
        style="
					background-image: url(https://img.icons8.com/ios-filled/100/shopping-bag.png);
				"
      />
      商城
    </router-link>

    <router-link
      id="notice"
      :notice-num="noticeNum"
      :display-bool="displayBool"
      class="nav"
      :class="{ selected: selected === '/notice' }"
      to="/notice"
    >
      <div
        class="icon"
        style="
					background-image: url(https://img.icons8.com/?size=100&id=87048&format=png&color=000000);
				"
      />
      通知
    </router-link>
    <router-link
      id="chat"
      :notice-num="chatNum"
      :display-bool="chatNum === 0 ? 'none' : 'block'"
      class="nav"
      :class="{ selected: selected === '/chat' }"
      to="/chat"
    >
      <div
        class="icon"
        style="
					background-image: url(https://img.icons8.com/?size=100&id=83142&format=png&color=000000);
				"
      />
      私信
    </router-link>
    <!-- 新增 '我的' 下拉菜单 -->
    <div
      class="nav relative overflow-visible"
      @click="toggleMyMenu"
    >
      <div
        class="icon"
        style="
					background-image: url(https://img.icons8.com/?size=100&id=85147&format=png&color=000000);
				"
      />
      我的
      <div
        v-show="myMenuVisible"
        class="my-dropdown"
      >
        <router-link
          class="dropdown-item"
          :class="{ selected: selected === '/options' }"
          to="/options"
        >
          个人信息
        </router-link>
        <router-link
          class="dropdown-item"
          :class="{ selected: selected === '/save' }"
          to="/save"
        >
          我的收藏
        </router-link>
        <router-link
          class="dropdown-item"
          :class="{ selected: selected === '/history' }"
          to="/history"
        >
          发帖历史
        </router-link>
        <router-link
          class="dropdown-item"
          :class="{ selected: selected === '/feedback' }"
          to="/feedback"
        >
          反馈
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected {
  box-shadow:
    var(--color-selected-shadow-first) 0px 30px 60px -12px inset,
    var(--color-selected-shadow-second) 0px 18px 36px -18px inset;
}

.bottom-nav-bar {
  padding: 0;
  height: 80px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  background-color: white;
  transform: translateZ(0);
  isolation: isolate;
}

body.dark-mode .bottom-nav-bar {
  background-color: #2e2e2e;
}

.nav {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid var(--color-border);
  text-align: center;
  text-decoration: none;
  color: var(--color-text);
  position: relative;
  font-size: 0.9em;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

/* "我的" 菜单样式 */
.my-dropdown {
  flex-direction: column;
  display: flex;
  justify-content: space-around;
  position: absolute;
  width: 100%;
  bottom: 85px;
  right: 10px;
  background-color: white;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 96px;
}
body.dark-mode .my-dropdown {
  background-color: #2e2e2e;
}

.dropdown-item {
  flex: 1;
  padding: 10px;
  text-align: center;
  color: var(--color-text);
  text-decoration: none;
  border: 1px solid var(--color-border);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.dropdown-item:hover {
  background-color: var(--color-nav-hover);
}

#notice,
#chat {
  position: relative;
}

#notice::after,
#chat::after {
  content: attr(notice-num);
  position: absolute;
  top: 10%;
  right: 5%;
  transform: translate(0, -50%);
  background-color: rgba(255, 0, 0, 0.75);
  color: white;
  padding: 3px 6px;
  border-radius: 50%;
  font-size: 0.8rem;
}

#notice[notice-num='0']::after,
#chat[notice-num='0']::after {
  display: none;
}

@media screen and (min-width: 768px) {
  .bottom-nav-bar {
    position: relative;
    bottom: auto;
    width: 80%;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .nav {
    padding: 15px;
    flex-direction: column;
  }
}

.icon {
  width: 30px;
  height: 30px; /* Adjust icon size */
  background-size: contain;
  background-repeat: no-repeat;
  margin-bottom: 5px; /* Add space between icon and text */
}
body.dark-mode .icon {
  filter: invert(1);
}
</style>
