<!-- eslint-disable vue/html-self-closing -->
<template>
  <div id="root">
    <header>
      <div id="title">
        <button
          v-if="!isPC"
          class="hamburgerMenu"
          @click="toggleNav"
        >
          <span />
          <span />
          <span />
        </button>
        <h1>SSE_MARKET</h1>
        <button
          v-if="!isPC"
          class="toPost"
          @click="changeToPost"
        >
          +
        </button>
      </div>
      <div class="search">
        <input
          ref="sinfo"
          placeholder="在当前分区搜索"
          type="search"
          @keydown.enter="search"
        />
        <button @click="search">
          搜索
        </button>
      </div>
      <button
        v-if="isPC"
        @click="changeMode"
      >
        {{ mode }}
      </button>
    </header>
    <div
      v-if="isPC"
      class="none"
    ></div>
    <main>
      <link-list
        v-if="isPC || navIsOpen"
        @change-path="changePathHandler"
        @click="toggleNav"
      />
      <div
        class="content"
      >
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
      <heat-list />
      <suspended-ball
        v-if="!isPC"
        :mode="mode"
        :change-mode="changeMode"
      />
    </main>
  </div>
</template>
<script setup>
import { computed, onMounted, provide, ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getNoticesNum } from '@/api/notice/notice';

import HeatList from '@/components/HeatList.vue';
import LinkList from '@/components/LinkList.vue';
import SuspendedBall from '@/components/SuspendedBall.vue';

const mode = ref(document.body.className);
const changeMode = () => {
	const currentMode = document.body.className;
	document.body.className =
		currentMode == 'light-mode' ? 'dark-mode' : 'light-mode';
	mode.value = currentMode == 'light-mode' ? 'dark-mode' : 'light-mode';
};

const route = useRoute();
const router = useRouter();

const isPC = computed(() => {
	return windowWidth.value > 768;
});
provide('isPC', isPC);
const windowWidth = ref(window.innerWidth);
const updateWidth = () => {
	windowWidth.value = window.innerWidth;
};

const noticeNum = ref('');
const reduceNoticeNum = ()=>{
	noticeNum.value--
}
provide('noticeNum', {
	noticeNum,reduceNoticeNum
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
 */
const sinfo = ref(null);
const search = () => {
	searchinfo.value = sinfo.value.value;
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

onMounted(async () => {
	if (!isPC.value) {
		navIsOpen.value = false;
	}
	// 刷新时跳转到获取对应界面数据
	// 之后考虑在组件加载时获取
	const baseUrl = import.meta.env.BASE_URL;
	const path = window.location.pathname.replace(baseUrl, '');
	switch (path) {
		case '':
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
	getNoticesNumFunc();
	window.addEventListener('resize', updateWidth);
});
</script>
<style scoped>
.content{
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	/* justify-content: center; */
}

p {
	text-indent: 2rem;
}

header {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 10;
}

.search {
	height: 30px;
}

.search button{
	overflow: hidden;
}

header input {
	height: 100%;
	border-radius: 15px;
	border: 1px solid black;
	background-color: #f0f0f06d;
	text-align: left;
	padding: 1%;
}

main {
	width: 100%;
	padding: 0;
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

	header {
		height: 10vh;
		margin: 0;
		padding-left: 25px;
		padding-right: 15px;
		padding-top: 0;
		padding-bottom: 0;
		width: 100%;
		background-color: var(--color-title-bg);
		position: fixed;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	header .title {
		margin-right: auto;
	}

	.none {
		height: 15vh;
	}

	header h1 {
		font-size: 3rem;
		color: transparent;
		-webkit-text-stroke: 3px rgba(255, 255, 255, 0.95);
	}

	header .search {
		display: flex;
		flex-direction: row;
		height: 80%;
		margin-top: auto;
		margin-bottom: auto;
		margin-right: auto;
		margin-left: 3%;
	}

	header .search input {
		width: 100%;
		height: 60%;
		margin-top: auto;
		margin-bottom: auto;
	}

	header .search button {
		margin-top: auto;
		margin-bottom: auto;
		height: 90%;
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
	header {
		height: 20vh;
		margin: 0;
		flex-direction: column;
		background-color: var(--color-title-bg);
	}

	#title {
		position: absolute;
		top: 0;
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px;
		/* 让button贴紧左边，h1居中 */
		justify-content: space-between;
		background-color: var(--color-title-bg);
	}

	#title h1 {
		display: block;
		font-size: 2rem;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		transition: all 0.3s;
	}

	header input {
		width: 80%;
	}

	.hamburgerMenu {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		width: 30px;
		height: 30px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		margin-left: 0;
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
		margin: 0 !important;
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
		position: absolute;
		right: 10px;
		top: 10px;
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
