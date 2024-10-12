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
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';

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
		highlightcode();
		const childElements = content.value.querySelectorAll('*');
		childElements.forEach((child) => {
			child.style.whiteSpace = 'pre-wrap';
			child.style.wordWrap = 'break-word';
			child.style.overflowWrap = 'break-word'
			child.style.wordBreak = 'break-all'; 
		});
	}, 0);
	return finalHTML;
};

const highlightcode = () => {
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
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  max-width: 100%;
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
