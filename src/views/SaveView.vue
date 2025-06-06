<script setup lang="ts">
import {
  onMounted,
  ref,
} from 'vue'

import PostList from '@/components/PostList.vue'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

const { userInfo } = useUserStore()
const { posts, addPost, changeTo, refreshPosts, updateNum } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)

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
  changeTo('收藏')
  await updateNum(userInfo.phone)
})
</script>

<template>
  <div class="w-full">
    <h2>收藏</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
