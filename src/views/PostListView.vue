<!-- eslint-disable vue/html-indent -->
<template>
	<div class="root">
		<h2>当前分区：{{ partition }}</h2>
		<router-link
			v-for="post in posts"
			:key="post.PostID"
			class="post"
			:to="'/postdetail/' + post.PostID"
		>
			<div class="user">
				<img
					v-if="post.UserAvatar"
					:src="post.UserAvatar"
				/>
				<span>{{ post.UserName }}</span>
			</div>
			<h2>{{ post.Title }}</h2>
			<p>{{ post.Content.slice(0, 100) }}</p>
			<div
				v-if="post.Photos"
				class="imgs"
			>
				<!-- 图片路径由|分割 -->
				<img
					v-for="img in post.Photos.split('|')"
					:key="img"
					:src="img"
				/>
			</div>
			<span>{{ post.PostTime.replace('T', ' ') }}</span>
			<div class="postInfo">
				<span>{{ post.Browse }}阅读</span>
				<span>{{ post.Like }}赞</span>
				<span>{{ post.Comment }}评论</span>
			</div>
		</router-link>
		<div class="buttons">
			<button @click="lastPage">
				{{ '<' }}
			</button>
			<button @click="nextPage">></button>
		</div>
	</div>
</template>
<script setup>
import { getPosts, getPostsNum } from '@/utils/getPosts';
import { ref, onMounted, inject, watch, provide } from 'vue';
const userInfo = inject('userInfo');
const partition = inject('partition');
const searchinfo = inject('searchinfo');
const posts = ref([]);
provide('posts', posts);
const totalNum = ref(0);
const curPage = ref(0);

const lastPage = async () => {
	if (curPage.value > 0) {
		curPage.value -= 5;
		const arr = await getPosts(
			5,
			curPage.value,
			partition.value,
			'home',
			searchinfo.value,
			userInfo.value.phone
		);
		posts.value = arr;
	}
};

const nextPage = async () => {
	if (curPage.value < totalNum.value - 5) {
		curPage.value += 5;
		const arr = await getPosts(
			5,
			curPage.value,
			partition.value,
			'home',
			searchinfo.value,
			userInfo.value.phone
		);
		posts.value = arr;
	}
};

onMounted(async () => {
	if (userInfo && userInfo.value && curPage.value >= 0) {
		const id = await getPostsNum(
			partition.value,
			'home',
			searchinfo.value,
			userInfo.value.phone
		);
		const arr = await getPosts(
			5,
			curPage.value,
			partition.value,
			'home',
			searchinfo.value,
			userInfo.value.phone
		);
		posts.value = arr;
		totalNum.value = id;
	}
});

watch(partition, async (newVal) => {
	const id = await getPostsNum(
		newVal,
		'home',
		searchinfo.value,
		userInfo.value.phone
	);
	const arr = await getPosts(
		5,
		curPage.value,
		newVal,
		'home',
		searchinfo.value,
		userInfo.value.phone
	);
	posts.value = arr;
	totalNum.value = id;
});
watch(searchinfo, async (newVal) => {
	const id = await getPostsNum(
		partition.value,
		'home',
		newVal,
		userInfo.value.phone
	);
	const arr = await getPosts(
		5,
		curPage.value,
		partition.value,
		'home',
		newVal,
		userInfo.value.phone
	);
	posts.value = arr;
	totalNum.value = id;
});
</script>

<style scoped>
@media screen and (min-width: 768px) {
	.post {
		display: block;
		width: 100%;
		min-height: 150px;
		height: auto;
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(0, 0, 0, 0.1);
		margin: 10px 0;
		padding: 10px;
	}

	.imgs {
		display: flex;
		flex-wrap: wrap;
	}

	.imgs img {
		width: 100px;
		height: 100px;
		margin: 5px;
	}

	.user {
		--userImage: 50px;
		width: 100%;
		height: 30px;
		/* 靠左 */
		margin-right: auto;
		display: flex;
		align-items: center;
		font-size: 1.2rem;
		font-weight: bold;
		color: #333;
		margin-bottom: 10px;
		margin-top: 10px;
	}

	.user img {
		width: var(--userImage);
		height: var(--userImage);
		border-radius: 50%;
	}

	.user .b-avatar {
		width: calc(var(--userImage) + 10px);
		height: calc(var(--userImage) + 10px);
		margin-right: 0.5rem;
		background-color: #6c757d;
		color: #fff;
		border-radius: 50%;
	}

	p {
		text-indent: 2rem;
	}
}

.buttons {
	display: flex;
	justify-content: center;
	margin: 10px 0;
	justify-content: space-around;
}

p::after {
	content: '...';
}

.postInfo {
	display: flex;
	justify-content: space-around;
	margin-top: 10px;
}

a {
	text-decoration: none;
	color: black;
	display: block;
}

@media screen and (max-width: 768px) {
	.root {
		width: 100%;
		margin: 0;
	}

	.post {
		width: 100%;
		min-height: 150px;
		height: auto;
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(0, 0, 0, 0.1);
		margin: 10px 0;
		padding: 10px;
	}

	.imgs img {
		width: 100px;
		height: 100px;
		margin: 5px;
	}

	.user {
		--userImage: 50px;
		width: 100%;
		height: 30px;
		/* 靠左 */
		margin-right: auto;
		margin-bottom: 10px;
		display: flex;
		align-items: center;
		font-size: 1.2rem;
		font-weight: bold;
		color: #333;
	}

	.user img {
		width: var(--userImage);
		height: var(--userImage);
		border-radius: 50%;
	}

	.user .b-avatar {
		width: calc(var(--userImage) + 10px);
		height: calc(var(--userImage) + 10px);
		margin-right: 0.5rem;
		background-color: #6c757d;
		color: #fff;
		border-radius: 50%;
	}
}
</style>
