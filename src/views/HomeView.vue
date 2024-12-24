<!-- eslint-disable vue/html-self-closing -->
<template>
  <div
    id="root"
    class="root"
  >
    <header>
      <div class="site-top">
        <div class="top-left"></div>
        <div
          class="title"
          @click="
            $router.push('/');
            changeToMain();
          "
        >
          SSE MARKET
        </div>
        <div class="top-right">
          <div
            class="mode-select"
            @click="changeMode"
          >
            <Icon
              v-if="mode === 'dark-mode'"
              icon="material-symbols:dark-mode"
            />
            <Icon
              v-else
              icon="material-symbols:light-mode"
            />
          </div>
        </div>
      </div>
      <div class="site-header">
        <div
          v-if="isPC"
          class="links"
        >
          <router-link to="/post">
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=89802&format=png&color=000000);
								background-size: 90% 90%;
							"
            ></div>
            发帖
          </router-link>
          <router-link to="/partitions">
            <div
              class="icon"
              style="
								background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729566876258317319_icons8-top-wide-sidebar-followed-by-partition-at-bottom-24.png);
								background-size: 80% 80%;
								background-position: 0px 4px;
							"
            ></div>
            分区
          </router-link>
          <router-link
            to="/course"
            @click="changeToCourse"
          >
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=85872&format=png&color=000000);
								background-size: 95% 95%;
								background-position: 0px 3px;
							"
            ></div>
            课程专区
          </router-link>
          <router-link to="/feedback">
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=85500&format=png&color=000000);
								background-position: 0px 3px;
							"
            ></div>
            反馈
          </router-link>
        </div>
        <div
          v-if="!isPC && isHomePage"
          class="lesson"
          style="
						background-image: url(https://img.icons8.com/?size=100&id=kmUrp7YjifpP&format=png&color=000000);
					"
          @click="changeToCourse"
        ></div>
        <div class="search">
          <input
            ref="sinfo"
            placeholder="在 当前分区 搜索..."
            @keydown.enter="search"
          />
          <button @click="search">
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=131&format=png&color=000000);
								background-size: 75% 75%;
								background-position: 0px 0px;
							"
            ></div>
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
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=85185&format=png&color=000000);
							"
            ></div>
            收藏
          </router-link>
          <router-link
            to="/history"
            @click="changeToHistory"
          >
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=83976&format=png&color=000000);
								background-size: 90% 90%;
							"
            ></div>
            发帖历史
          </router-link>
          <router-link to="/notice">
            <div
              class="icon"
              style="
								background-image: url(https://img.icons8.com/?size=100&id=32058&format=png&color=000000);
							"
            ></div>
            通知
            <div
              v-if="noticeNum"
              class="notice-num"
            >
              {{ noticeNum }}
            </div>
          </router-link>
          <router-link to="/chat">
            私信
            <div
              v-if="chatNum"
              class="notice-num"
            >
              {{ chatNum }}
            </div>
          </router-link>
          <router-link to="/options">
            {{ userInfo.name }}
          </router-link>
        </div>
        <router-link
          v-if="!isPC"
          to="/post"
          class="post-button icon bright-icon"
          style="
						width: 30px;
						height: 30px;
						background-position: 1px -1px;
					"
          :style="{
            backgroundImage: `url(${imgs.sendPostButtonIcon})`,
          }"
        >
        </router-link>
      </div>
    </header>
    <main>
      <BottomNavbar
        v-if="!isPC"
        @change-path="changePathHandler"
      />
      <div class="content">
        <div
          v-if="!isPC && isHomePage"
          class="partitions"
        >
          <div
            v-for="(p, index) in partitions"
            :key="index"
            class="partition"
            @click="sendPartition(p.name)"
          >
            <div
              class="bright-icon"
              :style="{
                backgroundImage: 'url(' + p.src + ')',
              }"
            ></div>
            <div class="partition-info">
              {{ p.name }}
            </div>
          </div>
        </div>

        <router-view v-slot="{ Component }">
          <KeepAlive>
            <component
              :is="Component"
              v-if="route.meta.keepAlive"
            />
          </KeepAlive>
          <component
            :is="Component"
            v-if="!route.meta.keepAlive"
            @send-partition="sendPartition"
          />
        </router-view>
      </div>
      <heat-list v-if="isPC && !heatPostsIsHidden" />
    </main>
  </div>
