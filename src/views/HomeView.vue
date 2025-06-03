<script setup lang="ts">
import type { Condition } from '@/store/postStore'

import type { Post } from '@/types/post'
import {
  onActivated,
  onDeactivated,
  onMounted,
  reactive,
  ref,
} from 'vue'
import NewList from '@/components/NewList.vue'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

const { userInfo } = useUserStore()
const { posts, restorePosts, storePosts, addPost, updateNum, refreshPosts, changeTo } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)
// 保存滚动位置
const scrollTop = ref(0)
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
  const num = await addPost(userInfo.phone, 10)
  if (num < 10) {
    hasMore.value = false
  }
  isLoading.value = false
}

onMounted(async () => {
  refreshPosts()
  changeTo('主页')
  await updateNum(userInfo.phone)
})

// 组件被激活时（从缓存恢复）
// 其它页面也可以这样做, 不过这里只弄了主页的缓存, 有需要可以改
onActivated(async () => {
  // 恢复滚动位置
  document.body.scrollTop = scrollTop.value
  isLoading.value = true
  await restorePosts(userInfo.phone, cachePosts, cacheTotalNum.value, cacheCondition)
  isLoading.value = false
})
onDeactivated(() => {
  // 保存滚动位置
  scrollTop.value = document.body.scrollTop
  // 清空当前页面的帖子列表
  const data = storePosts()
  cachePosts.splice(0, cachePosts.length, ...data.cachePosts)
  cacheTotalNum.value = data.cacheTotalNum
  Object.assign(cacheCondition, data.cacheConditions)
})
defineExpose({
  name: 'home'
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
</style>
