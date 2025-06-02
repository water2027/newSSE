<script setup lang="ts">
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

import { useUserStore } from '@/store/userStore'

// const userInfo = inject('userInfo')
const { userInfo } = useUserStore()
const searchinfo = inject('searchinfo')
const searchsort = inject('searchsort')
const partition = ref('主页')
const posts = ref([])
const totalNum = ref(0)
const curPage = ref(0)
const limit = ref(10)
const hasMore = computed(() => curPage.value < totalNum.value)
const isLoading = ref(false)
// 保存滚动位置
const scrollTop = ref(0)

async function updateNum() {
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.phone,
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
    userTelephone: userInfo.phone,
    tag: '',
  })
  if (res) {
    posts.value = [...posts.value, ...res]
  }
  else {
    totalNum.value = posts.value.length
  }
}

function deletePost(id) {
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

async function getMore() {
  await addPosts()
  try {
    curPage.value = posts.value.length
  }
  catch (e) {
    curPage.value = 0
  }
}

async function update() {
  isLoading.value = true
  await getMore()
  isLoading.value = false
}

onMounted(async () => {
  if (!userInfo || !userInfo || curPage.value < 0)
    return
  await updateNum()
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
    userTelephone: userInfo.phone,
    tag: '',
  })
  if (id > totalNum.value && id - totalNum.value <= 100) {
    const res = await getPosts({
      limit: id - totalNum.value,
      offset: 0,
      partition: partition.value,
      searchsort: searchsort.value,
      searchinfo: searchinfo.value,
      userTelephone: userInfo.phone,
      tag: '',
    })
    if (res) {
      posts.value = [...res, ...posts.value]
    }
    curPage.value += id - totalNum.value
    totalNum.value = id
  }
})

/**
 * 这四个watch之后可以考虑改成watchEffect
 */
watch(searchinfo, async (newVal) => {
  posts.value = []
  curPage.value = 0
  const arr = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: newVal,
    userTelephone: userInfo.phone,
    tag: '',
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: searchsort.value,
    searchinfo: newVal,
    userTelephone: userInfo.phone,
    tag: '',
  })
  totalNum.value = id
})
watch(searchsort, async (newVal) => {
  posts.value = []
  curPage.value = 0
  const arr = await getPosts({
    limit: limit.value,
    offset: curPage.value,
    partition: partition.value,
    searchsort: newVal,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.phone,
    tag: '',
  })
  posts.value = arr
  curPage.value = arr.length
  const id = await getPostsNum({
    partition: partition.value,
    searchsort: newVal,
    searchinfo: searchinfo.value,
    userTelephone: userInfo.phone,
    tag: '',
  })
  totalNum.value = id
})
</script>

<template>
  <div class="root">
    <h2>主页</h2>
    <NewList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
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
