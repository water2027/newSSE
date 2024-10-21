<!-- eslint-disable vue/html-self-closing -->
<template>
  <div
    id="root"
    class="root"
  >
    <header>
      <div class="site-top">
        <div
          v-if="isPC"
          class="top-left"
        ></div>
        <div
          class="title"
          @click="
            $router.push('/');
            changeToMain();
          "
        >
          SSE MARKET
        </div>
        <div
          v-if="isPC"
          class="top-right"
        >
          <div
            class="mode-select"
            @click="changeMode"
          >
            <!-- 改成图标 -->
            {{ mode }}
          </div>
        </div>
      </div>
      <div class="site-header">
        <button
          v-if="!isPC"
          class="hamburgerMenu"
          @click="toggleNav"
        >
          <span />
          <span />
          <span />
        </button>
        <div
          v-if="isPC"
          class="links"
        >
          <router-link
            to="/post"
          >
            发帖
          </router-link>
          <router-link to="/partitions">
            分区
          </router-link>
          <router-link
            to="/course"
            @click="changeToCourse"
          >
            课程专区
          </router-link>
          <router-link to="/feedback">
            反馈
          </router-link>
        </div>
        <div class="search">
          <input
            ref="sinfo"
            placeholder="在 当前分区 搜索..."
            @keydown.enter="search"
          />
          <button @click="search">
            搜
          </button>
          <!-- 改成图标 -->
        </div>
        <div
          v-if="isPC"
          class="account links"
        >
          <router-link
            to="/save"
            @click="changeToSave"
          >
            收藏
          </router-link>
          <router-link
            to="/history"
            @click="changeToHistory"
          >
            发帖历史
          </router-link>
          <router-link to="/notice">
            通知
            <div
              v-if="noticeNum"
              class="notice-num"
            >
              {{ noticeNum }}
            </div>
          </router-link>
          <router-link to="/options">
            {{ userInfo.name }}
          </router-link>
        </div>
        <button
          v-if="!isPC"
          class="toPost"
          @click="changeToPost"
        >
          +
        </button>
      </div>
    </header>
    <!-- <header>
      <button v-if="isPC" @click="returnToTop">&uarr;</button>
    </header> -->
    <main>
      <link-list
        v-if="!isPC && navIsOpen"
        @change-path="changePathHandler"
        @click="toggleNav"
      />
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition
            name="bounce"
            mode="out-in"
          >
            <component
              :is="Component"
              @send-partition="sendPartition"
            />
          </transition>
        </router-view>
      </div>
      <heat-list v-if="isPC && !heatPostsIsHidden" />
      <suspended-ball
        v-if="!isPC"
        :mode="mode"
        :change-mode="changeMode"
        :return-to-top="returnToTop"
      />
    </main>
  </div>
</template>
<script setup>
import { computed, onMounted, provide, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getNoticesNum } from '@/api/notice/notice';

import HeatList from '@/components/HeatList.vue';
import LinkList from '@/components/LinkList.vue';
import SuspendedBall from '@/components/SuspendedBall.vue';

const route = useRoute();

const userInfo = inject('userInfo');

const mode = ref(document.body.className);
const changeMode = () => {
  const currentMode = document.body.className;
  document.body.className = currentMode == 'light-mode' ? 'dark-mode' : 'light-mode';
  mode.value = currentMode == 'light-mode' ? 'dark-mode' : 'light-mode';
  localStorage.setItem('mode', document.body.className);
};

const returnToTop = () => {
  document.body.scrollTop = 0;
};

const router = useRouter();

const isPC = computed(() => {
  return windowWidth.value > 768;
});
provide('isPC', isPC);
const windowWidth = ref(window.innerWidth);
const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

/**
 * @description 发帖和看帖的时候隐藏热榜
 */
const heatPostsIsHidden = computed(() => {
  return /^\/post/.test(route.fullPath);
});

const noticeNum = ref('');
const reduceNoticeNum = () => {
  noticeNum.value--;
};
provide('noticeNum', {
  noticeNum,
  reduceNoticeNum,
});
const notices = ref({});
provide('notices', notices);

const partition = ref('主页');
provide('partition', partition);
const searchinfo = ref('');
provide('searchinfo', searchinfo);
const searchsort = ref('home');
provide('searchsort', searchsort);
const changeToMain = () => {
  partition.value = '主页';
  searchinfo.value = '';
  searchsort.value = 'home';
};
const changeToCourse = () => {
  partition.value = '课程专区';
  searchinfo.value = '';
  searchsort.value = 'home';
};
const changeToSave = () => {
  partition.value = '收藏';
  searchinfo.value = '';
  searchsort.value = 'save';
};
const changeToHistory = () => {
  partition.value = '历史';
  searchinfo.value = '';
  searchsort.value = 'history';
};
const changeToPost = () => {
  router.push('/post');
};
const changePathHandler = path => {
  switch (path) {
    case 'main':
      changeToMain();
      break;
    case 'save':
      changeToSave();
      break;
    case 'history':
      changeToHistory();
      break;
    case 'course':
      changeToCourse();
      break;
    default:
      break;
  }
};

