<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    id="content"
    ref="content"
    class="markdown-body"
    v-html="safeHTML"
  ></div>
</template>
<script setup>
import { ref, computed } from 'vue';

import MarkdownIt from 'markdown-it';
import mk from 'markdown-it-katex';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';

import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);

import('highlight.js/styles/atom-one-dark.css');

const content = ref(null);

const props = defineProps({
	markdownContent: {
		type: String,
		required: true,
	},
});

const md = new MarkdownIt({
	html: true,
	breaks: true,
	linkify: true,
	typographer: true,
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
			} catch (__) {}
		} else {
			try {
				return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`;
			} catch (__) {}
		}
		return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
	},
	breaks: true,
	xhtmlOut: true,
	langPrefix: 'language-',
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
});

/**
 * @description 安全的html，会自动去掉script和iframe之类的标签
 */
const safeHTML = computed(() => {
	if (!props.markdownContent) {
		return '';
	}

	// 配置 DOMPurify 以允许 KaTeX 相关标签和属性
	DOMPurify.addHook('uponSanitizeElement', (node, data) => {
		if (data.tagName === 'math' || data.tagName === 'annotation') {
			return node;
		}
	});

	const rendered = md.render(props.markdownContent);
	const finalHTML = DOMPurify.sanitize(rendered, {
		ADD_TAGS: [
			'math',
			'mrow',
			'mi',
			'mo',
			'mn',
			'annotation',
			'semantics',
			'mspace',
			'mfrac',
			'msup',
			'msub',
			'span',
		],
		ADD_ATTR: [
			'xmlns',
			'display',
			'class',
			'width',
			'height',
			'href',
			'target',
			'aria-hidden',
		],
		FORBID_ATTR: ['style', 'onerror', 'onload', 'onmouseover', 'onmouseout'],
	});

	return finalHTML;
});
</script>
<style scoped>
@import url('@/assets/hl.css');
@import url('@/assets/github-markdown.css');

:deep(.katex-html) {
	display: none;
}

#content {
	color: var(--color-text);
	width: 100%;
	max-width: 100%;
	height: auto;
	font-size: 23px;
	overflow: hidden;
	overflow-wrap: break-word;
	word-wrap: break-word;
	word-break: break-all;
}

:deep(li) {
	line-height: 1.1;
	margin-top: 0.5em;
}

:deep(table) {
	border-collapse: collapse;
	width: 100%;
	border: white 1px solid;
}

:deep(th) {
	border: white 1px solid;
}

:deep(td) {
	border: white 1px solid;
}

:deep(p) {
	font-size: 20px;
	text-indent: 2rem;
}

:deep(pre) {
	background-color: #282c34;
	color: rgb(180, 180, 180);
	padding: 10px;
	pointer-events: none;
	z-index: 0;
	position: relative;
}
:deep(pre) > code {
	display: block;
	overflow-x: auto;
	color: rgb(180, 180, 180);
	width: 100%;
	pointer-events: auto;
}
:deep(pre) > code::-webkit-scrollbar {
	height: 8px;
}
:deep(pre) > code::-webkit-scrollbar-track {
	background: #1e2227;
	border-radius: 4px;
}
:deep(pre) > code::-webkit-scrollbar-thumb {
	background: #454b55;
	border-radius: 4px;
	cursor: pointer;
}
:deep(pre) > code::-webkit-scrollbar-thumb:hover {
	background: #5a6069;
}
:deep(pre)::before {
	content: '';
	pointer-events: auto;
	background-image: url('/PhCopy.webp');
	background-size: cover;
	display: block;
	position: absolute;
	filter: invert(1);
	z-index: 1;
	width: 20px;
	height: 20px;
	top: 5px;
	right: 5px;
	transform: translateZ(0);
	background-attachment: local;
}
</style>
