<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['sendPartition'])
const router = useRouter()
const partitions = ref([
  { name: '日常吐槽', description: '言短情长，抒发心声。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/daily.jpg' },
  { name: '优质贴', description: '优质内容，分享交流。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/secondhand.jpg' },
  { name: '打听求助', description: '疑虑相询，忧难互助。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/help.jpg' },
  { name: '学习交流', description: '知识碰撞，学术思辨。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/study.jpg' },
  { name: '院务', description: '院内事务，信息发布。', src: 'https://pic2.zhimg.com/v2-4fd432574e38d33d52e35041a8e7fd52_720w.jpg?source=172ae18b' },
  { name: '求职招募', description: '梦想职路，共创未来。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/recruit.jpg' },
  { name: '其他', description: '畅所欲言，创意无限。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/else.jpg' },
])
/**
 * @description 告诉HomeView.vue分区改了
 * @param p 分区
 */
function sendPartition(p) {
  emit('sendPartition', p)
  router.push('/')
}
</script>

<template>
  <div class="root">
    <h2>选择分区</h2>
    <div
      class="partitions"
      style="margin: auto; margin-top: 10vh;"
    >
      <div
        v-for="(p, index) in partitions"
        :key="index"
        class="card"
      >
        <img
          :src="p.src"
          class="card-img-top"
          style="height: 60%;"
        >
        <div class="card-body">
          <h5 class="card-title">
            {{ p.name }}
          </h5>
          <p
            class="card-text"
            style="font-size: 0.8em; color: grey;"
          >
            {{ p.description }}
          </p>
          <a
            class="btn btn-primary"
            @click="sendPartition(p.name)"
          >跳转分区</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  color: var(--color-text);
}

.root h2 {
  font-size: 25px;
  position: absolute;
  top: 0;
  left: 0;
}

.partitions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  transition: all 0.3s;
}

.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border: 1px solid #000;
  border-radius: 5px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.card-img-top {
  height: 60%;
  width: 100%;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 1rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.card-text {
  font-size: 0.8em;
  color: grey;
  margin-bottom: 1rem;
}

.btn-primary {
  display: inline-block;
  font-weight: 400;
  color: #fff;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: #007bff;
  border: 1px solid #007bff;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  text-decoration: none;
  cursor: pointer;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.btn-primary:hover {
  color: #fff;
  background-color: #0056b3;
  border-color: #004085;
}

/* 夜间模式 */
body.dark-mode .card-body {
  filter: invert(1);
}
body.dark-mode .card {
  background-color: #000;
}
</style>
