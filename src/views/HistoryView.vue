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
  const more = await addPost(userInfo.phone)
  if (!more) {
    hasMore.value = false
  }
  isLoading.value = false
}

onMounted(async () => {
  refreshPosts()
  changeTo('历史')
  await updateNum(userInfo.phone)
})
</script>

<template>
  <div class="w-full">
    <h2>发帖历史</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
