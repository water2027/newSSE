<script setup>
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import PostCard from './card/PostCard.vue'

defineProps({
  posts: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['bottom'])

const bottom = useTemplateRef('bottom')
let observer = null

function startObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('bottom')
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

onMounted(() => {
  startObserver()
})

onUnmounted(() => {
  endObserver()
})
</script>

<template>
  <div>
    <transition-group name="list">
      <PostCard
        v-for="post in posts"
        :key="post.PostID"
        :post="post"
        :delete-handler="deleteHandler"
      />
    </transition-group>
    <div
      v-if="!isLoading"
      ref="bottom"
      class="bottomDiv"
    >
      loading...
    </div>
    <div
      v-else-if="hasMore"
      class="bottomDiv"
    >
      isLoading...
    </div>
    <div v-else class="bottomDiv">
      noMore
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
