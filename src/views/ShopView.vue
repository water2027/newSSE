<script setup lang="ts">
import type { Product } from '@/api/shop/getProducts'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProducts } from '@/api/shop/getProducts'
import ProductCard from '@/components/card/ProductCard.vue'
import FloatingBall from '@/components/FloatingBall.vue'
import { preloadSellerNames } from '@/utils/sellerNameMapper'

interface CarouselItem {
  image: string
  title: string
  subtitle?: string
}

// 常量定义
const CAROUSEL_ITEMS: CarouselItem[] = [
  { 
    image: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1749233653768900413_微信图片_20250606162503.jpg', 
    title: '精选商品',
    subtitle: '品质保证，价格优惠'
  },
  { 
    image: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1749233654349407951_96618898_p0.jpg', 
    title: '热门推荐',
    subtitle: '人气爆款，限时特惠'
  },
  { 
    image: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1749233654953918669_121867383_p0.jpg', 
    title: '新品上市',
    subtitle: '最新款式，抢先体验'
  },
]

const AUTOPLAY_INTERVAL = 5000
const PRICE_RANGES = [
  { value: '', label: '全部' },
  { value: '0-5', label: '五元以内' },
  { value: '0-20', label: '二十元以内' },
  { value: '0-50', label: '五十元以内' },
  { value: '0-100', label: '一百元以内' },
  { value: '0-500', label: '五百元以内' },
  { value: '500-1000000', label: '五百元以上' }
] as const

// 路由和注入
const router = useRouter()
const route = useRoute()
const isPC = inject<boolean>('isPC', false)

// 响应式数据
const isLoading = ref(true)
const products = ref<Product[]>([])
const selectedPriceRange = ref<string>('')
const currentIndex = ref(0)
const autoplay = ref(true)
const autoplayTimer = ref<number | null>(null)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// 布局相关状态
const layoutMode = ref<'grid' | 'list'>('grid') // 'grid' 为竖排，'list' 为横排

// 使用常量而不是响应式数据
const carouselItems = CAROUSEL_ITEMS

// 计算属性
const isMain = computed(() => /^\/shop\/?$/.test(route.fullPath))

const filteredProducts = computed<Product[]>(() => {
  if (!selectedPriceRange.value) return products.value
  
  const [min, max] = selectedPriceRange.value.split('-')
  const minPrice = Number.parseInt(min, 10)
  
  return products.value.filter(product => {
    if (max === '+') {
      return product.Price >= minPrice
    }
    const maxPrice = Number.parseInt(max, 10)
    return product.Price >= minPrice && product.Price <= maxPrice
  })
})

const hasProducts = computed(() => products.value.length > 0)
const hasFilteredProducts = computed(() => filteredProducts.value.length > 0)

// 错误处理和重试机制
async function fetchProductsWithRetry(): Promise<void> {
  try {
    error.value = null
    const endpoint = isMain.value ? 'home' : 'history'
    products.value = await getProducts(endpoint)
    retryCount.value = 0
    
    // 预加载卖家名称
    if (products.value.length > 0) {
      const sellerIds = products.value.map(product => product.SellerID)
      await preloadSellerNames(sellerIds)
    }
  } catch (err) {
    retryCount.value++
    if (retryCount.value < maxRetries) {
      console.warn(`获取商品数据失败，正在重试 (${retryCount.value}/${maxRetries})`)
      setTimeout(() => fetchProductsWithRetry(), 1000 * retryCount.value)
    } else {
      error.value = '获取商品数据失败，请稍后重试'
      console.error('获取商品数据失败:', err)
    }
  }
}

// 初始化数据
async function initData(): Promise<void> {
  try {
    isLoading.value = true
    await fetchProductsWithRetry()
    if (!error.value) {
      setupAutoplay()
    }
  } finally {
    isLoading.value = false
  }
}

// 重试获取数据
function retryFetch(): void {
  retryCount.value = 0
  initData()
}

// 轮播图控制
function setupAutoplay(): void {
  if (autoplay.value && carouselItems.length > 1) {
    startAutoplay()
  }
}

function startAutoplay(): void {
  stopAutoplay() // 确保没有重复的定时器
  autoplayTimer.value = setInterval(() => {
    nextSlide()
  }, AUTOPLAY_INTERVAL)
}

