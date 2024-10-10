<!-- eslint-disable vue/html-indent -->
<template>
	<div class="root">
		<h2>当前分区：{{ partition }}</h2>
		<div v-if="partition === '课程专区'">
			<span class="gradientUnderline">请选择你的老师，不选也没关系 </span>
			<select
				v-if="partition === '课程专区'"
				id="teacher"
				v-model="tag"
			>
				<option
					v-for="teacher in teachers"
					:key="teacher.TagID"
					:value="teacher.Name"
				>
					{{ teacher.Name }}
				</option>
			</select>
		</div>
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
				<span
					title="码之气，三段！"
					class="level"
					>{{ expHandler(post.UserScore) }}</span
				>
				<div class="userButtons">
					<button
						@click.stop.prevent="
							handleSave(
								post.IsSaved,
								post.PostID,
								userInfo.phone
							)
						"
					>
						{{ post.IsSaved ? '取消' : '收藏' }}
					</button>
					<button
						v-if="post.UserTelephone === userInfo.phone"
						@click.stop.prevent="handleDelete(post.PostID)"
					>
						删除
					</button>
				</div>
			</div>
			<h2>{{ post.Title }}</h2>
			<p>{{ post.Content.slice(0, 100) }}</p>
			<div
				v-if="post.Photos"
				class="imgs"
			>
				<!-- 图片路径由|分割 -->
				<img
					v-for="img in strHandler('img', post.Photos)"
					:key="img"
					:src="img"
				/>
			</div>
			<span>{{ strHandler('time', post.PostTime) }}</span>
			<div class="postInfo">
				<span>
					{{ post.Browse }}
					<svg
						viewBox="0 0 16 16"
						width="1em"
						height="1em"
						focusable="false"
						role="img"
						aria-label="eye fill"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
					>
						<g>
							<path
								d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"
							/>
							<path
								d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
							/>
						</g>
					</svg>
				</span>
				<span
					:class="post.IsLiked ? 'like' : ''"
					@click.stop.prevent="
						like(post.IsLiked, post.PostID, userInfo.phone)
					"
				>
					{{ post.Like }}
					<svg
						viewBox="0 0 16 16"
						width="1em"
						height="1em"
						focusable="false"
						role="img"
						aria-label="heart"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						class="heart"
					>
						<g>
							<path
								d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
							/>
						</g>
					</svg>
				</span>
				<span>
					{{ post.Comment }}
					<svg
						viewBox="0 0 16 16"
						width="1em"
						height="1em"
						focusable="false"
						role="img"
						aria-label="chat dots fill"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
					>
						<g>
							<path
								d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
							/>
						</g>
					</svg>
				</span>
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
import { getPosts, getPostsNum } from '@/api/getPosts';
import { savePost, delPost, likePost } from '@/api/saveAndDel';
import { showMsg } from '@/components/msgbox';
import { getItemWithExpiry } from '@/api/LoginAndReg';
import { strHandler } from '@/utils/strHandler';
import { expHandler } from '@/utils/expHandler';

import { ref, onMounted, inject, watch } from 'vue';

const userInfo = inject('userInfo');
const partition = inject('partition');
const searchinfo = inject('searchinfo');
const searchsort = inject('searchsort');
const posts = ref([]);
const totalNum = ref(0);
const curPage = ref(0);
const emit = defineEmits(['sendPosts']);

const teachers = ref([]);
const tag = ref('');

const handleSave = async (isSaved, postID, userTelephone) => {
	await savePost(isSaved, postID, userTelephone);
	posts.value.forEach((element) => {
		if (element.PostID === postID) {
			element.IsSaved = !element.IsSaved;
		}
	});
	showMsg(isSaved ? '取消成功' : '收藏成功');
};

