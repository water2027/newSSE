<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  rating?: number // 当前评分(0-5)
  editable?: boolean // 是否可编辑
}

const props = withDefaults(defineProps<Props>(), {
  rating: 0,
  editable: false,
})

const emit = defineEmits(['ratingClick'])

const currRating = ref(props.rating)

// 事件名同步更新
const hoverRating = ref(0)

// 计算应该显示的星星数量
const displayStars = computed(() => {
  // 可编辑模式：总是显示5颗星星
  return Array.from({ length: 5 }, (_, index) => ({
    isFilled: index + 1 <= props.rating,
    value: index + 1,
  }))
})

// 使用 ref 来存储星星状态，确保响应式更新
const starStates = ref(displayStars.value)

// 监听 props.rating 的变化
watch(() => currRating.value, () => {
  starStates.value = displayStars.value
}, { immediate: true })

// 点击事件处理（严格单向数据流）
function handleStarClick(value: number) {
  // 无论是否可编辑，都传递点击的星星值
  emit('ratingClick', value)
}
</script>

<template>
  <div class="Rating-container" :class="{ editable }">
    <!-- 渐变定义 -->
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#357abd;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2c5aa0;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>

    <div class="stars">
      <svg
        v-for="star in starStates"
        :key="star.value"
        class="star-icon"
        :class="[
          {
            'interactive': editable,
            'size-small': !editable,
            'size-large': editable,
            'hover-bright': editable && star.value <= hoverRating,
          },
          star.isFilled ? 'filled' : 'empty',
        ]"
        :width="editable ? '32' : '18'"
        :height="editable ? '32' : '18'"
        viewBox="0 0 24 24"
        @click="handleStarClick(star.value)"
        @mouseover="editable && (hoverRating = star.value)"
        @mouseleave="editable && (hoverRating = 0)"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.stars {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 基础样式 */
.star-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 只读模式星星大小 */
.star-icon.size-small {
  width: 18px;
  height: 18px;
}

/* 可编辑模式星星大小 */
.star-icon.size-large {
  width: 32px;
  height: 32px;
}

/* 悬停效果 */
.star-icon.interactive:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.star-icon.interactive.hover-bright {
  filter: drop-shadow(0 4px 8px rgba(74, 144, 226, 0.3));
}

/* 选中状态 - 使用渐变和阴影 */
.star-icon.filled {
  fill: url(#starGradient);
  filter: drop-shadow(0 2px 6px rgba(74, 144, 226, 0.4));
}

.star-icon.empty {
  fill: #e5e7eb;
  stroke: #d1d5db;
  stroke-width: 1.5;
}

/* 悬停时未选中的星星 */
.star-icon.interactive:not(.hover-bright):not(.filled) {
  opacity: 0.8;
  fill: #f3f4f6;
}

.star-icon.interactive:not(.hover-bright):not(.filled):hover {
  fill: #4a90e2;
  opacity: 1;
}

/* 添加渐变定义 */
.star-icon.filled path {
  fill: url(#starGradient);
}
</style>
