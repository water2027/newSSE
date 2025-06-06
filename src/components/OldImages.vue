<script lang="ts" setup>
import { strHandler } from '@/utils/strHandler'

defineProps<{
  photos: string
}>()
</script>

<template>
  <div
    class="imgs"
  >
    <!-- 图片路径由|分割 -->
    <!-- 为了支持旧版的帖子, 这里新版帖子不会再有Photos了 -->
    <img
      v-for="img in strHandler('img', photos)"
      :key="img"
      :src="img"
    >
  </div>
</template>

<style lang="scss">
.imgs img {
  width: 100px;
  height: 100px;
  margin: 5px;
}
@media screen and (min-width: 768px) {
  .imgs {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
