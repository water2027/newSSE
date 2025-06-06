<script setup lang="ts">
import {
  onMounted,
  ref,
} from 'vue'

import { useRoute } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

const { userInfo } = useUserStore()
const { posts, addPost, refreshPosts, updateNum, search } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)
const route = useRoute()

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
  const query = route.query
  if (!('sinfo' in query))
    return showMsg('未知的搜索')
  const sinfo = query.sinfo as string
  search(sinfo)
  await updateNum(userInfo.phone)
})
</script>

<template>
  <div class="root">
    <h2>搜索</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
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
