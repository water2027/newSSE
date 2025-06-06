<script setup lang = "ts">
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['viewDetail'])

// 查看商品详情
async function viewDetail() {
  emit('viewDetail', props.product)
}
</script>

<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.Photos[0]" :alt="product.name">
    </div>
    <div class="product-info">
      <h3 class="product-name">
        {{ product.Name }}
      </h3>
      <p class="product-seller">
        卖家: {{ product.Seller }}
      </p>
      <div class="product-price">
        <span class="current-price">¥{{ product.Price }}</span>
      </div>
      <p class="product-description">
        {{ product.Description }}
      </p>
    </div>
    <button class="add-to-cart" @click="viewDetail">
      查看商品详情
    </button>
  </div>
</template>

<style scoped>
/* 商品卡片样式 */
.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.product-image {
  height: 180px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.product-seller {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.product-price {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #e53935;
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-description {
  font-size: 13px;
  color: #666;
  margin: 8px 0;
  flex-grow: 1;
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-to-cart {
  padding: 8px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: auto;
}

.add-to-cart:hover {
  background-color: #45a049;
}
</style>
