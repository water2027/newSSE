<!-- eslint-disable vue/html-self-closing -->
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
    <div class="inputData">
      <h3>分区</h3>
      <select v-model="partition">
        <option
          v-for="(p, index) in partitions"
          :key="index"
          :value="p"
        >
          {{ p }}
        </option>
      </select>
      <select
        v-if="partition === '课程专区'"
        v-model="teacher"
      >
        <option
          v-for="t in teachers"
          :key="t.TagID"
          :value="t.Name"
        >
          {{ t.Name }}
        </option>
      </select>
    </div>
    <div class="inputData post">
      <h3>正文</h3>
      <MarkdownEditor
        v-model="postContent"
        @send="submitPost"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { getTeachers } from '@/api/info/getTeacher';
import { sendPost } from '@/api/editPostAndComment/editPost';

import { showMsg } from '@/components/MessageBox';
import MarkdownEditor from '@/components/MarkdownEditor.vue';

const router = useRouter();
const userInfo = inject('userInfo');
const partitions = ref([
	'主页',
	'日常吐槽',
	'打听求助',
	'学习交流',
	'院务',
	'课程专区',
	'求职招募',
	'其他',
]);
const postContent = ref('');
const title = ref(null);
const partition = ref('主页');

const teachers = ref([]);
//好抽象的命名，完全想不到老师居然是作为tagList传过去的
const teacher = ref('');

const submitPost = async () => {
	let postTitle = title.value.value;
	const content = postContent.value;
	const postPartition = partition.value;
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
		teacher.value,
		postTitle,
		userInfo.value.phone
	);
	router.push('/');
	showMsg(res.msg);
};

onMounted(async () => {
	const data = await getTeachers();
	teachers.value = data;
});
</script>

<style scoped>
.root {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100%;
	height: auto;
	width: 100%;
	height: auto;
	color: var(--color-text);
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

option {
	font-size: 1.2rem;
}
select {
	width: 25%;
	height: 30px;
	border-radius: 5px;
}

.title input {
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
}
</style>
