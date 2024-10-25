<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    id="content"
    ref="content"
    class="markdown-body"
    :style="mdContainerStyle"
    v-html="safeHTML(markdownContent)"
  ></div>
</template>
<script setup>
import { ref, computed, nextTick } from 'vue';

import MarkdownIt from 'markdown-it';
import mk from 'markdown-it-katex';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
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

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
}).use(mk, {
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  macros: {},
  // 块级公式的显示模式
  displayMode: true,
  // 行内公式的显示模式
  inlineMode: false,
  // 禁用错误处理
  trust: true,
  // 数学公式块的额外类名
  blockClass: 'katex-block',
  // 行内数学公式的额外类名
  inlineClass: 'katex-inline'
});

md.set({
  html: true,        // 启用 HTML 标签
  xhtmlOut: false,   // 使用 '/' 关闭单标签
  breaks: true,      // 转换段落里的 '\n' 到 <br>
  linkify: true,     // 将类似 URL 的文本自动转换为链接
  typographer: true, // 启用一些语言中立的替换 + 引号美化
})

/**
 * @description 安全的html，会自动去掉script和iframe之类的标签
 * @param str 待转换的字符串
 */
 const safeHTML = (str) => {
  if (!str) {
    return '';
  }

  // 配置 DOMPurify 以允许 KaTeX 相关标签和属性
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'math' || data.tagName === 'annotation') {
      return node;
    }
  });

  const rendered = md.render(str);
  const finalHTML = DOMPurify.sanitize(rendered, {
    ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'annotation', 'semantics', 'mspace', 'mfrac', 'msup', 'msub'],
    ADD_ATTR: ['xmlns', 'display', 'class', 'style', 'width', 'height', 'href', 'target'],
  });

  nextTick(() => {
    highlightCode()
  });

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
@import url('@/assets/katex.css');	
@import url('@/assets/github-markdown.css');

#content{
	color: var(--color-text);
}

:deep(li){
	line-height: 1.1;
	margin-top: 0.5em;
}

:deep(table){
	border-collapse: collapse;
	width: 100%;
	border: white 1px solid;
}

:deep(th){
	border: white 1px solid;
}

:deep(td){
	border: white 1px solid;
}

:deep(p){
	font-size: 20px;
	text-indent: 2rem;
}

:deep(pre){
	background-color: #282c34;
	padding: 10px;
	pointer-events: none;
	z-index: 0;
	position: relative;
}
:deep(pre)::before{
	content: '';
	background-image: url('/PhCopy.webp');
	background-size: cover;
	display: block;
	position: absolute;
	filter: invert(1);
	z-index: 1;
	width: 	20px;
	height: 20px;
	top: 5px;
	right: 5px;
}
</style>