function stopAutoplay(): void {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

function nextSlide(): void {
  currentIndex.value = (currentIndex.value + 1) % carouselItems.length
}

function prevSlide(): void {
  currentIndex.value = (currentIndex.value - 1 + carouselItems.length) % carouselItems.length
}

function goToSlide(index: number): void {
  if (index >= 0 && index < carouselItems.length) {
    currentIndex.value = index
  }
}

// 轮播图交互控制
function handleCarouselMouseEnter(): void {
  stopAutoplay()
}

function handleCarouselMouseLeave(): void {
  if (autoplay.value) {
    startAutoplay()
  }
}

// 商品相关方法
function handleViewDetail(product: Product): void {
  router.push(`/shop/productdetail/${product.ProductID}`)
}

// 价格筛选
function handlePriceRangeChange(range: string): void {
  selectedPriceRange.value = range
}

// 布局切换
function toggleLayoutMode(): void {
  layoutMode.value = layoutMode.value === 'grid' ? 'list' : 'grid'
}

// 设置布局模式
function setLayoutMode(mode: 'grid' | 'list'): void {
  layoutMode.value = mode
}

// 图片错误处理
function handleImageError(event: Event): void {
  const img = event.target as HTMLImageElement
  img.src = 'https://via.placeholder.com/400x300?text=图片加载失败'
}

// 监听路由变化，重新获取数据
watch(() => route.fullPath, () => {
  if (route.path.startsWith('/shop')) {
    initData()
  }
}, { immediate: false })

// 监听页面可见性，控制轮播
watch(() => document.visibilityState, (visibilityState) => {
  if (visibilityState === 'visible' && autoplay.value) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
})

// 生命周期钩子
onMounted(async () => {
  await initData()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<template>
  <div class="w-full flex flex-row">
    <!-- 加载中骨架屏 -->
    <template v-if="isLoading">
      <div class="skeleton-screen">
        <div class="skeleton-top-section">
          <div class="skeleton-carousel" />
          <div class="skeleton-filter" />
        </div>
        <div class="skeleton-bottom-section">
          <h2 class="skeleton-title" />
          <div class="skeleton-product-list">
            <div v-for="i in 8" :key="i" class="skeleton-product-card" />
          </div>
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <template v-else-if="error">
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">⚠</div>
          <h3 class="error-title">加载失败</h3>
          <p class="error-message">{{ error }}</p>
          <button class="retry-button" @click="retryFetch">
            重试
          </button>
        </div>
      </div>
    </template>

    <!-- 实际内容 -->
    <template v-else>
      <div class="flex flex-row">
        <div>
          <!-- 功能区和轮播图块 -->
          <div class="top-section flex-">
            <!-- 轮播窗 -->
            <div class="carousel-container">
              <div 
                class="carousel"
                @mouseenter="handleCarouselMouseEnter"
                @mouseleave="handleCarouselMouseLeave"
              >
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
                  <div
                    v-for="(item, index) in carouselItems"
                    :key="`carousel-${index}`"
                    class="carousel-item"
                  >
                    <img 
                      :src="item.image" 
                      :alt="item.title"
                      loading="lazy"
                      @error="handleImageError"
                    >
                    <div class="carousel-overlay">
                      <h2 class="carousel-title">{{ item.title }}</h2>
                      <p class="carousel-subtitle">{{ item.subtitle || '精选商品推荐' }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- 控制按钮 -->
                <button 
                  v-if="carouselItems.length > 1"
                  class="carousel-control prev" 
                  @click="prevSlide"
                  aria-label="上一张"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button 
                  v-if="carouselItems.length > 1"
                  class="carousel-control next" 
                  @click="nextSlide"
                  aria-label="下一张"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
                
                <!-- 指示器 -->
                <div v-if="carouselItems.length > 1" class="carousel-indicators">
                  <span
                    v-for="(item, index) in carouselItems"
                    :key="`indicator-${index}`"
                    class="indicator" 
                    :class="{ active: index === currentIndex }"
                    @click="goToSlide(index)"
                    :aria-label="`跳转到第${index + 1}张`"
                  />
                </div>
              </div>
            </div>

            <!-- 筛选条件 -->
            <div class="filter-container">
              <div class="filter-section">
                <div class="filter-header">
                  <h3>筛选条件</h3>
                </div>
                <div class="price-filter">
                  <div class="price-label">
                    <label>价格区间：</label>
                  </div>
                  <select 
                    v-model="selectedPriceRange"
                    @change="handlePriceRangeChange(selectedPriceRange)"
                    class="price-select"
                  >
                    <option 
                      v-for="range in PRICE_RANGES" 
                      :key="range.value" 
                      :value="range.value"
                    >
                      {{ range.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品展示块 -->
          <div class="bottom-section">
            <!-- 商品列表标题 -->
            <div class="product-list-header">
              <div class="header-left">
                <h2 class="product-list-title">
                  {{ isMain ? '在售商品' : '我的商品' }}
                </h2>
                <div class="product-count">
                  共 {{ filteredProducts.length }} 件商品
                </div>
              </div>
              
              <!-- 布局切换控制 -->
              <div class="layout-controls">
                <div class="layout-toggle">
                  <button 
                    class="layout-btn"
                    :class="{ active: layoutMode === 'grid' }"
                    @click="setLayoutMode('grid')"
                    title="网格布局"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  <button 
                    class="layout-btn"
                    :class="{ active: layoutMode === 'list' }"
                    @click="setLayoutMode('list')"
                    title="列表布局"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 商品列表 -->
            <div class="product-list-wrapper">
              <div 
                v-if="hasFilteredProducts" 
                class="product-list"
                :class="{
                  'grid-layout': layoutMode === 'grid',
                  'list-layout': layoutMode === 'list'
                }"
              >
                <ProductCard
                  v-for="product in filteredProducts"
                  :key="product.ProductID"
                  :product="product"
                  :layout-mode="layoutMode"
                  @view-detail="handleViewDetail"
                />
              </div>
              <div v-else-if="hasProducts" class="empty-filter-results">
                <div class="empty-icon">🔍</div>
                <h3>没有找到符合条件的商品</h3>
                <p>请尝试调整筛选条件</p>
                <button class="clear-filter-btn" @click="selectedPriceRange = ''">
                  清除筛选
                </button>
              </div>
              <div v-else class="empty-product-list">
                <div class="empty-icon">📦</div>
                <h3>暂无商品</h3>
                <p>{{ isMain ? '热门商品即将上线，敬请期待！' : '您还没有发布任何商品' }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- <ShopSidebar /> -->
      </div>
    </template>
    <template v-if="!isPC">
      <FloatingBall />
    </template>
  </div>
</template>

  <style scoped>
/* 现代化商城容器样式 */
.shop-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
  overflow-x: hidden;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  background: var(--shop-section-bg);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-post-card-box-shadow);
  max-width: 400px;
  color: var(--color-text);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  color: var(--color-error);
  margin-bottom: 12px;
  font-weight: 600;
}

.error-message {
  color: var(--shop-text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.retry-button {
  padding: 12px 24px;
  background: #4c8baf;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #3a6b8a;
  box-shadow: 0 2px 8px rgba(76, 139, 175, 0.2);
}

/* 骨架屏样式 */
.skeleton-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.skeleton-top-section {
  display: flex;
  padding: 20px;
  background-color: var(--shop-section-bg);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 5px var(--color-post-card-box-shadow);
}

.skeleton-carousel {
  flex: 1;
  height: 300px;
  background-color: var(--shop-skeleton-bg);
  border-radius: 8px;
  margin-right: 20px;
}

.skeleton-filter {
  width: 250px;
  background-color: var(--shop-skeleton-bg);
  padding: 15px;
  border-radius: 6px;
}

.skeleton-bottom-section {
  flex: 1;
  padding: 20px;
}

.skeleton-title {
  height: 30px;
  background-color: var(--shop-skeleton-bg);
  border-radius: 4px;
  margin-bottom: 20px;
}

.skeleton-product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.skeleton-product-card {
  height: 300px;
  background-color: var(--shop-skeleton-bg);
  border-radius: 8px;
}

/* 响应式布局 */
@media (min-width: 768px) {
  .top-section {
    display: flex;
    padding: 20px;
    background-color: var(--shop-section-bg);
    border-radius: 8px 8px 0 0;
    box-shadow: 0 1px 3px var(--color-post-card-box-shadow);
  }

  .carousel-container {
    flex: 1;
    margin-right: 20px;
  }

  .filter-container {
    width: 250px;
    flex-shrink: 0;
  }

  .bottom-section {
    flex: 1;
    padding: 20px;
  }
}

@media (max-width: 767px) {
  .top-section {
    flex-direction: column;
    padding: 15px;
  }

  .carousel-container {
    width: 100%;
    margin-bottom: 15px;
  }

  .carousel {
    height: 200px;
  }

  .carousel-overlay {
    padding: 15px;
  }

  .carousel-title {
    font-size: 18px;
  }

  .carousel-subtitle {
    font-size: 12px;
  }

  .filter-container {
    width: 100%;
    margin-bottom: 15px;
  }

  .filter-section {
    padding: 15px;
  }

  .price-options {
    gap: 6px;
  }

  .price-option {
    padding: 6px 10px;
  }

  .bottom-section {
    width: 100%;
    padding: 15px;
  }

  .product-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .product-count {
    font-size: 12px;
    padding: 4px 8px;
  }
}

/* 轮播图样式 */
.carousel {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-post-card-box-shadow);
  background: var(--shop-card-bg);
  border: 1px solid var(--color-border);
}

.carousel-inner {
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
}

.carousel-item {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    180deg, 
    transparent 0%, 
    rgba(0, 0, 0, 0.4) 70%, 
    rgba(0, 0, 0, 0.7) 100%
  );
  color: white;
  padding: 30px 20px 20px;
  text-align: center;
}

.carousel-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  color: white;
}

.carousel-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 300;
}

/* 轮播控制按钮 */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--shop-card-bg);
  color: var(--color-text);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--color-post-card-box-shadow);
}

