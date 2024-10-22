<template>
  <div class="root">
    <h2>选择分区</h2>
    <div class="partitions" style="margin: auto; margin-top: 10vh;">
	  <div class="card" v-for="(p, index) in partitions" :key="index">
		<img :src="p.src" class="card-img-top" style="height: 60%;">
		<div class="card-body">
		  <h5 class="card-title"> {{ p.name }}</h5>
		  <p class="card-text" style="font-size: 0.8em; color: grey;">{{ p.description }}</p>
		  <a class="btn btn-primary" @click="sendPartition(p.name)">跳转分区</a>
		</div>
	  </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const emit = defineEmits(['send-partition']);
const partitions = ref([
    { name: '日常吐槽', description: '言短情长，抒发心声。' , src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/daily.jpg'},
    { name: '打听求助', description: '疑虑相询，忧难互助。', src:'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/help.jpg' },
    { name: '学习交流', description: '知识碰撞，学术思辨。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/study.jpg' },
    { name: '院务', description: '院内事务，信息发布。', src:'https://pic2.zhimg.com/v2-4fd432574e38d33d52e35041a8e7fd52_720w.jpg?source=172ae18b' },
    { name: '求职招募', description: '梦想职路，共创未来。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/recruit.jpg' },
    { name: '其他', description: '畅所欲言，创意无限。', src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/image/else.jpg'},
]);
/**
 * @description 告诉HomeView.vue分区改了
 * @param p 分区
 */
const sendPartition = (p) => {
	emit('send-partition', p);
	router.push('/');
};
</script>
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
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
	margin-top: 50px;
	width: 100%;
	max-width: 700px;
	padding: 10px;
	border: 1px solid var(--color-border);
	border-radius: 5px;
	cursor: pointer;
	transition: all 0.3s;
}

.partition {
	padding: 10px;
	border: 1px solid #000;
	border-radius: 5px;
	cursor: pointer;
	transition: all 0.3s;
	background-color: var(--color-button-bg);
	color: var(--color-button);
}

.partition:hover {
	background-color: var(--color-button);
	color: var(--color-button-bg);
}
</style>
