<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/no-v-html -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
	<div id="mdRoot">
		<div class="editorButton">
			<button @click="editComment('标题')">标题</button>
			<button @click="editComment('粗体')">粗体</button>
			<button @click="editComment('斜体')">斜体</button>
			<button @click="editComment('删除线')">删除线</button>
			<button @click="editComment('引用')">引用</button>
			<button @click="editComment('无序列表')">无序列表</button>
			<button @click="editComment('有序列表')">有序列表</button>
			<button @click="editComment('表格')">表格</button>
			<button @click="editComment('分割线')">分割线</button>
			<button @click="editComment('代码块')">代码块</button>
		</div>
		<div class="container">
			<textarea
				:value="modelValue"
				placeholder="请输入正文"
				@input="handleInput"
			></textarea>
			<div
				id="content"
				ref="mdContainer"
				v-html="safeHTML"
			></div>
		</div>
		<div class="inputData">
			<button v-if="route.path === '/post'" @click="savePost">暂存为草稿</button>
			<button @click="$emit('send')">发送</button>
			<input
				class="fileInput"
				type="file"
				accept="image/*"
				@input="upload"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';

import { showMsg } from '@/components/msgbox';
import { uploadPhoto } from '@/api/postAndComment';

const route = useRoute();

const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(['update:modelValue', 'send']);
const mdContainer = ref(null);
const autoResize = (event) => {
	event.target.style.height = '100px';
	event.target.style.height = event.target.scrollHeight + 'px';
};

const handleInput = (event) => {
	emit('update:modelValue', event.target.value);
	autoResize(event);
};

const safeHTML = computed(() => {
	if (!props.modelValue) {
		return '';
	}
	marked.setOptions({
		renderer: new marked.Renderer(),
		pedantic: false,
		gfm: true,
		breaks: true,
		sanitize: false,
		smartLists: true,
		smartypants: false,
		xhtml: false,
	});
	const target = marked(props.modelValue);
	const finalHTML = DOMPurify.sanitize(target);

	// 使用 nextTick 来确保 DOM 更新后再执行
	nextTick(() => {
		highlightcode();
		const childElements = mdContainer.value.querySelectorAll('*');
		childElements.forEach((child) => {
			child.style.whiteSpace = 'pre-wrap';
			child.style.wordBreak = 'break-all';
			child.style.overflowWrap = 'break-word';
		});
	});

	return finalHTML;
});

const highlightcode = () => {
	const blocks = mdContainer.value.querySelectorAll('pre code'); // 使用 refs 获取元素
	blocks.forEach((block) => {
		hljs.highlightElement(block); // 高亮每个代码块
	});
};

const upload = async (event) => {
	const file = event.target.files[0];
	if (file) {
		try {
			const data = await uploadPhoto(file);
			console.log(data);
			showMsg(data.message);

			// 使用 emit 来更新父组件的 modelValue
			emit(
				'update:modelValue',
				props.modelValue +
					`<img src="${data.fileURL}" alt="${file.name}" />`
			);
		} catch (error) {
			console.error('Error uploading file:', error);
			showMsg('上传失败，请重试');
		}
	} else {
		console.error('No file selected');
		showMsg('请选择一个文件');
	}
};

const editComment = (type) => {
	let insertion = '';
	let cursorOffset = 0;

	switch (type) {
		case '标题':
			insertion = '### 标题\n';
			cursorOffset = -1;
			break;
		case '粗体':
			insertion = '**粗体**';
			cursorOffset = -2;
			break;
		case '斜体':
			insertion = '*斜体*';
			cursorOffset = -1;
			break;
		case '删除线':
			insertion = '~~删除线~~';
			cursorOffset = -2;
			break;
		case '引用':
			insertion = '\n> 引用\n';
			cursorOffset = -1;
			break;
		case '无序列表':
			insertion = '\n- 无序列表\n';
			cursorOffset = -1;
			break;
		case '有序列表':
			insertion = '\n1. 有序列表\n';
			cursorOffset = -1;
			break;
		case '表格':
			insertion =
				'\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n';
			cursorOffset = 0;
			break;
		case '分割线':
			insertion = '\n---\n';
			cursorOffset = 0;
			break;
		case '代码块':
			insertion = '\n```\n代码块\n```\n';
			cursorOffset = -5;
			break;
		default:
			return;
	}

	const textarea = document.querySelector('textarea');
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const newValue =
		props.modelValue.slice(0, start) +
		insertion +
		props.modelValue.slice(end);

	emit('update:modelValue', newValue);

	// 在下一个事件循环中设置光标位置
	setTimeout(() => {
		textarea.focus();
		textarea.setSelectionRange(
			start + insertion.length + cursorOffset,
			start + insertion.length + cursorOffset
		);
	}, 0);
};

const savePost = () => {
	const post = {
		title: '草稿',
		content: props.modelValue,
	};
	localStorage.setItem('draft', JSON.stringify(post));
	showMsg('已暂存为草稿');
};

onMounted(() => {
	if(route.path === '/post') {
		const draft = JSON.parse(localStorage.getItem('draft'));
		if (draft) {
			emit('update:modelValue', draft.content);
			showMsg('读取草稿成功，已删除');
			localStorage.removeItem('draft');
		}
	}
});

defineExpose({
	name: 'MarkdownEditor',
});
</script>

<style scoped>
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

.inputData {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: auto;
	padding: 10px;
	border-radius: 5px;
}

@media screen and (max-width: 768px) {
	.editorButton {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
	}
}
</style>
