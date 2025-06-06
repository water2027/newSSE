<script setup lang="ts">
import {
  onMounted,
} from 'vue'

import { useRoute } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostView } from '@/composables/usePostView'
import { usePostStore } from '@/store/postStore'

const { search } = usePostStore()
const route = useRoute()
const { posts, update, isLoading, hasMore, initialize } = usePostView()

onMounted(async () => {
  const query = route.query
  if (!('sinfo' in query))
    return showMsg('未知的搜索')
  const sinfo = query.sinfo as string
  await initialize('主页', {
    afterRefresh: () => {
      search(sinfo)
    },
  })
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
