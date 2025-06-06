<script setup lang="ts">
import type { Condition } from '@/store/postStore'

import type { Post } from '@/types/post'
import {
  onActivated,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import PostList from '@/components/PostList.vue'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

defineOptions({
  name: 'HomeView',
})
const { userInfo } = useUserStore()
const { posts, restorePosts, storePosts, addPost, updateNum, refreshPosts, changeTo } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)
// 保存滚动位置
const scrollTop = ref(0)
const hasCache = ref(false)
const cachePosts = reactive<Post[]>([])
const cacheTotalNum = ref(0)
const cacheCondition = reactive<Condition>({
  limit: 10,
  offset: 0,
  partition: '主页',
  searchsort: 'home',
  searchinfo: '',
  tag: '',
})

async function update() {
  isLoading.value = true
  const more = await addPost(userInfo.phone)
  if (!more) {
    hasMore.value = false
  }
  isLoading.value = false
}

onMounted(async () => {
  refreshPosts()
  changeTo('主页')
  await updateNum(userInfo.phone)
  hasCache.value = true
})

// 组件被激活时
// 其它页面也可以这样做, 不过这里只弄了主页的缓存, 有需要可以改
onActivated(async () => {
  if (!hasCache.value)
    return
  // 恢复滚动位置
  document.documentElement.scrollTop = scrollTop.value
  isLoading.value = true
  await restorePosts(userInfo.phone, cachePosts, cacheTotalNum.value, cacheCondition)
  isLoading.value = false
})

onBeforeRouteLeave(() => {
  // 保存滚动位置
  scrollTop.value = document.documentElement.scrollTop
  // 清空当前页面的帖子列表
  const data = storePosts()
  cachePosts.splice(0, cachePosts.length, ...data.cachePosts)
  cacheTotalNum.value = data.cacheTotalNum
  Object.assign(cacheCondition, data.cacheConditions)
})
</script>

<template>
  <div class="w-full">
    <h2>主页</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
