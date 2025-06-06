<script setup lang="ts">
import type { Product } from '@/api/shop/getProducts'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { getProducts } from '@/api/shop/getProducts'
import ProductCard from '@/components/card/ProductCard.vue'
import FloatingBall from '@/components/FloatingBall.vue'

interface CarouselItem {
  image: string
  title: string
}

const router = useRouter()
const isPC = inject('isPC')
// 响应式数据
const isLoading = ref(true)
const products = ref<Product[]>([])
const selectedPriceRange = ref<string>('')
const currentIndex = ref(0)
const autoplay = ref(true)
const autoplayInterval = ref(5000)
const autoplayTimer = ref<number | null>(null)
const loadedImagesCount = ref(0)
const totalImagesToLoad = ref(0)
const carouselItems = ref<CarouselItem[]>([
  { image: '/new/img/1.jpg', title: 'P1' },
  { image: '/new/img/2.jpg', title: 'P2' },
  { image: '/new/img/3.jpg', title: 'P3' },
])

// 计算属性：根据价格筛选商品
const filteredProducts = computed<Product[]>(() => {
  let result = [...products.value]
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-')
    if (max === '+') {
      result = result.filter(product => product.Price >= Number.parseInt(min))
    }
    else {
      result = result.filter(
        product =>
          product.Price >= Number.parseInt(min) && product.Price <= Number.parseInt(max),
      )
    }
  }

  return result
})

// 方法：初始化数据
async function initData() {
  try {
    await fetchProducts()
    setupAutoplay()
  }
  catch (error) {
    console.error('Error initializing data:', error)
  }
  finally {
    // 仅在所有数据加载完成后隐藏加载状态
    isLoading.value = false
  }
}
const route = useRoute()
const IsMain = computed(() => {
  return /^\/shop/.test(route.fullPath)
})
// 方法：获取商品数据
async function fetchProducts() {
  if (IsMain.value) {
    products.value = await getProducts('home')
  }
  else {
    products.value = await getProducts('history')
  }
}

// 方法：设置自动轮播
function setupAutoplay() {
  if (autoplay.value) {
    startAutoplay()
  }
}

// 方法：开始自动轮播
function startAutoplay() {
  autoplayTimer.value = setInterval(() => {
    nextSlide()
  }, autoplayInterval.value)
}

// 方法：停止自动轮播
function stopAutoplay() {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

// 方法：轮播图控制
function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length
}

function prevSlide() {
  currentIndex.value
      = (currentIndex.value - 1 + carouselItems.value.length)
        % carouselItems.value.length
}

function goToSlide(index: number) {
  currentIndex.value = index
}

// 方法：图片加载完成回调
function imageLoad() {
  loadedImagesCount.value++
  // 检查所有图片是否加载完成
  if (loadedImagesCount.value >= totalImagesToLoad.value) {
    isLoading.value = false
  }
}

// 方法：处理查看商品详情事件
function handleViewDetail(product: Product) {
  router.push(`/productdetail/${product.ProductID}`)
}

// 生命周期钩子：组件挂载时
onMounted(() => {
  initData()
  // 计算需要加载的图片总数
  totalImagesToLoad.value = products.value.length + carouselItems.value.length
})

