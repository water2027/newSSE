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
			<!-- <div class="editorButton">
				<button @click="editComment('标题')">
                    标题
                </button>
				<button @click="editComment('粗体')">
                    粗体
                </button>
				<button @click="editComment('斜体')">
                    斜体
                </button>
				<button @click="editComment('删除线')">
                    删除线
                </button>
				<button @click="editComment('引用')">
                    引用
                </button>
				<button @click="editComment('无序列表')">
                    无序列表
                </button>
				<button @click="editComment('有序列表')">
                    有序列表
                </button>
				<button @click="editComment('表格')">
                    表格
                </button>
				<button @click="editComment('分割线')">
                    分割线
                </button>
				<button @click="editComment('代码块')">
                    代码块
                </button>
			</div>
			<div class="container">
				<textarea
					v-model="postContent"
					placeholder="请输入正文"
					@input="autoResize"
				></textarea>
				<div
					id="content"
					ref="mdContainer"
					v-html="safeHTML(postContent)"
				></div>
			</div> -->
			<MarkdownEditor
				v-model="postContent"
				@send="submitPost"
			/>
		</div>
		<div class="inputData">
			<h3>图片上传</h3>
			<input
				class="fileInput"
				type="file"
				accept="image/*"
				@input="upload"
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
		<div class="inputData">
			<button @click="submitPost">
                发布
            </button>
		</div>
	</div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { showMsg } from '@/utils/msgbox';
import { sendPost } from '@/utils/postAndComment';

import MarkdownEditor from '@/components/MarkdownEditor.vue';

const userInfo = inject('userInfo');
const partitions = ref([
	'主页',
	'日常吐槽',
	'打听求助',
	'恋爱交友',
	'学习交流',
	'二手闲置',
	'求职招募',
	'其他',
]);
const postContent = ref('');
const title = ref(null);
const partition = ref(null);
const tagList = ref('');

const submitPost = async () => {
	const postTitle = title.value.value;
	const content = postContent.value;
	const postPartition = partition.value.value;

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
	min-height: 60%;
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
