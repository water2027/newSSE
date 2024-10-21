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
    <transition-group
      name="list"
      class="list"
    >
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
import { ref, onMounted, inject, watch, onUnmounted, computed } from 'vue';

import { getTeachers } from '@/api/info/getTeacher';
import { getPosts, getPostsNum } from '@/api/browse/getPost';

import PostCard from './card/PostCard.vue';

const userInfo = inject('userInfo');
const partition = inject('partition');
const searchinfo = inject('searchinfo');
const searchsort = inject('searchsort');
const posts = ref([]);
const totalNum = ref(0);
const curPage = ref(0);
const limit = ref(5);
const isLoading = computed(() => curPage.value < totalNum.value);

const teachers = ref([]);
const tag = ref('');
// 用于滚动加载
const bottom = ref(null);
let observer = null;

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
	posts.value = [...posts.value, ...res];
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
	if(res){
		await updateNum();
		await updatePosts(res);
	}
};

const getMore = async () => {
	if (isLoading.value) {
		await addPosts();
		curPage.value = posts.value.length;
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
		observer.observe(bottom.value);
	}
};

const endObserver = () => {
	if (observer) {
		observer.disconnect();
	}
};

onMounted(async () => {
	if (userInfo && userInfo.value && curPage.value >= 0) {
		await updateNum();
	}
	if (partition.value === '课程专区') {
		const data = await getTeachers();
		teachers.value = ['', ...data];
	}
	startObserver();
});

onUnmounted(() => {
	endObserver();
});

/**
 * 这四个watch之后可以考虑改成watchEffect
 */
watch(partition, async (newVal) => {
	endObserver()
	posts.value = [];
	curPage.value = 0;
	const arr = await getPosts({
		limit: limit.value,
		offset: curPage.value,
		partition: newVal,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = arr;
	curPage.value = arr.length
	const id = await getPostsNum({
		partition: newVal,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	totalNum.value = id;
	if (newVal === '课程专区') {
		const data = await getTeachers();
		teachers.value = ['', ...data];
	}
	startObserver()
});
watch(searchinfo, async (newVal) => {
	endObserver()
	posts.value = [];
	curPage.value = 0;
	const arr = await getPosts({
		limit: limit.value,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: newVal,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = arr;
	curPage.value = arr.length
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: newVal,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	totalNum.value = id;
	startObserver()
});
watch(searchsort, async (newVal) => {
	endObserver()
	posts.value = [];
	curPage.value = 0;
	const arr = await getPosts({
		limit: limit.value,
		offset: curPage.value,
		partition: partition.value,
		searchsort: newVal,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	posts.value = arr;
	curPage.value = arr.length
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: newVal,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: tag.value,
	});
	totalNum.value = id;
	startObserver()
});
watch(tag, async (newVal) => {
	endObserver()
	posts.value = [];
	curPage.value = 0;
	const arr = await getPosts({
		limit: limit.value,
		offset: curPage.value,
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: newVal,
	});
	posts.value = arr;
	curPage.value = arr.length
	const id = await getPostsNum({
		partition: partition.value,
		searchsort: searchsort.value,
		searchinfo: searchinfo.value,
		userTelephone: userInfo.value.phone,
		tag: newVal,
	});
	totalNum.value = id;
	startObserver()
});
defineExpose({
	name: 'PostList',
});
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

.root {
	width: 100%;
	color: var(--color-text);
	overflow-x: hidden;
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