.carousel-control:hover {
  background: var(--shop-card-bg);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 4px 12px var(--color-post-card-hover-box-shadow);
}

.carousel-control:active {
  transform: translateY(-50%) scale(1.05);
}

.carousel-control.prev {
  left: 15px;
}

.carousel-control.next {
  right: 15px;
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.1);
}

.indicator.active {
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* 筛选框样式 */
.filter-section {
  background: var(--shop-filter-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--color-post-card-box-shadow);
  border: 1px solid var(--color-border);
  position: relative;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-section h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text);
  font-weight: 600;
}

.price-filter {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.price-label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.price-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--shop-filter-bg);
  color: var(--color-text);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.price-select:hover {
  border-color: var(--color-info);
  background-color: var(--shop-filter-bg);
  box-shadow: 0 2px 8px var(--color-hover);
}

.price-select:focus {
  outline: none;
  border-color: var(--color-info);
  box-shadow: 0 0 0 3px var(--color-hover);
}

/* 商品展示区域 */
.bottom-section {
  margin-top: 0;
}

.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layout-controls {
  display: flex;
  align-items: center;
}

.layout-toggle {
  display: flex;
  background: var(--shop-filter-bg);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid var(--color-border);
}

.layout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--shop-text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.layout-btn:hover {
  background: rgba(34, 139, 34, 0.1);
  color: #134e13;
  transform: scale(1.05);
}