const like = async (isLiked, postID, userTelephone) => {
	await likePost(isLiked, postID, userTelephone);
	posts.value.forEach((element) => {
		if (element.PostID === postID) {
			element.IsLiked = !element.IsLiked;
			if (element.IsLiked) {
				element.Like++;
				showMsg('点赞成功');
			} else {
				element.Like--;
				showMsg('取消成功');
			}
		}
	});
};

const handleDelete = async (postID) => {
	await delPost(postID);
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	const res = await getPosts({
		limit: 5,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = res;
	showMsg('删除成功');
};

const lastPage = async () => {
	if (curPage.value > 0) {
		curPage.value -= 5;
		const arr = await getPosts({
			limit: 5,
			offset: curPage.value,
			partition: partition.value,
			searchsort: searchsort.value,
			searchinfo: searchinfo.value,
			userTelephone: userInfo.value.phone,
			tag: tag.value,
		});
		posts.value = arr;
	}
};

const nextPage = async () => {
	if (curPage.value < totalNum.value - 5) {
		curPage.value += 5;
		const arr = await getPosts({
			limit: 5,
			offset: curPage.value,
			partition: partition.value,
			searchsort: searchsort.value,
			searchinfo: searchinfo.value,
			userTelephone: userInfo.value.phone,
			tag: tag.value,
		});
		posts.value = arr;
	}
};

onMounted(async () => {
	if (userInfo && userInfo.value && curPage.value >= 0) {
		const id = await getPostsNum({
			partition: partition.value,
			searchsort: searchsort.value,
			searchinfo: searchinfo.value,
			userTelephone: userInfo.value.phone,
			tag: tag.value,
		});
		const arr = await getPosts({
			limit: 5,
			offset: curPage.value,
			partition: partition.value,
			searchsort: searchsort.value,
			searchinfo: searchinfo.value,
			userTelephone: userInfo.value.phone,
			tag: tag.value,
		});
		posts.value = arr;
		totalNum.value = id;
	}
	if (partition.value === '课程专区') {
		const apiUrl = import.meta.env.VITE_API_BASE_URL;
		const token = getItemWithExpiry('token');
		if (token) {
			const res = await fetch(`${apiUrl}/auth/getTags?type=course`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await res.json();
			teachers.value = ['', ...data.data.tags];
		} else {
			showMsg('获取失败');
		}
	}
});

watch(partition, async (newVal) => {
	curPage.value = 0;
	const id = await getPostsNum({
		partition: newVal,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	const arr = await getPosts({
		limit: 5,
		offset: curPage.value,
		partition: newVal,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = arr;
	totalNum.value = id;
	if (newVal === '课程专区') {
		const apiUrl = import.meta.env.VITE_API_BASE_URL;
		const token = getItemWithExpiry('token');
		if (token) {
			const res = await fetch(`${apiUrl}/auth/getTags?type=course`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await res.json();
			teachers.value = data.data.tags;
		} else {
			showMsg('获取失败');
		}
	}
});
watch(searchinfo, async (newVal) => {
	curPage.value = 0;
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: newVal,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	const arr = await getPosts({
		limit: 5,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: newVal,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = arr;
	totalNum.value = id;
});
watch(searchsort, async (newVal) => {
	curPage.value = 0;
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: newVal,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	const arr = await getPosts({
		limit: 5,
		offset: curPage.value,
		partition: partition.value,
		searchsort: newVal,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = arr;
	totalNum.value = id;
});
watch(tag, async (newVal) => {
	curPage.value = 0;
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: newVal,
	});
	const arr = await getPosts({
		limit: 5,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: newVal,
	});
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
		margin-bottom: 15px;
		margin-top: 15px;
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
		margin-top: 15px;
		margin-bottom: 15px;
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

.userButtons {
	margin-top: 0;
	margin-left: auto;
	display: flex;
	flex-direction: row;
}
.userButtons button {
	margin: 0;
	margin-left: 10px;
	pointer-events: auto;
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

.level {
	margin-left: 10px;
	background: #ffc6c6;
	border-radius: 50%;
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 5px;
	padding-bottom: 5px;
}
</style>