</template>
<script setup>
import {
	computed,
	onMounted,
	provide,
	inject,
	ref,
	shallowRef,
	defineAsyncComponent,
	onUnmounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getNoticesNum } from '@/api/notice/notice';
import { getChatNotice } from '@/api/chat/chat';

import { Icon } from '@iconify/vue';

const HeatList = defineAsyncComponent(
	() => import('@/components/HeatList.vue')
);
const BottomNavbar = defineAsyncComponent(
	() => import('@/components/BottomNavbar.vue')
);

const router = useRouter();
const route = useRoute();

const userInfo = inject('userInfo');

const mode = ref(document.body.className);
const changeMode = () => {
	const currentMode = document.body.className;
	document.body.className =
		currentMode == 'light-mode' ? 'dark-mode' : 'light-mode';
	mode.value = currentMode == 'light-mode' ? 'dark-mode' : 'light-mode';
	localStorage.setItem('mode', document.body.className);
};
const imgs = {
	sendPostButtonIcon: `${import.meta.env.BASE_URL}webp/sendPostButton.webp`,
};
const partitions = shallowRef([
	{
		name: '日常吐槽',
		src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865147020011731_icons8-chat-message-48.png',
	},
	{
		name: '打听求助',
		src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865259021372927_icons8-unverified-account-48.png',
	},
	{
		name: '学习交流',
		src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865462046077601_icons8-open-book-48.png',
	},
	{
		name: '院务',
		src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865305634358796_icons8-graduation-cap-48.png',
	},
	{
		name: '求职招募',
		src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865327380329691_icons8-commercial-48.png',
	},
	{
		name: '其他',
		src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865345159097327_icons8-link-48.png',
	},
]);

const isPC = computed(() => {
	return windowWidth.value > 768;
});
provide('isPC', isPC);
const windowWidth = ref(window.innerWidth);
const updateWidth = () => {
	windowWidth.value = window.innerWidth;
};

const isHomePage = computed(() => {
	return route.path === '/';
});

/**
 * @description 发帖和看帖的时候隐藏热榜
 */
const heatPostsIsHidden = computed(() => {
	return /^\/post/.test(route.fullPath);
});

const chatNum = ref(0);

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
const changePathHandler = (path) => {
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
        能省一点就省一点，今天还被指责性能差了:-(
 */
const sinfo = ref(null);
const search = () => {
	searchinfo.value = sinfo.value.value;
	sinfo.value.value = '';
	router.push('/');
};

/**
 * @description 这是分区页面的回调函数，分区页面选择分区后调用
 * @param p 分区名
 */
const sendPartition = (p) => {
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

const updateChatNum = async (n) => {
	if (n !== undefined) {
		chatNum.value = n;
	} else {
		const temp = await getChatNotice(userInfo.value.userID);
		chatNum.value = temp.data.noticeNum;
	}
	console.log(chatNum.value, n);
};

provide('updateChatNum', updateChatNum);

const startY = ref(0);
const endY = ref(0);
const headerHeight = ref('3em');

const handleTouchStart = (event) => {
	startY.value = event.touches[0].clientY;
};

const handleTouchEnd = (event) => {
	endY.value = event.changedTouches[0].clientY;
	// 如果两者相差不大，不触发
	if (Math.abs(startY.value - endY.value) < 10) {
		return;
	}
	if (startY.value > endY.value) {
		headerHeight.value = '0';
	} else {
		headerHeight.value = '3em';
	}
};

onMounted(async () => {
	mode.value = localStorage.getItem('mode') || 'light-mode';
	document.body.className = mode.value;
	// 刷新时获取对应界面数据
	// 之后考虑在组件加载时获取
	const baseUrl = import.meta.env.BASE_URL;
	const path = window.location.pathname.replace(baseUrl, '');
	changePathHandler(path);
	getNoticesNumFunc();
	updateChatNum();
	window.addEventListener('resize', updateWidth);
  if(!isPC.value) {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
  }
});
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
  if(!isPC.value) {
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
  }
});
</script>

<style lang="scss" scoped>
#root {
	background-color: var(--color-bg);
}

