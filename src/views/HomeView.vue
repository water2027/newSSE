<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
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
				<h1
					:class="{ mobileSelected: selected == '/' }"
				>
					SSE_MARKET
				</h1>
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
				<button @click="search">搜索</button>
			</div>
			<button
				v-if="isPC"
				@click="DarkOrLight"
			>
				{{ mode }}
			</button>
		</header>
		<div
			v-if="isPC"
			class="none"
		></div>
		<main>
			<div
				v-if="isPC || navIsOpen"
				id="mainNavBar"
				class="nav-bar main-nav-bar"
				@click="toggleNav"
			>
				<router-link
					class="nav"
					:class="{ selected: selected == '/' }"
					to="/"
					@click="changeToMain"
				>
					主页
				</router-link>
				<router-link
					class="nav"
					:class="{ selected: selected == '/partitions' }"
					to="/partitions"
				>
					分区
				</router-link>
				<router-link
					v-if="!isPC"
					class="nav"
					:class="{ selected: selected == '/heat' }"
					to="/heat"
				>
					热榜
				</router-link>
				<router-link
					to="/course"
					class="nav"
					:class="{ selected: selected == '/course' }"
					@click="changeToCourse"
				>
					课程专区
				</router-link>
				<router-link
					v-if="isPC"
					id="post"
					class="nav"
					:class="{ selected: selected == '/post' }"
					to="/post"
				>
					发帖
				</router-link>
				<router-link
					id="notice"
					:notice-num="noticeNum"
					:display-bool="displayBool"
					class="nav"
					:class="{ selected: selected == '/notice' }"
					to="/notice"
				>
					通知
				</router-link>
				<router-link
					class="nav"
					:class="{ selected: selected == '/feedback' }"
					to="/feedback"
				>
					反馈
				</router-link>
				<router-link
					class="nav"
					:class="{ selected: selected == '/save' }"
					to="/save"
					@click="changeToSave"
				>
					我的收藏
				</router-link>
				<router-link
					class="nav"
					:class="{ selected: selected == '/history' }"
					to="/history"
					@click="changeToHistory"
				>
					发帖历史
				</router-link>
				<router-link
					class="nav"
					:class="{ selected: selected == '/options' }"
					to="/options"
				>
					个人信息
				</router-link>
				<router-link
					class="nav"
					:class="{ selected: selected == '/doc' }"
					to="/doc"
				>
					文档
				</router-link>
			</div>
			<div
				class="content"
				:style="contentStyle"
			>
				<router-view v-slot="{ Component }">
					<transition
						name="bounce"
						mode="out-in"
					>
						<component
							:is="Component"
							@send-partition="sendPartition"
							@send-notice-num="sendNoticeNum"
						/>
					</transition>
				</router-view>
			</div>
			<heat-list v-if="isPC && !heatPostsIsHidden" />
			<div
				v-if="!isPC"
				class="ball"
			>
				<div
					class="first"
					@click="OpenAndCloseBall"
				>
					{{ ballIsOpen ? 'X' : 'O' }}
				</div>
				<div
					ref="second"
					class="second"
					@click="DarkOrLight"
				>
					{{ mode == 'light-mode' ? 'L' : 'D' }}
				</div>
				<div
					ref="third"
					class="third"
					@click="returnToTop"
				>
					&uarr;
				</div>
			</div>
		</main>
	</div>
</template>
<script setup>
import { computed, onMounted, provide, ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getNoticesNum } from '@/api/notice/notice';

import HeatList from '@/components/HeatList.vue';
const mode = inject('mode');
const emit = defineEmits(['change-mode']);
const DarkOrLight = () => {
	emit('change-mode');
};

const route = useRoute();
const router = useRouter();

const noticeNum = ref('');
const second = ref(null);
const third = ref(null);

const displayBool = computed(() => {
	return noticeNum.value == '0' ? 'none' : 'block';
});

const notices = ref({});
provide('notices', notices);
const partition = ref('主页');
provide('partition', partition);
const searchinfo = ref('');
provide('searchinfo', searchinfo);
const searchsort = ref('home');
provide('searchsort', searchsort);

const selected = computed(() => {
	return route.fullPath;
});

