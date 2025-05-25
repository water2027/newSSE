<script setup>
import {
  computed,
  inject,
  onActivated,
  onMounted,
  ref,
  watch,
} from 'vue'
import { getPosts, getPostsNum } from '@/api/browse/getPost'

import NewList from '@/components/NewList.vue'

const userInfo = inject('userInfo')
const searchinfo = inject('searchinfo')
const searchsort = inject('searchsort')
const partition = ref('home')
const posts = ref([])
const totalNum = ref(0)
const curPage = ref(0)
const limit = ref(10)
const isLoading = computed(() => curPage.value < totalNum.value)
// 保存滚动位置
const scrollTop = ref(0)

// 用于滚动加载
const bottom = ref(null)

async function updateNum() {
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: '',
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
    tag: '',
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
    }
  }
}

onMounted(async () => {
  if (userInfo && userInfo.value && curPage.value >= 0) {
    await updateNum()
  }
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
    tag: '',
  })
  if (id > totalNum.value && id - totalNum.value <= 100) {
    const res = await getPosts({
      limit: id - totalNum.value,
      offset: 0,
      partition: partition.value,
      searchsort: searchsort.value,
      searchinfo: searchinfo.value,
      userTelephone: userInfo.value.phone,
      tag: '',
    })
    if (res) {
      posts.value = [...res, ...posts.value]
    }
    curPage.value += id - totalNum.value
    totalNum.value = id
  }
})

// onBeforeRouteLeave((to, from, next) => {
//   scrollTop.value = document.body.scrollTop
//   next()
// })

/**
 * 这四个watch之后可以考虑改成watchEffect
 */
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
    tag: '',
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: newVal,
    userTelephone: userInfo.value.phone,
    tag: '',
  })
  totalNum.value = id
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
    tag: '',
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: newVal,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.value.phone,
    tag: '',
  })
  totalNum.value = id
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
})
</script>

<template>
  <div class="root">
    <h2>主页</h2>
    <NewList />
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

a {
  text-decoration: none;
  color: var(--color-text);
  display: block;
}
</style>
