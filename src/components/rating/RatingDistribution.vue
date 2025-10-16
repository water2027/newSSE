<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stars: [number, number, number, number, number] // 1-5星数量
  averageRating?: number // 平均评分
  userRating?: number // 用户评分
  isMobile?: boolean // 是否为移动端
  showUserRating?: boolean // 是否显示用户评分区域
}>()

const emits = defineEmits<{
  ratingClick: [rating: number]
}>()

// 计算总数和百分比
const total = computed(() => (props.stars || []).reduce((sum, v) => sum + v, 0))
const percentages = computed(() =>
  (props.stars || []).map(v => total.value ? Math.round((v / total.value) * 1000) / 10 : 0),
)

// 计算进度条宽度
function getProgressWidth(count: number) {
  return total.value > 0 ? Math.round((count / total.value) * 100) : 0
}

// 处理评分点击
function handleRatingClick(rating: number) {
  emits('ratingClick', rating)
}
</script>

<template>
  <div class="rating-distribution" :class="{ 'mobile-layout': isMobile }">
    <!-- 移动端布局 -->
    <template v-if="isMobile">
      <div class="mobile-rating-container">
        <div class="mobile-rating-header">
          <span class="mobile-rating-title">评分</span>
          <span class="mobile-average-rating">{{ (averageRating || 0).toFixed(1) }}★</span>
        </div>
        
        <!-- 用户评分区域 -->
        <div v-if="showUserRating" class="mobile-user-rating-section">
          <span class="mobile-user-rating-label">我的评分：</span>
          <div class="mobile-user-rating">
            <span 
              v-for="n in 5" 
              :key="n" 
              class="mobile-rating-star"
              :class="{ 'filled': n <= (userRating || 0) }"
              @click="handleRatingClick(n)"
            >★</span>
            <span class="rating-hint">点击直接评分</span>
          </div>
        </div>
        
        <!-- 评分分布 -->
        <!-- <div class="mobile-rating-breakdown">
          <div v-for="(count, index) in (stars || []).slice().reverse()" :key="`mobile-rating-${4-index}-${count}`" class="mobile-rating-item">
            <div class="mobile-stars">
              <span v-for="n in (5 - index)" :key="n" class="mobile-star-filled">★</span>
            </div>
            <span class="mobile-percentage">{{ getProgressWidth(count) }}%</span>
          </div>
        </div> -->
        <div class="rating-breakdown">
          <div v-for="(count, index) in (stars || []).slice().reverse()" :key="`rating-${4-index}-${count}`" class="rating-item-small">
            <div class="star-info">
              <span class="star-num">{{ 5 - index }}</span>
              <span class="star-icon">★</span>
            </div>
            <div class="progress-container-small">
              <div class="progress-bar-small" :style="{ width: `${getProgressWidth(count)}%` }"></div>
            </div>
            <span class="star-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 桌面端布局 -->
    <template v-else>
      <div class="desktop-rating-container">
        <div class="rating-main">
          <span class="rating-number-small">{{ (averageRating || 0).toFixed(1) }}</span>
          <span class="rating-stars-small">★</span>
        </div>
        
        <!-- 用户评分区域 -->
        <div v-if="showUserRating" class="user-rating-section">
          <span class="user-rating-label">我的评分：</span>
          <div class="user-rating-stars">
            <span 
              v-for="n in 5" 
              :key="n" 
              class="user-rating-star"
              :class="{ 'filled': n <= (userRating || 0) }"
              @click="handleRatingClick(n)"
            >★</span>
          </div>
          <span class="rating-hint">点击直接评分</span>
        </div>
        
        <!-- 评分分布 -->
        <div class="rating-breakdown">
          <div v-for="(count, index) in (stars || []).slice().reverse()" :key="`rating-${4-index}-${count}`" class="rating-item-small">
            <div class="star-info">
              <span class="star-num">{{ 5 - index }}</span>
              <span class="star-icon">★</span>
            </div>
            <div class="progress-container-small">
              <div class="progress-bar-small" :style="{ width: `${getProgressWidth(count)}%` }"></div>
            </div>
            <span class="star-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rating-distribution {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  width: 100%;
}

/* 桌面端样式 */
.desktop-rating-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(16px);
  min-width: 160px;
  transform: scale(1.0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rating-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(240, 240, 240, 0.6);
  position: relative;
}

