<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const IsMain = computed(() => {
  return /^\/shop\/?$/.test(route.fullPath)
})
const { userInfo } = useUserStore()
</script>

<template>
  <div class="container">
    <!-- 侧边栏部分 -->
    <div class="sidebar">
      <!-- 用户信息部分 -->
      <div class="user-info">
        <div class="avatar-container">
          <img :src="userInfo.avatarURL" alt="用户头像" class="avatar">
        </div>
        <div class="user-id">
          {{ userInfo.name }}
        </div>
      </div>

      <!-- 导航按钮部分 -->
      <div class="navigation-buttons">
        <RouterLink v-if="IsMain" to="/shop/myproducts" class="nav-button">
          <span class="nav-text">商品</span>
        </RouterLink>
        <RouterLink v-else to="/shop" class="nav-button">
          <span class="nav-text">返回首页</span>
        </RouterLink>
        <RouterLink to="/chat" class="nav-button">
          <span class="nav-text">消息</span>
        </RouterLink>
        <RouterLink to="/shop/sale" class="nav-button">
          <span class="nav-text">出售</span>
        </RouterLink>
        <RouterLink to="/" class="nav-button home-button">
          <span class="nav-text">主页</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background-image: url('/img/4.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px 0;
  box-shadow: 4px 0 20px var(--color-post-card-box-shadow);
  border-radius: 0 20px 20px 0;
  position: relative;
  min-height: 100vh;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0 20px 20px 0;
  z-index: 1;
}

.sidebar > * {
  position: relative;
  z-index: 2;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px var(--color-post-card-box-shadow);
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 25px var(--color-post-card-hover-box-shadow);
  border-color: rgba(255, 255, 255, 0.5);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-id {
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-align: center;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.navigation-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
}

.nav-button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: var(--shop-card-bg);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  text-decoration: none;
  box-shadow: 0 2px 10px var(--color-post-card-box-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-button:hover {
  background: var(--shop-card-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--color-post-card-hover-box-shadow);
}

.nav-button.router-link-active {
  background: linear-gradient(135deg, var(--color-info) 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 4px 15px var(--color-hover);
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.home-button {
  background: var(--shop-card-bg) !important;
  color: var(--color-text) !important;
  box-shadow: 0 2px 10px var(--color-post-card-box-shadow) !important;
}

.home-button:hover {
  background: var(--shop-section-bg) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--color-post-card-hover-box-shadow) !important;
}

.home-button.router-link-active {
  background: var(--shop-card-bg) !important;
  color: var(--color-text) !important;
  box-shadow: 0 4px 15px var(--color-post-card-hover-box-shadow) !important;
}

.notification-badge {
  position: absolute;
  right: 15px;
  background-color: var(--color-error);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  height: fit-content;
}

.main-content {
  flex: 1;
  padding: 20px;
}

@media (min-width: 1000px) {
  .sidebar {
    width: 220px;
  }
  
  .avatar-container {
    width: 90px;
    height: 90px;
  }
  
  .user-id {
    font-size: 18px;
  }
  
  .nav-text {
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 180px;
    border-radius: 0 15px 15px 0;
  }
  
  .avatar-container {
    width: 70px;
    height: 70px;
  }
  
  .user-id {
    font-size: 14px;
  }
  
  .nav-button {
    height: 45px;
    padding: 0 12px;
  }
  
  .nav-text {
    font-size: 13px;
  }
}
</style>