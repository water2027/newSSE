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
		<transition-group name="list">
			<template v-if="postsIsLoading">
				<div
					v-for="item in 10"
					:key="10"
					class="isLoading"
					style="--card-width: 700px; --card-height: 200px"
				></div>
			</template>
			<post-card
				v-for="post in posts"
				:key="post.PostID"
				:post="post"
				:delete-handler="deleteHandler"
			/>
		</transition-group>
		<div
			v-if="isLoading"
			ref="bottom"
			class="bottomDiv"
		>
			loading...
		</div>
		<div
			v-else
			class="bottomDiv"
		>
			noMore
		</div>
	</div>
</template>
<script setup>
import { ref, inject, watch, onUnmounted, computed, onActivated } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import { getTeachers } from '@/api/info/getTeacher';
import { getPosts, getPostsNum } from '@/api/browse/getPost';

import PostCard from './card/PostCard.vue';
import { showMsg } from '@/components/MessageBox'

const {userInfo} = inject('userInfo');
const partition = inject('partition');
const searchinfo = inject('searchinfo');
const searchsort = inject('searchsort');
// const posts = ref([]);
const totalNum = ref(0);
const curPage = ref(0);
const limit = ref(10);
const isLoading = computed(() => curPage.value < totalNum.value);
// 保存滚动位置
const scrollTop = ref(0);

const teachers = ref([]);
const tag = ref('');
// 用于滚动加载
const bottom = ref(null);
let observer = null;

const {
	data: posts,
	isLoading: postsIsLoading,
	err,
} = getPosts(
	{
		limit: limit.value,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	},
	false
);

const postsWatcher = watch(postsIsLoading, async () => {
	if (err.value) {
		showMsg('err ' + err.value);
	} else {
		console.log('start');
		if (userInfo && userInfo.value && curPage.value >= 0) {
			await updateNum();
		}
		if (partition.value === '课程专区') {
			const data = await getTeachers();
			// 后端的事(X)
			// 前端的事(O)
			data.sort((a, b) => a.Name.localeCompare(b.Name));
			teachers.value = ['', ...data];
		}
		startObserver();
	}
	postsWatcher();
});

const updateNum = async () => {
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	totalNum.value = id;
};

const addPosts = async () => {
	const res = await getPosts({
		limit: limit.value,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	if (res) {
		posts.value = [...posts.value, ...res];
	} else {
		totalNum.value = posts.value.length;
	}
};

const updatePosts = async (id) => {
	// 从posts中删除PostID为id的post
	try {
		const index = posts.value.findIndex((post) => post.PostID === id);
		if (index !== -1) {
			posts.value.splice(index, 1);
		}
	} catch (error) {
		console.error('Failed to update posts:', error);
	}
};

const deleteHandler = async (callback) => {
	const res = await callback();
	if (res) {
		--curPage.value;
		await updateNum();
		await updatePosts(res);
	}
};

const getMore = async () => {
	if (isLoading.value) {
		await addPosts();
		try {
			curPage.value = posts.value.length;
		} catch (e) {
			curPage.value = 0;
		}
	}
};

const startObserver = () => {
	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					await getMore();
				}
			});
		},
		{
			root: null,
			rootMargin: '0px',
			threshold: 0.5,
		}
	);
	if (bottom.value) {
		console.log('observe');
		observer.observe(bottom.value);
	}
};

const endObserver = () => {
	if (observer) {
		observer.disconnect();
	}
};

onUnmounted(() => {
	endObserver();
});

// 组件被激活时（从缓存恢复）
onActivated(async () => {
	// 恢复滚动位置
	document.body.scrollTop = scrollTop.value;
	// 请求帖子数量
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	if (id > totalNum.value && id - totalNum.value <= 100) {
		const res = await getPosts({
			limit: id - totalNum.value,
			offset: 0,
			partition: partition.value,
			searchsort: searchsort.value,
			searchinfo: searchinfo.value,
			userTelephone: userInfo.value.phone,
			tag: tag.value,
		});
		if (res) {
			posts.value = [...res, ...posts.value];
		}
		curPage.value += id - totalNum.value;
		totalNum.value = id;
	}
});

onBeforeRouteLeave((to, from, next) => {
	scrollTop.value = document.body.scrollTop;
	next();
});

/**
 * 这四个watch之后可以考虑改成watchEffect
 */
watch(
	[partition, searchinfo, searchsort, tag],
	async ([newPartition, newSearchinfo, newSearchsort, newTag]) => {
		endObserver();
		posts.value = [];
		curPage.value = 0;
		const arr = await getPosts({
			limit: limit.value,
			offset: curPage.value,
			userTelephone: userInfo.value.phone,
			partition: newPartition,
			searchinfo: newSearchinfo,
			searchsort: newSearchsort,
			tag: newTag,
		});
		posts.value = arr;
		curPage.value = arr.length;
		const id = await getPostsNum({
			userTelephone: userInfo.value.phone,
			partition: newPartition,
			searchsort: newSearchsort,
			searchinfo: newSearchinfo,
			tag: newTag,
		});
		totalNum.value = id;
		if (newPartition === '课程专区') {
			const data = await getTeachers();
			teachers.value = ['', ...data];
		}
		startObserver();
	}
);
</script>

<style scoped>
@media screen and (min-width: 768px) {
	.root {
		margin: 0 5%;
	}
	p {
		text-indent: 2rem;
	}
}

@media screen and (max-width: 768px) {
	.root {
		overflow-x: hidden;
	}
}

.root {
	width: 100%;
	color: var(--color-text);
}

.bottomDiv {
	text-align: center;
	height: 50px;
	padding: 10px;
	margin-bottom: 10px;
}

p::after {
	content: '...';
}

a {
	text-decoration: none;
	color: var(--color-text);
	display: block;
}

.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(30px);
}
</style>
