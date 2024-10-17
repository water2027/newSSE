<!-- eslint-disable vue/html-indent -->
<template>
	<router-link
		class="post"
		:to="'/postdetail/' + postData.PostID"
	>
		<div class="user">
			<img
				v-if="postData.UserAvatar"
				:src="postData.UserAvatar"
			/>
			<span>{{ postData.UserName }}</span>
			<span
				title="码之气，三段！"
				class="level"
				>{{ expHandler(postData.UserScore) }}
			</span>
			<div class="userButtons">
				<button @click.stop.prevent="handleSave">
					{{ postData.IsSaved ? '取消' : '收藏' }}
				</button>
				<button
					v-if="postData.UserTelephone === userInfo.phone"
					@click.stop.prevent="handleDelete"
				>
					删除
				</button>
			</div>
		</div>
		<h2>{{ postData.Title }}</h2>
		<p>{{ postData.Content.slice(0, 50) }}</p>
		<div
			v-if="postData.Photos"
			class="imgs"
		>
			<!-- 图片路径由|分割 -->
			<img
				v-for="img in strHandler('img', postData.Photos)"
				:key="img"
				:src="img"
			>
		</div>
		<span>{{ strHandler('time', postData.PostTime) }}</span>
		<div class="postInfo">
			<span>
				{{ postData.Browse }}
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
				:class="postData.IsLiked ? 'like' : ''"
				@click.stop.prevent="like"
			>
				{{ postData.Like }}
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
				{{ postData.Comment }}
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
</template>
<script setup>
import { ref, inject } from 'vue';

import { strHandler } from '@/utils/strHandler';
import { expHandler } from '@/utils/expHandler';

import { showMsg } from '@/components/MessageBox';

import { savePost, delPost, likePost } from '@/api/saveAndDel';

const props = defineProps({
	post: {
		type: Object,
		required: true,
	},
});
// 不能直接修改props，所以要用ref包装
const postData = ref(props.post);

// 提醒父组件更新数据，删除帖子时用
const emit = defineEmits(['updateData']);

const userInfo = inject('userInfo');

/**
 * @description 收藏。
 */
const handleSave = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		await savePost(
			postData.value.IsSaved,
			postData.value.PostID,
			userInfo.value.phone
		);
		postData.value.IsSaved = !postData.value.IsSaved;
		showMsg(isSaved ? '取消成功' : '收藏成功');
	} catch (e) {
		showMsg('失败了:-(');
	}
};

/**
 * @description 点赞。
 */
const like = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		await likePost(
			postData.value.IsLiked,
			postData.value.PostID,
			userInfo.value.phone
		);
		postData.value.IsLiked = !postData.value.IsLiked;
		if (postData.value.IsLiked) {
			postData.value.Like++;
			showMsg('点赞成功');
		} else {
			postData.value.Like--;
			showMsg('取消成功');
		}
	} catch (e) {
		showMsg('失败了:-(');
	}
};

/**
 * @description 删除帖子。
 */
const handleDelete = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		await delPost(postData.value.PostID);
		emit('updateData', postData.value.PostID);
		showMsg('删除成功');
	} catch (e) {
		showMsg('失败了:-(');
	}
};
</script>
<style scoped>
.post {
	width: 100%;
	min-width: 100%;
	min-height: 150px;
	height: auto;
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(0, 0, 0, 0.1);
	margin: 10px 0;
	padding: 10px;
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
	transition: all 0.5s;
}

.post:hover {
	box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
	transform: scale(1.05);
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
@media screen and (min-width: 768px) {
	.post {
		display: block;
	}

	.imgs {
		display: flex;
		flex-wrap: wrap;
	}

	p {
		text-indent: 2rem;
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
