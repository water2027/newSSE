<script setup lang="ts">
import {
    onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'
import NewList from '@/components/NewList.vue'
import { useUserStore } from '@/store/userStore'
import { usePostStore, Partitions } from '@/store/postStore'
import { showMsg } from '@/components/MessageBox'

const { userInfo } = useUserStore()
const { posts, addPost, changeTo, refreshPosts } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)
const router = useRouter()
async function update() {
  isLoading.value = true
  const num = await addPost(userInfo.phone, 10)
  if (num < 10) {
    hasMore.value = false
  }
  isLoading.value = false
}

onMounted(() => {
    const partition = new URLSearchParams(window.location.search).get('name') as typeof Partitions[number]
    if (!partition) {
        router.push('/')
        showMsg('分区不存在')
        return
    }
    if(partition === '课程专区') {
      router.push('/course')
      return
    }
    refreshPosts()
    changeTo(partition)
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
