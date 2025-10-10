<script setup lang="ts">
import type { Condition, Partitions } from '@/store/postStore'
import type { Post } from '@/types/post'
import {
  onActivated,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { onBeforeRouteUpdate,onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostView } from '@/composables/usePostView'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

defineOptions({
  name: 'PartitionView',
})

const name = ref('')
const route = useRoute()
const router = useRouter()
const { userInfo } = useUserStore()
const { restorePosts, storePosts } = usePostStore()
const { posts, update, isLoading, hasMore, initialize } = usePostView()

const isDense = ref(false)

// 保存滚动位置
const scrollTop = ref(0)
const hasCache = ref(false)
const cachePosts = reactive<Post[]>([])
const cacheTotalNum = ref(0)
const cachePartition = ref(route.params.name)
const cacheCondition = reactive<Condition>({
  limit: 10,
  offset: 0,
  partition: cachePartition.value as typeof Partitions[number],
  searchsort: 'home',
  searchinfo: '',
  tag: '',
})

onMounted(async () => {
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
  if (partition === '课程交流')
    // 对于课程交流分区，采用更紧凑的卡片布局
    isDense.value = true
  name.value = partition
  if(!hasCache.value) await initialize(partition)
  hasCache.value = true
})

// 组件被激活时
onActivated(async () => {
  if (!hasCache.value)
    return
  // 恢复滚动位置
  document.body.scrollTop = scrollTop.value
  isLoading.value = true
  await restorePosts(userInfo.phone, cachePosts, cacheTotalNum.value, cacheCondition)
  isLoading.value = false
})

onBeforeRouteUpdate(async (to, from) => {
  // 清空当前页面的帖子列表
  const data = storePosts()
  cachePosts.splice(0, cachePosts.length, ...data.cachePosts)
  cacheTotalNum.value = data.cacheTotalNum
  Object.assign(cacheCondition, data.cacheConditions)
})

onBeforeRouteLeave(async () => {
  // 保存滚动位置
  scrollTop.value = document.body.scrollTop
  // 清空当前页面的帖子列表
  const data = storePosts()
  cachePosts.splice(0, cachePosts.length, ...data.cachePosts)
  cachePartition.value = route.params.name
  cacheTotalNum.value = data.cacheTotalNum
  Object.assign(cacheCondition, data.cacheConditions)
})
</script>

<template>
  <div class="w-full">
    <h2>{{ name }}</h2>
    <PostList :posts="posts" :is-dense="isDense" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
