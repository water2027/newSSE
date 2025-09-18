<script setup lang="ts">
import { computed } from 'vue'
import { showMsg } from '@/components/MessageBox'

interface Props {
  score?: number // 当前评分(0-5)
  editable?: boolean // 是否可编辑
  postId?: number // 文章ID（新增）
}

const props = withDefaults(defineProps<Props>(), {
  score: 0,
  editable: false,
  postId: undefined, // 默认未定义
})

const emit = defineEmits<{
  (e: 'update:score', value: number): void
  (e: 'score-submitted', value: number): void
  (e: 'submit-rating', value: number): void // 新增提交事件
}>()

// 计算星星状态
const starStates = computed(() => {
  return Array.from({ length: 5 }, (_, index) => ({
    isFilled: index + 1 <= props.score,
    value: index + 1,
  }))
})

// 处理评分提交
const handleScoreSubmit = (value: number) => {
  if (!props.editable) return
  if (value < 1 || value > 5) {
    showMsg('评分必须在1-5之间')
    return
  }
  emit('submit-rating', value) // 触发提交事件
}
</script>

<template>
  <div class="score-container">
    <!-- 只读模式 -->
    <div v-if="!editable" class="read-only">
      <span class="score-value">{{ score.toFixed(1) }}</span>
      <div class="stars">
        <svg
          v-for="star in starStates"
          :key="star.value"
          class="star-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            :fill="star.isFilled ? '#ffc107' : '#e0e0e0'"
          />
        </svg>
      </div>
    </div>

    <!-- 可编辑模式 -->
    <div v-else class="editable">
      <div class="stars">
        <svg
          v-for="star in starStates"
          :key="star.value"
          class="star-icon interactive"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          @click="handleScoreSubmit(star.value)"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            :fill="star.isFilled ? '#ffc107' : '#e0e0e0'"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.score-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.read-only {
  display: flex;
  align-items: center;
}

.editable .stars {
  display: flex;
  gap: 6px;
}

.star-icon.interactive {
  cursor: pointer;
  transition: transform 0.2s;
}

.star-icon.interactive:hover {
  transform: scale(1.15);
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  min-width: 36px;
  text-align: center;
}
</style>