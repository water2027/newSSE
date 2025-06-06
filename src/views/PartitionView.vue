<script setup lang="ts">
import type { Partitions } from '@/store/postStore'
import {
  onMounted,
  ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostView } from '@/composables/usePostView'

const name = ref('')
const route = useRoute()
const router = useRouter()
const { posts, update, isLoading, hasMore, initialize } = usePostView()

onMounted(() => {
  const params = route.params
  if (!('name' in params)) {
    router.push('/')
    showMsg('分区不存在')
    return
  }
  const partition = params.name as typeof Partitions[number]
  if (partition === '课程专区') {
    router.push('/course')
    return
  }
  name.value = partition
  initialize(partition)
})
</script>

<template>
  <div class="w-full">
    <h2>{{ name }}</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
