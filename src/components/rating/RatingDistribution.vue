<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  stars: [number, number, number, number, number] // 1-5星数量
}>()

// 计算总数和百分比
const total = computed(() => props.stars.reduce((sum, v) => sum + v, 0))
const percentages = computed(() => 
  props.stars.map(v => total.value ? Math.round((v / total.value) * 1000) / 10 : 0)
)

// 绿色主题配置
const theme = {
  primaryGreen: '#10B981', // 主绿色
  lightGreen: '#6EE7B7',  // 浅绿色（可选）
  barHeight: '24px',
  textColor: '#059669'    // 深绿色文字
}
</script>

<template>
  <div class="rating-container">
    <!-- 遍历1-5星 -->
    <div v-for="(count, index) in stars" :key="index" class="rating-item">
      <!-- 绿色数字 -->
      <span class="count-number" :style="{ color: theme.textColor }">
        {{ count }}
      </span>
      
      <!-- 百分比进度条 -->
      <div class="progress-container">
        <div 
          class="progress-bar" 
          :style="{
            width: `${percentages[index]}%`,
            backgroundColor: theme.primaryGreen,
            height: theme.barHeight
          }"
        ></div>
        <div 
          class="progress-bg" 
          :style="{ height: theme.barHeight }"
        ></div>
      </div>
      
      <!-- 百分比文字 -->
      <span class="percent-text">
        {{ percentages[index] }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.rating-container {
  font-family: 'Arial', sans-serif;
  width: 300px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin: 12px 0;
}

.count-number {
  width: 40px;
  font-size: 18px;
  font-weight: bold;
  text-align: right;
  margin-right: 12px;
}

.progress-container {
  flex: 1;
  position: relative;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  transition: width 0.5s ease;
}

.progress-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background-color: #E5E7EB;
  z-index: 1;
}

.percent-text {
  width: 50px;
  text-align: right;
  margin-left: 12px;
  color: #6B7280;
  font-size: 14px;
}
</style>