const windowWidth = ref(window.innerWidth);
const updateWidth = () => {
	windowWidth.value = window.innerWidth;
};
const isPC = computed(() => {
	return windowWidth.value > 768;
});
provide('isPC', isPC);

const posts = ref([]);
provide('posts', posts);

const navIsOpen = ref(true);
const ballIsOpen = ref(false);

/**
 * @description 发帖和看帖的时候隐藏热榜
 */
const heatPostsIsHidden = computed(() => {
	return /^\/post/.test(route.fullPath);
});
/**
 * @description 控制主页的样式
 */
const contentStyle = ref({
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
});

/**
 * 搜索功能，不使用v-model绑定，略微减小性能消耗。
				它的值是目标元素而不是元素里的值
 */
const sinfo = ref(null);

const search = () => {
	searchinfo.value = sinfo.value.value;
	router.push('/');
};

const mobileChangeToMain = () => {
	changeToMain();
	router.push('/');
};
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
 * @description 这是通知页面的回调函数，已读通知后调用
 */
const sendNoticeNum = () => {
	noticeNum.value--;
};

/**
 * @description 移动端展开导航栏
 */
const toggleNav = () => {
	if (!isPC.value) {
		navIsOpen.value = !navIsOpen.value;
	}
};

const OpenAndCloseBall = () => {
	if (ballIsOpen.value) {
		ballIsOpen.value = false;
		second.value.animate(
			[{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
		third.value.animate(
			[
				{ transform: 'translateY(-100%)' },
				{ transform: 'translateY(0)' },
			],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
	} else {
		ballIsOpen.value = true;
		second.value.animate(
			[{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
		third.value.animate(
			[
				{ transform: 'translateY(0)' },
				{ transform: 'translateY(-100%)' },
			],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
	}
};

const returnToTop = () => {
	document.body.scrollTop = 0;
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
.ball {
	position: fixed;
	bottom: 45px;
	left: 10px;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	background-color: var(--color-ball-bg);
	color: var(--color-ball-text);
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: var(--color-ball-box-shadow) 0px 1px 4px;
}

.ball > * {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 100%;
	background-color: var(--color-ball-bg);
	color: var(--color-ball-text);
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: var(--color-ball-box-shadow) 0px 1px 4px;
}

.ball .first {
	z-index: 3;
}

.selected {
	box-shadow:
		var(--color-selected-shadow-first) 0px 30px 60px -12px inset,
		var(--color-selected-shadow-second) 0px 18px 36px -18px inset;
}

#notice {
	position: relative;
}
#notice::after {
	content: attr(notice-num);
	position: absolute;
	top: 50%;
	right: 5%;
	transform: translate(0, -50%);
	background-color: rgba(255, 0, 0, 0.75);
	color: white;
	padding: 5px;
	font-size: 1rem;
}

#notice[notice-num='0']::after {
	display: none;
}

p {
	text-indent: 2rem;
}

header {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 200;
}

.search {
	height: 30px;
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

.main-nav-bar {
	padding: 0;
	border: 1px solid var(--color-border);
	border-radius: 5px var(--color-border);
	animation: fadeIn 0.5s;
	transition: all 0.3s;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.second-nav-bar {
	width: 100%;
}

.nav-bar {
	display: flex;
	flex-direction: column;
	align-items: self-start;
}

.nav {
	width: 100%;
	margin-top: 0;
	margin-bottom: 0;
	padding: 15px;
	border: 1px solid var(--color-border);
	text-align: center;
	text-decoration: none;
	color: var(--color-text);
}

#mainNavBar {
	z-index: 3000;
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
	.asideButton {
		display: none;
	}

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

	.main-nav-bar {
		margin-left: 2%;
		width: 20%;
	}

	body:not(:has(header)) .main-nav-bar {
		position: fixed;
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

	.nav:hover {
		background-color: var(--color-nav-hover);
	}
}

/* 小屏幕样式 <768px */
@media screen and (max-width: 768px) {
	.mobileSelected {
		color: var(--color-title-selected);
	}

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
		z-index: 2000;
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
		z-index: 1001;
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

	.main-nav-bar {
		margin-left: 0;
		width: 80%;
		position: absolute;
		top: 8%;
	}

	.nav-bar {
		background-color: var(--color-nav-bg);
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
