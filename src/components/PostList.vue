<script setup>
import {
  computed,
  inject,
  onActivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { getPosts, getPostsNum } from '@/api/browse/getPost'
import { getTeachers } from '@/api/info/getTeacher'

import PostCard from './card/PostCard.vue'

const userInfo = inject('userInfo')
const partition = inject('partition')
const searchinfo = inject('searchinfo')
const searchsort = inject('searchsort')
const posts = ref([])
const totalNum = ref(0)
const curPage = ref(0)
const limit = ref(10)
const isLoading = computed(() => curPage.value < totalNum.value)
// 保存滚动位置
const scrollTop = ref(0)

const teachers = ref([])
const tag = ref('')
// 用于滚动加载
const bottom = ref(null)
let observer = null

async function updateNum() {
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  totalNum.value = id
}

async function addPosts() {
  const res = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  if (res) {
    posts.value = [...posts.value, ...res]
  }
  else {
    totalNum.value = posts.value.length
  }
}

async function updatePosts(id) {
  // 从posts中删除PostID为id的post
  try {
    const index = posts.value.findIndex(post => post.PostID === id)
    if (index !== -1) {
      posts.value.splice(index, 1)
    }
  }
  catch (error) {
    console.error('Failed to update posts:', error)
  }
}

async function deleteHandler(callback) {
  const res = await callback()
  if (res) {
    --curPage.value
    await updateNum()
    await updatePosts(res)
  }
}

async function getMore() {
  if (isLoading.value) {
    await addPosts()
    try {
      curPage.value = posts.value.length
    }
    catch (e) {
      curPage.value = 0
      console.error('获取更多帖子失败:', e)
    }
  }
}

function startObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await getMore()
        }
      })
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    },
  )
  if (bottom.value) {
    observer.observe(bottom.value)
  }
}

function endObserver() {
  if (observer) {
    observer.disconnect()
  }
}

onMounted(async () => {
  if (userInfo && userInfo.value && curPage.value >= 0) {
    await updateNum()
  }
  if (partition.value === '课程专区') {
    const data = await getTeachers()
    // 后端的事(X)
    // 前端的事(O)
    data.sort((a, b) => a.Name.localeCompare(b.Name))
    teachers.value = ['', ...data]
  }
  startObserver()
})

onUnmounted(() => {
  endObserver()
})

// 组件被激活时（从缓存恢复）
onActivated(async () => {
  // 恢复滚动位置
  document.body.scrollTop = scrollTop.value
  // 请求帖子数量
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  if (id > totalNum.value && id - totalNum.value <= 100) {
    const res = await getPosts({
      limit: id - totalNum.value,
      offset: 0,
      partition: partition.value,
      searchsort: searchsort.value,
      searchinfo: searchinfo.value,
      userTelephone: userInfo.value.phone,
      tag: tag.value,
    })
    if (res) {
      posts.value = [...res, ...posts.value]
    }
    curPage.value += id - totalNum.value
    totalNum.value = id
  }
})

onBeforeRouteLeave((to, from, next) => {
  scrollTop.value = document.body.scrollTop
  next()
})

/**
 * 这四个watch之后可以考虑改成watchEffect
 */
watch(partition, async (newVal) => {
  endObserver()
  posts.value = []
  curPage.value = 0
  const arr = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: newVal,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: newVal,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  totalNum.value = id
  if (newVal === '课程专区') {
    const data = await getTeachers()
    teachers.value = ['', ...data]
  }
  startObserver()
})
watch(searchinfo, async (newVal) => {
  endObserver()
  posts.value = []
  curPage.value = 0
  const arr = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: newVal,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: newVal,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  totalNum.value = id
  startObserver()
})
watch(searchsort, async (newVal) => {
  endObserver()
  posts.value = []
  curPage.value = 0
  const arr = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: partition.value,
    searchsort: newVal,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: newVal,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: tag.value,
  })
  totalNum.value = id
  startObserver()
})
watch(tag, async (newVal) => {
  endObserver()
  posts.value = []
  curPage.value = 0
  const arr = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: newVal,
  })
  posts.value = arr
  // 后端bug，不管有没有tag，都返回课程专区总帖子数量
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: newVal,
  })
  totalNum.value = id
  if (!arr) {
    curPage.value = 0
    totalNum.value = 0
  }
  else {
    curPage.value = arr.length
    totalNum.value = arr.length < 5 ? arr.length : id
  }
  startObserver()
})
</script>

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
      <PostCard
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
