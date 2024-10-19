<!-- eslint-disable vue/html-indent -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/no-v-html -->
<template>
	<div
		id="content"
		ref="content"
		class="hasImgDiv"
		:style="mdContainerStyle"
		v-html="safeHTML(markdownContent)"
	></div>
</template>
<script setup>
import { ref, computed } from 'vue';

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';

hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('go', go);

import('highlight.js/styles/atom-one-dark.css');


const content = ref(null);

const props = defineProps({
	markdownContent: {
		type: String,
		required: true,
	},
});

const mdContainerStyle = computed(() => {
	return {
		width: '100%',
		maxWidth: '100%',
		height: 'auto',
		margin: '10px 0',
		fontSize: '23px',
		paddingLeft: '1%',
		paddingBottom: '5%',
		marginBottom: '1%',
		overflowWrap: 'break-word',
		wordWrap: 'break-word',
		wordBreak: 'break-all',
	};
});

/**
 * @description 安全的html，会自动去掉script和iframe之类的标签
 * @param str 待转换的字符串
 */
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
	const finalHTML = DOMPurify.sanitize(target);
	setTimeout(() => {
		highlightCode();
		const childElements = content.value.querySelectorAll('*');
		childElements.forEach((child) => {
			child.style.whiteSpace = 'pre-wrap';
			child.style.wordWrap = 'break-word';
			child.style.overflowWrap = 'break-word';
			child.style.wordBreak = 'break-all';
		});
	}, 0);
	return finalHTML;
};

const highlightCode = () => {
	const blocks = content.value.querySelectorAll('pre code'); // 使用 refs 获取元素
	blocks.forEach((block) => {
		hljs.highlightElement(block); // 高亮每个代码块
	});
};

defineExpose({
	name: 'MarkdownContainer',
});
</script>
<style scoped>
@import url('@/assets/hl.css');
#content {
	max-width: 100%;
	overflow-wrap: break-word;
	word-wrap: break-word;
	word-break: break-all;
}

:deep(*) {
	max-width: 100%;
	overflow-wrap: break-word;
	word-wrap: break-word;
	word-break: break-all;
}

:deep(pre) {
	display: block;
	background-color: #282c34;
	border: 1px solid #ccc;
	padding: 10px;
	margin-bottom: 5px;
	position: relative;
	pointer-events: none;
	font-size: 20px !important;
	white-space: pre-wrap;
	word-wrap: break-word;
	overflow-x: auto;
	z-index: 0;
	max-width: 100%;
}

:deep(pre::before) {
	content: '';
	color: var(--color-text);
	background-image: url('/PhCopy.webp');
	filter: invert(1);
	background-size: cover;
	display: block;
	width: 20px;
	height: 20px;
	position: absolute;
	z-index: 20;
	top: 3px;
	right: 3px;
	pointer-events: auto;
	/* 确保伪元素可以接收鼠标事件 */
}

:deep(code) {
	white-space: pre-wrap;
	word-wrap: break-word;
	word-break: break-all;
	max-width: 100%;
}

@media screen and (max-width: 768px) {
	:deep(.hasImgDiv img) {
		width: 100%;
		height: auto;
		margin: 10px 0;
		font-size: 23px;
		margin-bottom: 1%;
	}
}
</style>
