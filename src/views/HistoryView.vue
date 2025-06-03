<script setup lang="ts">
import {
    onMounted,
  ref,
} from 'vue'

import NewList from '@/components/NewList.vue'
import { useUserStore } from '@/store/userStore'
import { usePostStore } from '@/store/postStore'

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
    changeTo('历史')
    await updateNum(userInfo.phone)
})
</script>

<template>
  <div class="root">
    <h2>发帖历史</h2>
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
