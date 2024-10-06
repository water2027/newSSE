<template>
	<div
		class="root"
		ref="root"
	>
		<div class="postDetail">
			<div
				id="content"
				ref="mdContainer"
				class="hasImgDiv"
				:style="mdContainerStyle"
				v-html="content"
			></div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';

import markdown from '../docs/doc.md?raw';

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const content = ref('');
const root = ref(null);

const mdContainerStyle = computed(() => {
	return {
		width: '100%',
		height: 'auto',
		margin: '10px 0',
		fontSize: '23px',
		paddingLeft: '1%',
		paddingBottom: '5%',
		marginBottom: '1%',
	};
});

const safeHTML = (str) => {
	if (!str) {
		return;
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
	const target = marked(str);
	setTimeout(() => {
		highlightcode();
		const childElements = root.value.querySelectorAll('*');
		childElements.forEach((child) => {
			child.style.whiteSpace = 'pre-wrap';
		});
	}, 0);
	return target;
};

const highlightcode = () => {
	const blocks = root.value.querySelectorAll('pre code'); // 使用 refs 获取元素
	blocks.forEach((block) => {
		hljs.highlightElement(block); // 高亮每个代码块
	});
};

onMounted(async () => {
	content.value = safeHTML(markdown);
});
</script>

<style scoped>
@import '../assets/hl.css';

.root {
	display: flex;
	flex-direction: column;
	width: 100%;
	text-align: start;
}

.postDetail {
	width: 100%;
	margin-left: 0;
	margin-right: auto;
	padding: 1%;
	border-radius: 5px;
	box-sizing: border-box;
}

</style>
