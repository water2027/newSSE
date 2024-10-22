<template>
  <post-list />
</template>
<script setup>
import PostList from '@/components/PostList.vue';
import { ref, onActivated, onDeactivated } from 'vue'

// 保存滚动位置
const scrollTop = ref(0)

// 组件被激活时（从缓存恢复）
onActivated(() => {
  // 恢复滚动位置
  document.body.scrollTop = scrollTop.value
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  // 保存滚动位置
  scrollTop.value = document.body.scrollTop
  document.body.scrollTop = 0
})
</script>
