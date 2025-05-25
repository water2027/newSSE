<script setup>
import { computed, inject, ref } from 'vue'

const { selected } = defineProps({
  selected: {
    type: String,
    default: 'main',
  },
})
const emit = defineEmits(['changePath'])
const { noticeNum } = inject('noticeNum')
const chatNum = inject('chatNum')
const displayBool = computed(() =>
  noticeNum.value === '0' ? 'none' : 'block',
)

const isPC = inject('isPC')

// 控制 "我的" 菜单的显示与隐藏
const myMenuVisible = ref(false)
function toggleMyMenu() {
  myMenuVisible.value = !myMenuVisible.value
}

function changeTo(path) {
  emit('changePath', path)
}
</script>

<template>
  <div
    id="bottomNavBar"
    class="nav-bar bottom-nav-bar root"
  >
    <router-link
      class="nav"
      :class="{ selected: selected === 'main' }"
      to="/"
      @click="changeTo('main')"
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
      v-if="!isPC"
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
    <!-- 这里显示有问题, 但是实在不想改了. 还是改日吧 -->
    <router-link
      to="/"
      class="nav"
      :class="{ selected: selected === '/high' }"
      @click="changeTo('high-quality')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="3em"
        height="3em"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
        />
      </svg>
      优质贴
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
      class="nav"
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
          @click="changeTo('save')"
        >
          我的收藏
        </router-link>
        <router-link
          class="dropdown-item"
          :class="{ selected: selected === '/history' }"
          to="/history"
          @click="changeTo('history')"
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
  height: 13vw;
  min-height: 80px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  animation: fadeIn 0.5s;
  transition: all 0.3s;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
  background-color: white;
}

body.dark-mode .bottom-nav-bar {
  background-color: #2e2e2e;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.nav-bar {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
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
  bottom: 85px;
  right: 10px;
  background-color: white;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
