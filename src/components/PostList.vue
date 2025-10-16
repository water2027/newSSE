<script setup lang="ts">
import type { Post } from '@/types/post'

import { onUnmounted, useTemplateRef, watch } from 'vue'
import PostCard from './card/PostCard.vue'
import RatingCard from './rating/RatingCard.vue'

const { isDense, posts = [], isLoading = false, hasMore = true, newPostIds = [], postType = 'default' } = defineProps<{
  isDense?: boolean
  posts?: Post[]
  isLoading?: boolean
  hasMore?: boolean
  newPostIds?: number[]
  postType?: 'post' | 'rating' // 只支持两种明确类型 rating只在打分区使用
}>()

const emits = defineEmits(['bottom'])

// 直接根据 postType 选择组件
const cardComponent = postType === 'rating' ? RatingCard : PostCard

const bottom = useTemplateRef('bottom')
let observer: IntersectionObserver

function startObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          emits('bottom')
        }
      })
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    },
  )
  if (bottom.value) {
    observer.observe(bottom.value)
  }
}

function endObserver() {
  if (observer) {
    observer.disconnect()
  }
}

watch(
  () => bottom.value,
  (newValue) => {
    if (newValue) {
      endObserver()
      startObserver()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  endObserver()
})
</script>

<template>
  <div class="w-full">
    <component
      :is="cardComponent"
      v-for="post in posts"
      :key="post.PostID"
      class="mx-auto my-3 w-15/16"
      :is-dense="isDense"
      :is-new="newPostIds.includes(post.PostID)"
      :post="post"
    />
    <template v-if="hasMore">
      <div
        v-if="!isLoading"
        ref="bottom"
        class="bottomDiv"
      >
        loading...
      </div>
    </template>
    <template v-else>
      <div class="bottomDiv">
        暂无更多
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.list-enter-active,
.list-leave-active {
  opacity: 1;
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.bottomDiv {
  text-align: center;
}
</style>
