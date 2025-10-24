<script setup lang="ts">
import type { Rating } from '@/types/post'
import PostCard from '../card/PostCard.vue'

defineOptions({
  name: 'RatingCard',
})

const { isDense, post, isNew, noSave = true } = defineProps<{
  isDense?: boolean
  post: Rating
  isNew?: boolean
  noSave?: boolean
}>()

// 计算总评分人数
function getTotalRatings() {
  return (post.Stars || []).reduce((sum, count) => sum + count, 0)
}
</script>

<template>
  <PostCard
    :is-dense="isDense"
    :post="post"
    :is-new="isNew"
    :no-save="noSave"
    v-bind="$attrs"
  >
    <!-- 评分统计信息 - 右上方 -->
    <template #right-extension>
      <div class="rating-badge-floating">
        <div class="rating-score">
          <span class="rating-number">{{ (post.Rating || 0).toFixed(1) }}</span>
          <span class="rating-stars">★</span>
        </div>
      </div>
    </template>
    <template #center-extension>
      <div class="total-ratings">
        {{ getTotalRatings() }}人评分
      </div>
    </template>
  </PostCard>
</template>

<style scoped>
.rating-badge-floating {
  position: relative;
  top: 50%;
  transform: translateY(-10%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(12px);
  min-width: 70px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rating-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.rating-number {
  font-size: 20px;
  font-weight: 800;
  color: #2563eb;
  text-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rating-stars {
  font-size: 18px;
  color: #4a90e2;
  filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.total-ratings {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rating-badge-floating {
    top: 50%;
    transform: translateY(-10%);
    padding: 6px 8px;
    min-width: 60px;
  }

  .rating-number {
    font-size: 18px;
  }

  .rating-stars {
    font-size: 16px;
  }

  .total-ratings {
    font-size: 10px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .rating-badge-floating {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%);
    border-color: rgba(55, 65, 81, 0.8);
  }

  .rating-badge-floating:hover {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%);
  }

  .rating-number {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 4px rgba(96, 165, 250, 0.15);
  }

  .rating-stars {
    color: #60a5fa;
    filter: drop-shadow(0 2px 4px rgba(96, 165, 250, 0.3));
  }

  .total-ratings {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
</style>
