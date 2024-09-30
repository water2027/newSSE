<template>
	<div class="root nav-bar heat">
		<h2 id="heat">热榜</h2>
		<router-link
			v-for="post in heatPosts"
			:key="post.PostID"
			class="nav"
			:to="'/postdetail/' + post.PostID"
		>
			<span
				class="heatTitle"
				:heat-score="post.Heat"
			>
				{{ post.Title }}
			</span>
            <span class="score">{{ post.Heat }}</span>
		</router-link>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { getHeatPosts } from '@/api/getPosts';

const heatPosts = ref([]);

onMounted(async () => {
	const posts = await getHeatPosts();
	heatPosts.value = posts;
});
</script>

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

.root{
    width: 100vw;
    height: 100%;
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
	border: 1px solid rgba(0, 0, 0, 0.1);
	text-align: center;
	text-decoration: none;
	color: black;
}

.score {
    margin-left: 10px;
    color: #ff3232de;
}
</style>