header {
	position: sticky;
	top: 0;
	width: 100%;
	z-index: 1999;
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

body.dark-mode .icon {
	filter: invert(1);
}

body.dark-mode .content > .icon {
	filter: brightness(1.5) saturate(1.3) contrast(1.2)
		drop-shadow(0 0 8px rgba(255, 255, 255, 0.7));
}

/* 课程专区（暂时） */
.lesson {
	width: 30px;
	height: 30px;
	background-size: cover;
	background-repeat: no-repeat;
	background-size: contain;
	background-position: 0px 3px;
	display: inline-block;
}

body.dark-mode .lesson {
	filter: brightness(1.1) saturate(1.2)
		drop-shadow(0 0 6px rgba(150, 200, 255, 0.4))
		drop-shadow(0 0 10px rgba(150, 200, 255, 0.2));
}
/* */

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

	.mode-select {
		color: #eee;
		display: flex;
		align-items: center;
		cursor: pointer;
	}
}

.site-header {
	display: flex;
	background: #ffffffa0;
	backdrop-filter: blur(2px);
	height: v-bind(headerHeight);
	color: #444;
	align-items: center;
	padding: 0 1em;
	box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
	transition: box-shadow 0.3s ease;
	margin-bottom: 0px;
	overflow: hidden;
	transition: height 0.3s ease;

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
			padding: 0 2em 0 0.75em;
			border: 1px solid #ccc;
			border-radius: 5px;
			line-height: 0.8;
			vertical-align: middle;
		}

		button {
			background: unset;
			height: 1em;
			width: 1em;
			padding: 0;
			margin: 0 0 0 -1.5em;
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
	margin-bottom: 13vh !important;
	display: flex;
	flex-direction: column;
	align-items: center;
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
	margin-top: 10px;
	background-color: var(--color-bg);
}

.partitions {
	display: flex;
	width: 100%;
	margin-bottom: 20px;
	justify-content: space-between;
}

.partition {
	flex: 1 1 16%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	background: linear-gradient(
		to bottom,
		rgba(255, 255, 255, 0.8),
		rgba(240, 240, 240, 0.8)
	);
	transition:
		box-shadow 0.3s ease,
		transform 0.3s ease;
	padding: 10px;
	cursor: pointer;
}

body.dark-mode .partition {
	background: linear-gradient(
		to bottom,
		rgba(40, 40, 40, 0.9),
		rgba(30, 30, 30, 0.9)
	);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
	transition:
		background 0.3s ease,
		box-shadow 0.3s ease;
}

.partition:hover {
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
	transform: translateY(-2px);
	background: linear-gradient(
		to bottom,
		rgba(255, 255, 200, 0.8),
		rgba(240, 240, 160, 0.8)
	);
}

body.dark-mode .partition:hover {
	box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
	transform: translateY(-2px);
}

body.dark-mode .bright-icon {
	filter: invert(1) brightness(1.4) saturate(1.2)
		drop-shadow(0 0 6px rgba(150, 200, 255, 0.4))
		drop-shadow(0 0 10px rgba(150, 200, 255, 0.2));
}

.partition:hover {
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.partition:last-child {
	margin-right: 0;
}

.bright-icon {
	display: block;
	width: 100%;
	height: 30px;
	width: 30px;
	text-align: center;
	margin: 5px;
	background-size: 100%;
	background-repeat: no-repeat;
}

.partition-info {
	user-select: none;
	width: 100%;
	text-align: center;
	font-size: 10px;
	font-weight: 800;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
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

	.post-button {
		color: #444;
		font-weight: bold;
	}
}
</style>
