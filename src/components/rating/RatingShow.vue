<script setup lang="ts">
import { ref,computed } from 'vue'
import { showMsg } from '@/components/MessageBox'

interface Props {
  rating?: number // 当前评分(0-5)
  editable?: boolean // 是否可编辑
}

const props = withDefaults(defineProps<Props>(), {
  rating: 0,
  editable: false,
})



const emit = defineEmits(['rating-click']) // 事件名同步更新
const hoverRating = ref(0)

// 计算星星状态
const starStates = computed(() => {
  return Array.from({ length: 5 }, (_, index) => ({
    isFilled: index + 1 <= props.rating,
    value: index + 1,
  }))
})

// 点击事件处理（严格单向数据流）
function handleStarClick(value: number) {
  if (!props.editable) {
    // 非编辑模式：只触发事件，不修改内部状态
    emit('rating-click', props.rating) // 传递当前rating
    return
  }
  
  // 编辑模式逻辑（如果需要可在此扩展）
  emit('rating-click', value)
}

</script>

<template>
  <div class="Rating-container" :class="{ editable }">
    <div class="stars">
      <svg
        v-for="star in starStates"
        :key="star.value"
        class="star-icon"
        :class="[
          { 
            interactive: editable,
            'size-small': !editable,
            'size-large': editable,
            'hover-bright': editable && star.value <= hoverRating
          },
          star.isFilled ? 'filled' : 'empty'
        ]"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        @click="handleStarClick(star.value)"
        @mouseover="editable && (hoverRating = star.value)"
        @mouseleave="editable && (hoverRating = 0)"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          :fill="star.isFilled ? '#ffc107' : '#e0e0e0'"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
.star-icon {
  transition: all 0.2s ease;
}

/* 只读模式星星大小 */
.star-icon.size-small {
  width: 20px;
  height: 20px;
}

/* 可编辑模式星星大小 */
.star-icon.size-large {
  width: 28px;
  height: 28px;
}

/* 悬停效果 - 使用filter实现亮度增加 */
.star-icon.interactive.hover-bright {
  filter: brightness(1.1);
}

/* 选中状态 */
.star-icon.filled {
  fill: #ffc107;
}

.star-icon.empty {
  fill: #e0e0e0;
}

/* 悬停时未选中的星星变暗 */
.star-icon.interactive:not(.hover-bright):not(.filled) {
  opacity: 0.7;
}
</style>