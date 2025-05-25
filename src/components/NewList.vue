<script setup>
import PostCard from './card/PostCard.vue';
defineProps({
  posts: Array,
  default: [],
})
</script>

<template>
  <transition-group name="list">
    <PostCard
      v-for="post in posts"
      :key="post.PostID"
      :post="post"
      :delete-handler="deleteHandler"
    />
  </transition-group>
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
