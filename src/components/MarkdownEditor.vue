<!-- eslint-disable vue/html-self-closing -->
<template>
  <div
    id="mdRoot"
    class="root"
  >
    <div class="editorButton">
      <button @click="editContent('标题')">
        标题
      </button>
      <button @click="editContent('粗体')">
        粗体
      </button>
      <button @click="editContent('斜体')">
        斜体
      </button>
      <button @click="editContent('删除线')">
        删除线
      </button>
      <button @click="editContent('引用')">
        引用
      </button>
      <button @click="editContent('无序列表')">
        无序列表
      </button>
      <button @click="editContent('有序列表')">
        有序列表
      </button>
      <button @click="editContent('表格')">
        表格
      </button>
      <button @click="editContent('分割线')">
        分割线
      </button>
      <button @click="editContent('代码块')">
        代码块
      </button>
      <button @click="isPreview = !isPreview">
        {{ isPreview ? '不想看了' : '看看效果' }}
      </button>
    </div>
    <div class="container">
      <textarea
        ref="textarea"
        :value="modelValue"
        placeholder="请输入正文"
        @input="handleInput"
        @paste="handlePaste"
      ></textarea>
      <MarkdownContainer
        v-show="isPreview"
        ref="mdContainer"
        :markdown-content="modelValue"
      />
    </div>
    <div class="buttons">
      <div
        v-if="route.path === '/post'"
        class="button"
        @click="savePost"
      >
        暂存为草稿
      </div>
      <div
        class="button"
        @click="$emit('send')"
      >
        发送
      </div>
      <label
        for="fileInput"
        class="button"
      >选择图片</label>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @input="uploadFile"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

import MarkdownContainer from './MarkdownContainer.vue';

import { showMsg } from '@/components/MessageBox';
import { uploadPhoto } from '@/api/editPostAndComment/utils';

const route = useRoute();

const isPreview = ref(false);
const textarea = ref(null);

const modelValue = defineModel({
	type:String,
	required:true
})

const emit = defineEmits(['send']);
const autoResize = () => {
	textarea.value.style.height = '450px';
	textarea.value.style.height = textarea.value.scrollHeight + 'px';
};

const handleInput = (event) => {
	const top = document.body.scrollTop;
	modelValue.value = event.target.value;
	autoResize(event);
	nextTick(()=>{
		document.body.scrollTop = top;
	})
};

const upload = async (file) => {
	if (file) {
		try {
			const data = await uploadPhoto(file);
			showMsg(data.message);
			modelValue.value += `<img src="${data.fileURL}" alt="${file.name}" />`
			autoResize()
		} catch (error) {
			console.error('Error uploading file:', error);
			showMsg('上传失败，请重试');
		}
	} else {
		console.error('No file selected');
		showMsg('请选择一个文件');
	}
};

const uploadFile = async (event) => {
	const file = event.target.files[0];
	await upload(file);
}

const handlePaste = async (event) => {
	const items = event.clipboardData.items;

	for (let i = 0; i < items.length; ++i) {
		const item = items[i];
		if (item.kind === 'file') {
			const file = item.getAsFile();
			event.preventDefault();
			await upload(file);
		}
	}
};

const editContent = (type) => {
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
			insertion = '> 引用\n';
			cursorOffset = -1;
			break;
		case '无序列表':
			insertion = '- 无序列表';
			cursorOffset = 0;
			break;
		case '有序列表':
			insertion = '1. 有序列表';
			cursorOffset = 0;
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
			insertion = '```\n代码块\n```';
			cursorOffset = -4;
			break;
		default:
			return;
	}

	const start = textarea.value.selectionStart;
	const end = textarea.value.selectionEnd;
	const newValue =
		modelValue.value.slice(0, start) +
		insertion +
		modelValue.value.slice(end);

	modelValue.value = newValue

	// 在下一个事件循环中设置光标位置
	nextTick(() => {
		textarea.value.focus();
		textarea.value.setSelectionRange(
			start + insertion.length + cursorOffset,
			start + insertion.length + cursorOffset
		);
	});
};

/**
 * @description 保存草稿
 */
const savePost = () => {
	localStorage.setItem('draft', modelValue.value);
	showMsg('已暂存为草稿');
};

onMounted(() => {
	if (route.path === '/post') {
		const draft = localStorage.getItem('draft');
		if (draft) {
			modelValue.value = draft
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
#mdRoot {
	width: 100%;
	margin-left: 0;
	margin-right: 0;
	margin-top: 10px;
}
.container {
	margin-top: 20px;
	display: flex;
	flex-direction: row;
	/* align-items: center; */
	justify-content: center;
	width: 100%;
	height: auto;
}
.editorButton {
	margin-bottom: 15px;
}

.editorButton button {
	background-color: #66bb6a;
	color: white;
	border: none;
	border-radius: 5px;
	padding: 10px 15px;
	margin-right: 10px;
	margin-top: 10px;
	cursor: pointer;
	transition:
		background-color 0.3s,
		transform 0.2s;
}

.editorButton button:hover {
	background-color: #4caf50;
	transform: translateY(-2px);
}

.container div {
	width: 100%;
	min-height: 100%;
	border-radius: 5px;
	padding: 10px;
	height: auto;
	overflow-y: hidden;
}

.container textarea {
	width: 100%;
	height: 450px;
	border: 1px solid #d1d1d1;
	border-radius: 5px;
	padding: 10px;
	font-family: 'Consolas', 'Courier New', monospace;
	font-size: 16px;
	resize: none;
	transition: border-color 0.3s;
	overflow: hidden;
}

.buttons {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: auto;
	padding: 10px;
	border-radius: 5px;
}

.button {
	width: 20vw;
	height: 50px;
	max-width: 100px;
	margin-right: 20px;
	margin-top: 20px;
	padding: 10px;
	border-radius: 8px;
	background-color: #42a5f5;
	color: white;
	text-align: center;
	cursor: pointer;
	transition:
		background-color 0.3s,
		transform 0.2s;
}

.button:hover {
	background-color: #2196f3;
	transform: translateY(-2px);
}

@media screen and (min-width: 768px) {
	button {
		margin-left: 5px;
		margin-right: 5px;
	}
}

@media screen and (max-width: 768px) {
	.editorButton {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
		gap: 10px;
	}
	.buttons .button {
		padding: 4px;
		height: 4vh;
		margin: 0 10px 80px 0;
	}
}

/* 深色模式 */
body.dark-mode .editorButton button {
	background-color: darkorange;
	color: #ffffff;
}
body.dark-mode .editorButton button:hover {
	background-color: orange;
	transform: translateY(-2px);
}

body.dark-mode .container textarea {
	background-color: #333333;
	color: #ffffff;
	border: 1px solid #555555;
}
body.dark-mode .container textarea:focus {
	border-color: #00eeff;
	outline: none;
}
body.dark-mode .button {
	background-color: #2196f3;
	color: #ffffff;
}

body.dark-mode .button:hover {
	background-color: #1976d2;
}
</style>
