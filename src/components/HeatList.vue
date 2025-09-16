<script setup lang="ts">
import type { HeatPost } from '@/api/browse/getPost'

import { onMounted, shallowRef } from 'vue'
import { getHeatPosts } from '@/api/browse/getPost'
import { showMsg } from '@/components/MessageBox'

const heatPosts = shallowRef<HeatPost[]>([])

onMounted(async () => {
  try {
    heatPosts.value = await getHeatPosts()
  }
  catch (e) {
    showMsg(`获取热帖失败:${e}`)
  }
})
</script>

<template>
  <div
    class="root nav-bar heat"
  >
    <h2 id="heat">
      热榜
    </h2>
    <router-link
      v-for="post in heatPosts"
      :key="post.PostID"
      class="nav"
      :to="`/postdetail/${post.PostID}`"
    >
      <span>
        {{ post.Title }}
      </span>
    </router-link>
  </div>
</template>

<style scoped>
#heat {
  color: #ffffff;
  text-shadow:
    0 0 10px #ff3232de,
    0 0 20px #ff3232de,
    0 0 50px #ff3232de,
    0 0 100px #ff3232de,
    0 0 200px #ff3232de;
}
#heat::before {
  content: '🔥';
}
#heat::after {
  content: '🔥';
}

.nav-bar {
  display: flex;
  flex-direction: column;
}

.heat {
  text-align: center !important;
  width: 100%;
}

.nav {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 20px;
  border: 1px solid var(--color-border);
  text-align: center;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.3s;
  -webkit-tap-highlight-color: transparent;
}

.nav:hover {
  background-color: var(--color-nav-hover);
}

@media screen and (min-width: 768px) {
  .root {
    width: 25%;
    margin-right: 20px;
  }
  .nav {
    margin: 0;
  }
}
</style>