// 生命周期钩子：组件销毁前
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

    <!-- 实际内容 -->
    <template v-else>
      <div class="flex flex-row">
        <div>
          <!-- 功能区和轮播图块 -->
          <div class="top-section flex-">
            <!-- 轮播窗 -->
            <div class="carousel-container">
              <div class="carousel">
                <div class="carousel-inner" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
                  <div
                    v-for="(item, index) in carouselItems"
                    :key="index"
                    class="carousel-item"
                  >
                    <img :src="item.image" alt="轮播图" @load="imageLoad">
                    <div class="carousel-title">
                      {{ item.title }}
                    </div>
                  </div>
                </div>
                <button class="carousel-control prev" @click="prevSlide">
                  ❮
                </button>
                <button class="carousel-control next" @click="nextSlide">
                  ❯
                </button>
                <div class="carousel-indicators">
                  <span
                    v-for="(item, index) in carouselItems"
                    :key="index"
                    class="indicator" :class="[{ active: index === currentIndex }]"
                    @click="goToSlide(index)"
                  />
                </div>
              </div>
            </div>

            <!-- 筛选条件 -->
            <div class="filter-container">
              <div class="filter-section">
                <h3>筛选条件</h3>
                <div class="price-filter">
                  <div class="price-label">
                    <label>价格区间：</label>
                  </div>
                  <div class="price-select-group">
                    <select v-model="selectedPriceRange">
                      <option value="">
                        请选择价格区间
                      </option>
                      <option value="0-200">
                        0-200元
                      </option>
                      <option value="200-500">
                        200-500元
                      </option>
                      <option value="500-1000">
                        500-1000元
                      </option>
                      <option value="1000-2000">
                        1000-2000元
                      </option>
                      <option value="2000-+">
                        2000元以上
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品展示块 -->
          <div class="bottom-section">
            <!-- 商品列表标题 -->
            <h2 v-if="IsMain" class="product-list-title">
              热门商品
            </h2>
            <h2 v-else class="product-list-title">
              我的商品
            </h2>
            <!-- 商品列表 -->
            <div class="product-list-wrapper">
              <div v-if="filteredProducts.length > 0" class="product-list">
                <ProductCard
                  v-for="product in filteredProducts"
                  :key="product.ProductID"
                  :product="product"
                  @view-detail="handleViewDetail"
                  @load="imageLoad"
                />
              </div>
              <div v-else class="empty-product-list">
                <p>没有找到符合条件的商品，请调整筛选条件。</p>
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
  /* 样式保持不变 */
.shop-container {
  padding: 10px 0px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  background-color: #f9f9f9;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.skeleton-carousel {
  flex: 1;
  height: 300px;
  background-color: #eee;
  border-radius: 8px;
  margin-right: 20px;
}

.skeleton-filter {
  width: 250px;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
}

.skeleton-bottom-section {
  flex: 1;
  padding: 20px;
}

.skeleton-title {
  height: 30px;
  background-color: #eee;
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
  background-color: #eee;
  border-radius: 8px;
}

/* 响应式布局 */
@media (min-width: 768px) {
  .top-section {
    display: flex;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  }

  .carousel-container {
    width: 100%;
    margin-bottom: 20px;
  }

  .filter-container {
    width: 100%;
    margin-bottom: 20px;
  }

  .bottom-section {
    width: 100%;
    padding: 20px;
  }
}

/* 轮播图样式 */
.carousel {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

.carousel-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 15px;
  text-align: center;
  font-size: 18px;
}

/* 轮播控制按钮 */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
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
  bottom: 70px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.indicator.active {
  background-color: white;
}

/* 筛选框样式 */
.filter-section {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 15px;
  color: #333;
}

.price-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.price-label {
  flex-shrink: 0;
  margin-right: 10px;
}

.price-select-group {
  flex: 1;
}

.price-select-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 商品展示区域 */
.bottom-section {
  margin-top: 0;
}

.product-list-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 22px;
  color: #333;
}

/* 商品列表容器 */
.product-list-wrapper {
  min-height: 300px; /* 设置一个最小高度，防止内容为空时区域骤缩 */
}

.product-list {
  display: grid;
  gap: 20px;
}

/* 大屏幕布局 */
@media (min-width: 1300px) {
  .product-list {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* 中等屏幕布局 */
@media (min-width: 1000px) and (max-width: 1299px) {
  .product-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 小屏幕布局 */
@media (min-width: 600px) and (max-width: 999px) {
  .product-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 超小屏幕布局 */
@media (min-width: 576px) and (max-width: 599px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 超小屏幕布局 */
@media (max-width: 575px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
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
