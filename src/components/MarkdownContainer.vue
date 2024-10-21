<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    id="content"
    ref="content"
    class="hasImgDiv root"
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
  padding: 0 15px;
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
	z-index: 1;
	top: 3px;
	right: 3px;
	pointer-events: auto;
	/* 确保伪元素可以接收鼠标事件 */
}

:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
  line-height: 1.2;
}

:deep(h1) { font-size: 1.8em; }
:deep(h2) { font-size: 1.6em; }
:deep(h3) { font-size: 1.4em; }
:deep(h4) { font-size: 1.2em; }
:deep(h5) { font-size: 1.1em; }
:deep(h6) { font-size: 1em; }

:deep(ul), :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

:deep(li) {
  margin-bottom: 0.5em;
}

:deep(blockquote) {
  border-left: 4px solid #ccc;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
  font-size: 0.95em;
}

:deep(hr) {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1em 0;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
  font-size: 0.9em;
}

:deep(th), :deep(td) {
  border: 1px solid #ccc;
  padding: 0.5em;
  text-align: left;
}

:deep(th) {
  background-color: #f0f0f0;
  font-weight: bold;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  #content {
    font-size: 16px;
    padding: 0 10px;
  }

  :deep(h1) { font-size: 1.6em; }
  :deep(h2) { font-size: 1.4em; }
  :deep(h3) { font-size: 1.3em; }
  :deep(h4) { font-size: 1.2em; }
  :deep(h5) { font-size: 1.1em; }
  :deep(h6) { font-size: 1em; }

  :deep(pre) {
    font-size: 14px !important;
    padding: 8px;
  }

  :deep(ul), :deep(ol) {
    padding-left: 1.2em;
  }

  :deep(.hasImgDiv img) {
    width: 100%;
    height: auto;
    margin: 10px 0;
  }

  :deep(table) {
    font-size: 0.8em;
  }

  :deep(th), :deep(td) {
    padding: 0.3em;
  }

  :deep(p) {
    text-indent: 1em;
  }
}
</style>
