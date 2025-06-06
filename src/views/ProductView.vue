<template>
    <div class="product-detail-container">
      <!-- 添加返回按钮和删除按钮 -->
      <div class="back-button-container">
        <button class="back-button" @click="goBack">
          <img
            width="36"
            height="36"
            src="https://img.icons8.com/sf-black/24/return.png"
            alt="return"
          />
          <span>返回商城</span>
        </button>
        
        <button v-if="isCurrentUser" class="delete-button" @click="DeleteProduct">
          <img
            width="36"
            height="36"
            src="https://img.icons8.com/sf-black/24/delete.png"
            alt="删除"
          />
          <span>删除商品</span>
        </button>
      </div>
      
      <!-- 商品图片轮播 -->
      <div class="product-images-carousel">
    <div class="carousel-container">
      <div class="carousel">
        <div class="carousel-inner" :style="{ transform: `translateX(-${imageIndex * 100}%)` }">
          <!-- 使用统一的数据源 product.Photos -->
          <div v-for="(image, index) in product.Photos" :key="index" class="carousel-item">
            <img :src="image" alt="商品图片">
          </div>
        </div>
        <button @click="prevImage" class="carousel-control prev">❮</button>
        <button @click="nextImage" class="carousel-control next">❯</button>
        <!-- 使用统一的数据源 product.Photos -->
        <div class="carousel-indicators">
          <span 
            v-for="(image, index) in product.Photos" 
            :key="index" 
            :class="['indicator', { active: index === imageIndex }]"
            @click="goToImage(index)"
          ></span>
        </div>
      </div>
    </div>
  </div>
  
      <!-- 商品信息 -->
      <div class="product-info">
        <h1 class="product-title">{{ product.Name }}</h1>
        <p class="product-seller">卖家: {{ product.Seller }}</p>
        <div class="product-price-info">
          <p class="current-price">¥{{ product.Price }}</p>
        </div>
        <p class="product-description">{{ product.Description }}</p>
        
        <!-- 私聊功能 -->
        <div class="chat-buttons">
          <button @click="chatWithSeller(false)">私聊商家</button>
          <button @click="chatWithSeller(true)">匿名私聊</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { deleteProduct } from '@/api/shop/controlProduct';
  import { getProductByID } from '@/api/shop/getProducts';
  import { useUserStore }from '@/store/userStore'

  interface ProductInterface {
    SellerID: number;
    ProductID: number;
    Name: string;
    Seller: string;
    Price: number;
    Description: string;
    Photos: string;
    userId: number;
  }
  
  const router = useRouter();
  const route = useRoute();
  const product = ref<ProductInterface>({} as ProductInterface);
  const {userInfo}= useUserStore()
  const currentUserId = userInfo.userID;
  const imageIndex = ref(0);
  
  // 判断当前登录用户是否是商品发布者
  const isCurrentUser = computed(() => {
    return product.value.SellerID === currentUserId;
  });
  
  // 获取商品详情的异步函数
  const fetchProductDetail = async (ProductID: number) => {
    try {
      const response = await getProductByID(ProductID);
      product.value = response;
      console.log(response);
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
    }
  };
  
  // 轮播图控制
  const nextImage = () => {
    imageIndex.value = (imageIndex.value + 1) % product.value.Photos.length;
  };
  
  const prevImage = () => {
    imageIndex.value = (imageIndex.value - 1 + product.value.Photos.length) % product.value.Photos.length;
  };
  
  const goToImage = (index: number) => {
    imageIndex.value = index;
  };
  
  // 私聊功能
  const chatWithSeller = (isAnonymous: boolean) => {
    if(!isAnonymous){
      navigateChat();
    }
    const chatType = isAnonymous ? '匿名私聊未开放' : '私聊功能已触发';
    alert(`${chatType}`);
  };
  
  // 返回商城主界面
  const goBack = () => {
    router.push('/shop');
  };
  
  // 删除商品
  const DeleteProduct = () => {
    if (confirm('确定要删除此商品吗？')) {
      deleteProduct(Number(product.value.ProductID));
      alert('商品已删除');
      router.push('/shop');
    }
  };
  function navigateChat() {
  if (product.value.SellerID > 0) {
    router.push({ name: 'Chat', query: { user: product.value.SellerID} })
    // stopPropagation()
  }
  }
  
  // 生命周期钩子 - 组件挂载后获取商品详情
  onMounted(() => {
    const ProductID = route.params.ProductID;
    if (ProductID) {
      fetchProductDetail(Number(ProductID));
    }
  });
  </script>
  
  <style scoped>
  .product-detail-container {
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  /* 返回按钮和删除按钮样式 */
  .back-button-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .back-button, .delete-button {
    padding: 12px 0px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #333;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: color 0.3s;
  }
  
  .back-button:hover {
    color: #4c8baf;
  }
  
  .delete-button:hover {
    color: #e53935;
  }
  
  .back-button img, .delete-button img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  
  /* 图片轮播样式 */
  .product-images-carousel {
    width: 100%;
    margin-bottom: 30px;
  }
  
  .carousel-container {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .carousel {
    position: relative;
    height: 500px;
  }
  
  .carousel-inner {
    display: flex;
    transition: transform 0.5s ease;
    height: 100%;
  }
  
  .carousel-item {
    min-width: 100%;
    height: 100%;
  }
  
  .carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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
    bottom: 20px;
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
  
  /* 商品信息样式 */
  .product-info {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .product-title {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 28px;
    color: #333;
  }
  
  .product-seller {
    margin-bottom: 15px;
    color: #666;
  }
  
  .product-price-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .current-price {
    font-size: 24px;
    font-weight: bold;
    color: #e53935;
    margin-right: 10px;
  }
  
  .original-price {
    font-size: 18px;
    color: #999;
    text-decoration: line-through;
  }
  
  .product-description {
    margin-bottom: 30px;
    line-height: 1.6;
    color: #333;
  }
  
  .chat-buttons {
    display: flex;
    gap: 15px;
  }
  
  .chat-buttons button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .chat-buttons button:first-child {
    background-color: #4CAF50;
    color: white;
  }
  
  .chat-buttons button:last-child {
    background-color: #2196F3;
    color: white;
  }
  
  .chat-buttons button:hover {
    opacity: 0.9;
  }
  </style>