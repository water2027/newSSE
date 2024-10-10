<!-- eslint-disable vue/no-v-html -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
	<div class="root">
		<div class="inputData title">
			<h3>标题</h3>
			<input
				ref="title"
				type="text"
				placeholder="请输入标题"
			/>
		</div>
		<div class="inputData post">
			<h3>正文</h3>
			<MarkdownEditor
				v-model="postContent"
				@send="submitPost"
			/>
		</div>
		<div class="inputData">
			<h3>分区</h3>
			<select ref="partition">
				<option
					v-for="(p, index) in partitions"
					:key="index"
					:value="p"
				>
					{{ p }}
				</option>
			</select>
		</div>
	</div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { showMsg } from '@/components/msgbox';
import { sendPost } from '@/api/postAndComment';

import MarkdownEditor from '@/components/MarkdownEditor.vue';

const router = useRouter();
const userInfo = inject('userInfo');
const partitions = ref([
	'主页',
	'日常吐槽',
	'打听求助',
	'学习交流',
	'院务',
	'求职招募',
	'其他',
]);
const postContent = ref('');
const title = ref(null);
const partition = ref(null);
const tagList = ref('');

const submitPost = async () => {
	let postTitle = title.value.value;
	const content = postContent.value;
	const postPartition = partition.value.value;
	//去除标题的空格
	postTitle = postTitle.replace(/(^\s*)|(\s*$)/g, '');

	if (!postTitle || !content) {
		alert('请填写完整信息');
		return;
	}
	const res = await sendPost(
		content,
		postPartition,
		'',
		tagList.value,
		postTitle,
		userInfo.value.phone
	);
	router.push('/')
	showMsg(res.msg);
};

</script>

<style scoped>
.root {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100%;
	width: 100%;
	height: auto;
}

.title {
	margin-top: 100px;
	top: 0;
}

.inputData {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: auto;
	padding: 10px;
	border-radius: 5px;
}

.post {
	height: auto;
	min-height: 80%;
	width: 100%;
	display: flex;
	flex-direction: column;
	margin-bottom: auto;
	margin-top: 0;
}

.post > * {
	flex-shrink: 0;
}

.container {
	display: flex;
	flex-direction: row;
	/* align-items: center; */
	justify-content: center;
	width: 100%;
	height: auto;
}

.container textarea,
.container div {
	width: 100%;
	min-height: 100%;
	border-radius: 5px;
	padding: 10px;
	height: auto;
	overflow-y: hidden;
}

.container textarea {
	height: 100px;
}

option {
	font-size: 1.2rem;
}
select {
	width: 25%;
	height: 30px;
	border-radius: 5px;
}

.title input{
	width: 25%;
	height: 30px;
	border-radius: 5px;
	padding: 5px;
	border: 1px solid rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 768px) {
	.title {
		margin-top: 10px;
	}

	.editorButton {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
	}
}
</style>
