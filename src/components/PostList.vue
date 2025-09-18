<script setup lang="ts">
import type { Post, Score } from '@/types/post'

import { onUnmounted, useTemplateRef, watch } from 'vue'
import PostCard from './card/PostCard.vue'
import ScoreCard from './score/ScoreCard.vue'

const _props = defineProps<{
  // 定义联合类型，接受 Post 或 Score 数组
  items: (Post | Score)[]
  // 标识当前显示的是 Post 还是 Score
  type: 'post' | 'score'
  isLoading?: boolean
  hasMore?: boolean
}>()

const emits = defineEmits(['bottom'])

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
    <transition-group name="list">
      <!-- 静态条件渲染（根据type选择组件） -->
      <template v-if="type === 'post'">
        <PostCard
          v-for="item in items as Post[]"
          :key="`post-${item.PostID}`"
          :post="item"
          class="card mx-auto my-3 w-15/16"
        />
      </template>

      <template v-else-if="type === 'score'">
        <ScoreCard
          v-for="item in items as Score[]"
          :key="`score-${item.PostID}`"
          :post="item"
          :score="item"
          class="card mx-auto my-3 w-15/16"
        />
      </template>
    </transition-group>
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
        noMore
      </div>
      <!--
      <div class="bottomDiv">
      {{ hasMore ? (isLoading ? 'loading...' : '') : 'noMore' }}
      </div>ai给的优化 -->
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
</style>
