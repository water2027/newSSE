<script setup lang="ts">
import { ref } from 'vue'
import ShopSidebar from '@/components/ShopSidebar.vue'

const isSidebarVisible = ref(false)

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

function closeSidebar() {
  isSidebarVisible.value = false
}
</script>

<template>
  <div class="floating-ball" @click="toggleSidebar">
    <i class="material-icons">{{ isSidebarVisible ? '<' : '菜单' }}</i>
  </div>
  <div v-if="isSidebarVisible" class="shop-sidebar-container">
    <ShopSidebar @close="closeSidebar" />
  </div>
</template>

<style scoped>
.floating-ball {
  position: fixed;
  top: 28px;
  left: 10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  user-select: none;
  z-index: 1000;
  transition: all 0.3s ease;
}

.floating-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.shop-sidebar-container {
  position: fixed;
  top: 0px;
  left: 0;
  width: 0%;
  height: 100%;
  background-color: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: transform 0.3s ease;
}
</style>
