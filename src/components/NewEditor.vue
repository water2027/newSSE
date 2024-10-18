<!-- eslint-disable vue/v-on-event-hyphenation -->
<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/html-indent -->
<template>
	<div id="myRoot">
		<editor
			editorClass="editor"
			:modelValue="modelValue"
			@update:modelValue="$emit('update:modelValue', $event)"
			@keydown="handleKeydown"
		/>
		<div class="inputData">
			<button
				v-if="route.path === '/post'"
				:style="buttonStyle"
				@click="savePost"
			>
				暂存为草稿
			</button>
			<button
				:style="buttonStyle"
				@click="$emit('send')"
			>
				发送
			</button>
			<input
				class="fileInput"
				type="file"
				accept="image/*"
				:style="buttonStyle"
				@input="upload"
			>
		</div>
	</div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import Editor from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import { showMsg } from '@/components/MessageBox';
import { uploadPhoto } from '@/api/editPostAndComment/utils';

const route = useRoute();

const buttonStyle = computed(() => {
	return {
		width: '50%',
	};
});

const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
});

const handleKeydown = (event) => {
	if (event.key === 'Tab') {
		event.preventDefault();
		// 在光标位置插入四个空格
		const textarea = event.target;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const value = textarea.value;
		const spaces = '    '; // 四个空格
		textarea.value =
			value.substring(0, start) + spaces + value.substring(end);
		textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
	}
};

const emit = defineEmits(['update:modelValue', 'send']);
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
/**
 * @description 保存草稿
 */
const savePost = () => {
	const post = {
		title: '草稿',
		content: props.modelValue,
	};
	localStorage.setItem('draft', JSON.stringify(post));
	showMsg('已暂存为草稿');
};
onMounted(() => {
	if (route.path === '/post') {
		const draft = JSON.parse(localStorage.getItem('draft'));
		if (draft) {
			emit('update:modelValue', draft.content);
			showMsg('读取草稿成功，已删除');
			localStorage.removeItem('draft');
		}
	}
});
</script>

<style scoped>
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
	.editor {
		max-width: 100vw;
		width: 100vw;
	}
}
</style>