.rating-main::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #4a90e2 50%, transparent 100%);
}

.rating-number-small {
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
}

.rating-stars-small {
  font-size: 14px;
  color: #4a90e2;
  filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.user-rating-section {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0;
  padding: 6px;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.user-rating-label {
  font-size: 12px;
  font-weight: 600;
  color: #4a90e2;
}

.user-rating-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.user-rating-star {
  font-size: 20px;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.user-rating-star.filled {
  color: #4a90e2;
}

.user-rating-star:hover {
  color: #4a90e2;
  transform: scale(1.1);
}

.rating-hint {
  font-size: 10px;
  color: #6b7280;
  font-style: italic;
  margin-left: auto;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rating-item-small {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  margin-bottom: 2px;
  padding: 1px 0;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.rating-item-small:hover {
  background: rgba(74, 144, 226, 0.05);
}

.star-info {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 18px;
}

.star-num {
  color: #64748b;
  font-weight: 600;
  font-size: 9px;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star-icon {
  color: #4a90e2;
  font-size: 9px;
  filter: drop-shadow(0 1px 2px rgba(74, 144, 226, 0.3));
}

.progress-container-small {
  flex: 1;
  height: 4px;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar-small {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2 0%, #357abd 50%, #1d4ed8 100%);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(74, 144, 226, 0.3);
}

.star-count {
  color: #2563eb;
  font-weight: 700;
  min-width: 14px;
  text-align: right;
  font-size: 9px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 移动端样式 */
.mobile-layout {
  margin: 16px 0;
  padding: 0 8px;
}

.mobile-rating-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 16px;
  width: 100%;
}

.mobile-rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(240, 240, 240, 0.6);
}

.mobile-rating-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.mobile-average-rating {
  font-size: 18px;
  font-weight: 700;
  color: #4a90e2;
}

.mobile-user-rating-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.mobile-user-rating-label {
  font-size: 14px;
  font-weight: 600;
  color: #4a90e2;
}

.mobile-user-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-rating-star {
  font-size: 25px;
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  padding: 2px;
}

.mobile-rating-star.filled {
  color: #4a90e2;
}

.mobile-rating-star:hover {
  color: #4a90e2;
  transform: scale(1.2);
}

.mobile-rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-rating-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 16px;
  padding: 0;
}

.mobile-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.mobile-star-filled {
  font-size: 12px;
  color: #4a90e2;
  line-height: 1;
}

.mobile-percentage {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  min-width: 30px;
  text-align: right;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .desktop-rating-container {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%);
    border-color: rgba(55, 65, 81, 0.8);
  }
  
  .rating-main {
    border-bottom-color: rgba(55, 65, 81, 0.6);
  }
  
  .rating-main::after {
    background: linear-gradient(90deg, transparent 0%, #60a5fa 50%, transparent 100%);
  }
  
  .rating-number-small {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .rating-stars-small {
    color: #60a5fa;
    filter: drop-shadow(0 2px 4px rgba(96, 165, 250, 0.3));
  }
  
  .user-rating-section {
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.2);
  }
  
  .user-rating-label {
    color: #60a5fa;
  }
  
  .rating-hint {
    color: #9ca3af;
  }
  
  .rating-item-small:hover {
    background: rgba(96, 165, 250, 0.1);
  }
  
  .star-num {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .star-icon {
    color: #60a5fa;
    filter: drop-shadow(0 1px 2px rgba(96, 165, 250, 0.3));
  }
  
  .progress-container-small {
    background: linear-gradient(90deg, #374151 0%, #1f2937 100%);
  }
  
  .progress-bar-small {
    background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%);
    box-shadow: 0 1px 3px rgba(96, 165, 250, 0.3);
  }
  
  .star-count {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .mobile-rating-container {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%);
    border-color: rgba(55, 65, 81, 0.8);
  }
  
  .mobile-rating-header {
    border-bottom-color: rgba(55, 65, 81, 0.6);
  }
  
  .mobile-rating-title {
    color: #f9fafb;
  }
  
  .mobile-average-rating {
    color: #60a5fa;
  }
  
  .mobile-user-rating-section {
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.2);
  }
  
  .mobile-user-rating-label {
    color: #60a5fa;
  }
}
</style>