/**
 * 搜索功能，不使用v-model绑定，略微减小性能消耗。
				它的值是目标元素而不是元素里的值
        （这点都省你怎么不直接从html写起？）
 */
const sinfo = ref(null);
const search = () => {
  searchinfo.value = sinfo.value.value;
  sinfo.value.value = '';
  router.push('/');
};

const navIsOpen = ref(true);
/**
 * @description 移动端展开导航栏
 */
const toggleNav = () => {
  if (!isPC.value) {
    navIsOpen.value = !navIsOpen.value;
  }
};

/**
 * @description 这是分区页面的回调函数，分区页面选择分区后调用
 * @param p 分区名
 */
const sendPartition = p => {
  partition.value = p;
  searchinfo.value = '';
  searchsort.value = 'home';
};

/**
 * @description 获取通知数量
 */
const getNoticesNumFunc = async () => {
  const temp = await getNoticesNum();
  notices.value = temp;
  noticeNum.value = temp.unreadTotalNum;
};

onMounted(async () => {
  mode.value = localStorage.getItem('mode') || 'light-mode';
  document.body.className = mode.value;
  if (!isPC.value) {
    navIsOpen.value = false;
  }
  // 刷新时跳转到获取对应界面数据
  // 之后考虑在组件加载时获取
  const baseUrl = import.meta.env.BASE_URL;
  const path = window.location.pathname.replace(baseUrl, '');
  changePathHandler(path)
  getNoticesNumFunc();
  window.addEventListener('resize', updateWidth);
});
</script>

<style lang="scss" scoped>
header {
  position: sticky;
  top: 0;
  width: 100%;
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
    width: 8rem;
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 0 0.8rem;
  }

  .mode-select {
    color: #eee;
    cursor: pointer;
    font-family: 'Ubuntu', Arial, Helvetica, sans-serif;
  }
}

.site-header {
  display: flex;
  background: #ffffffa0;
  backdrop-filter: blur(2px);
  height: 2.5em;
  color: #444;
  align-items: center;
  padding: 0 1em;

  .links {
    a {
      position: relative;
      display: inline-block;
      padding: 0.25em 0.5em;
      border-radius: 4px;
      margin-right: 0.2em;
      text-decoration: none;
      transition: all 0.2s;
    }

    a:hover,
    .router-link-active {
      background: #444;
      color: #fff !important;
    }

    a:link,
    a:visited {
      color: #444;
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
      font-size: 13px;
      padding: 2px 4px;
    }
  }

  .search {
    flex: 1;
    margin: 0 1em;
    text-align: center;

    input {
      width: 100%;
      max-width: 48em;
      height: 2em;
      padding: 0 0.75em;
      border: 1px solid #ccc;
      border-radius: 5px;
      line-height: 0.8;
      vertical-align: middle;
    }

    button {
      background: unset;
      height: 2em;
      width: 2em;
      padding: 0;
      margin: 0 0 0 -2em;
      vertical-align: middle;
    }
  }
}

.dark-mode .site-header {
  background: #000000a0;
  color: #ddd;

  .links {
    a:hover,
    .router-link-active {
      background: #66666680;
    }

    a:link,
    a:visited {
      color: #ddd;
    }

    .notice-num {
      background: #ff5050;
    }
  }

  .search {
    input {
      background: #88888880;
      border: 1px solid #ccc;
      color: #ccc;
    }

    input::placeholder {
      color: #aaa;
    }

    button {
    }
  }
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
}

p {
  text-indent: 2rem;
}

.search {
  height: 30px;
}

.search button {
  overflow: hidden;
}

main {
  width: 100%;
  padding: 0;
  margin-top: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  /* 50% {
		transform: scale(1.05);
	} */
  100% {
    transform: scale(1);
  }
}

/* 大屏幕样式 >768px */
@media screen and (min-width: 768px) {
  #root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .none {
    height: 15vh;
  }

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
  .hamburgerMenu {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  .hamburgerMenu span {
    width: 100%;
    height: 3px;
    background-color: #333;
    border-radius: 2px;
    transition: all 0.3s;
    position: relative;
  }

  main {
    padding: 0;
  }

  .content {
    width: 100%;
    margin: 0;
    border: none;
  }

  .search {
    width: 90%;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-top: 15%;
  }

  .search button {
    padding-top: 0;
    padding-bottom: 0;
    height: 150%;
    width: 25%;
  }

  .toPost {
    margin-top: auto;
    margin-bottom: auto;
    margin-left: auto;
    
    font-size: 2rem;
    color: var(--color-to-post);
    text-decoration: none;
    border: 1px solid var(--color-to-post-border);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-to-post-bg);
    text-align: center;
  }
}
</style>
