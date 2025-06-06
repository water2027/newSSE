<script setup lang="ts">
import type { Partitions } from '@/store/postStore'
import {
  onMounted,
  ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

const name = ref('')
const { userInfo } = useUserStore()
const { posts, addPost, changeTo, refreshPosts } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)
const route = useRoute()
const router = useRouter()
async function update() {
  isLoading.value = true
  const more = await addPost(userInfo.phone)
  if (!more) {
    hasMore.value = false
  }
  isLoading.value = false
}

onMounted(() => {
  const params = route.params
  if(!('name' in params)) {
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
  refreshPosts()
  changeTo(partition)
})
</script>

<template>
  <div class="w-full">
    <h2>{{ name }}</h2>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
