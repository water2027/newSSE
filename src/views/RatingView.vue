<script setup lang="ts">
import type { Condition, Partitions } from '@/store/postStore'
import type { Post } from '@/types/post'
import {
  onActivated,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { showMsg } from '@/components/MessageBox'
import PostList from '@/components/PostList.vue'
import { usePostView } from '@/composables/usePostView'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

defineOptions({
  name: 'RatingView',
})

const name = ref('')
const route = useRoute()
const router = useRouter()
const { userInfo } = useUserStore()
const { restorePosts, storePosts } = usePostStore()
const { posts, update, isLoading, hasMore, initialize } = usePostView()

const isDense = ref(true)

// 保存滚动位置
const scrollTop = ref(0)
const hasCache = ref(false)
const cachePosts = reactive<Post[]>([])
const cacheTotalNum = ref(0)
const cacheCondition = reactive<Condition>({
  limit: 10,
  offset: 0,
  partition: '打分',
  searchsort: 'rating',
  searchinfo: '',
  tag: '',
})

onMounted(async () => {
  await initialize('打分')
  hasCache.value = true
})

// 组件被激活时
// 其它页面也可以这样做, 不过这里只弄了主页的缓存, 有需要可以改
onActivated(async () => {
  if (!hasCache.value)
    return

    // 恢复滚动位置
    document.body.scrollTop = scrollTop.value
    isLoading.value = true
    await restorePosts(userInfo.phone, cachePosts, cacheTotalNum.value, cacheCondition)
    isLoading.value = false
})

onBeforeRouteLeave(() => {
  // 保存滚动位置
  scrollTop.value = document.body.scrollTop
  // 清空当前页面的帖子列表
  const data = storePosts()
  cachePosts.splice(0, cachePosts.length, ...data.cachePosts)
  cacheTotalNum.value = data.cacheTotalNum
  Object.assign(cacheCondition, data.cacheConditions)
})

// 监听路由参数变化，当有refresh参数时重新加载数据
watch(() => route.query.refresh, async (newRefresh) => {
  if (newRefresh && hasCache.value) {
    // 重新加载最新数据
    await initialize('打分')

    // 清除refresh参数，避免重复触发
    const newQuery = { ...route.query }
    delete newQuery.refresh
    // 使用replace避免在历史记录中留下refresh参数
    const queryString = Object.keys(newQuery).length > 0 ? `?${new URLSearchParams(newQuery as Record<string, string>).toString()}` : ''
    window.history.replaceState({}, '', `${route.path}${queryString}`)
  }
})
</script>

<template>
  <div class="w-full">
    <h2>{{ name }}</h2>
    <PostList :posts="posts" post-type="rating" :is-dense="isDense" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
