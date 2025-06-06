<script setup lang="ts">
import {
  onMounted,
} from 'vue'

import PostList from '@/components/PostList.vue'
import { usePostView } from '@/composables/usePostView'

const { posts, hasMore, isLoading, update, initialize } = usePostView()

onMounted(() => {
  initialize('历史')
})
</script>

<template>
  <div class="w-full">
    <h2>发帖历史</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