.layout-btn.active {
  background: linear-gradient(135deg, #134e13 0%, #0d3d0d 100%);
  color: white;
}

.layout-btn.active:hover {
  transform: scale(1.05);
}

.product-list-title {
  margin: 0;
  font-size: 28px;
  color: var(--color-text);
  font-weight: 900;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

.product-list-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--color-text);
  border-radius: 2px;
}

.product-count {
  color: var(--color-text);
  font-size: 14px;
  background: var(--shop-card-bg);
  padding: 8px 16px;
  border-radius: 25px;
  border: 1px solid var(--color-border);
  font-weight: 600;
}

/* 空状态样式 */
.empty-product-list,
.empty-filter-results {
  text-align: center;
  padding: 60px 20px;
  background: var(--shop-section-bg);
  border-radius: 16px;
  box-shadow: 0 4px 15px var(--color-post-card-box-shadow);
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-product-list h3,
.empty-filter-results h3 {
  font-size: 20px;
  color: var(--color-text);
  margin-bottom: 12px;
  font-weight: 600;
}

.empty-product-list p,
.empty-filter-results p {
  color: var(--shop-text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.clear-filter-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4c8baf 0%, #81b3e9 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.clear-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 139, 175, 0.3);
}

/* 商品列表容器 */
.product-list-wrapper {
  min-height: 300px; /* 设置一个最小高度，防止内容为空时区域骤缩 */
}

.product-list {
  display: grid;
  gap: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 网格布局（竖排） */
.product-list.grid-layout {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* 列表布局（横排） */
.product-list.list-layout {
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 大屏幕布局 */
@media (min-width: 1300px) {
  .product-list.grid-layout {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* 中等屏幕布局 */
@media (min-width: 1000px) and (max-width: 1299px) {
  .product-list.grid-layout {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 小屏幕布局 */
@media (min-width: 600px) and (max-width: 999px) {
  .product-list.grid-layout {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 超小屏幕布局 */
@media (min-width: 576px) and (max-width: 599px) {
  .product-list.grid-layout {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 移动端布局 */
@media (max-width: 575px) {
  .product-list.grid-layout {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-list.list-layout {
    grid-template-columns: 1fr;
  }
  
  .layout-controls {
    display: none; /* 移动端隐藏布局切换按钮 */
  }
  
  .product-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

/* 空商品列表提示 */
.empty-product-list {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #666;
  text-align: center;
}

.empty-product-list p {
  font-size: 18px;
}
</style>
