<script setup lang="ts">
import type { Post } from '@/types/post'
import { onUnmounted, useTemplateRef, watch } from 'vue'
import PostCard from './card/PostCard.vue'

const { isDense, posts = [], isLoading = false, hasMore = true } = defineProps<{
  isDense?: boolean
  posts?: Post[]
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
      <PostCard
        v-for="post in posts"
        :key="post.PostID"
        class="mx-a my-3 w-15/16"
        :is-dense="isDense"
        :post="post"
      />
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
