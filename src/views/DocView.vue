<template>
	<div class="root">
		<div
			class="container"
			v-html="content"
		></div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import markdown from '../docs/doc.md?raw';

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const content = ref('');

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
	return target;
};

const highlightcode = () => {
	const blocks = root.value.querySelectorAll('pre code'); // 使用 refs 获取元素
	blocks.forEach((block) => {
		hljs.highlightElement(block); // 高亮每个代码块
	});
};

onMounted( async () => {
    content.value = safeHTML(markdown);
})
</script>

<style scoped>
@import '../assets/hl.css';

</style>