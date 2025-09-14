<script setup lang="ts">
import type { Partitions } from '@/store/postStore'
import {
  onMounted,
  ref,
} from 'vue'

import { useRoute } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostView } from '@/composables/usePostView'
import { usePostStore } from '@/store/postStore'

const { search } = usePostStore()
const route = useRoute()
const { posts, update, isLoading, hasMore, initialize } = usePostView()

const isDense = ref(false)

onMounted(async () => {
  const query = route.query
  if (!('sinfo' in query))
    return showMsg('未知的搜索')
  const sinfo = query.sinfo as string
  const partition = query?.partition as typeof Partitions[number]
  // 参考PartitionView
  if (partition === '课程交流')
    isDense.value = true
  await initialize(partition || '主页', {
    afterRefresh: () => {
      search(sinfo, partition)
    },
  })
})
</script>

<template>
  <div class="root">
    <h2>搜索</h2>
    <PostList :posts="posts" :is-dense="isDense" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
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
