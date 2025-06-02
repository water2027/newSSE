<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
import DOMPurify from 'dompurify'

import hljs from 'highlight.js/lib/core'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'

import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import html from 'highlight.js/lib/languages/xml'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import { computed, ref } from 'vue'
import 'github-markdown-css'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps({
  markdownContent: {
    type: String,
    required: true,
  },
})
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('html', html)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)

const content = ref(null)

const md: MarkdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (__) {}
    }
    else {
      try {
        return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
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
})

/**
 * @description 安全的html，会自动去掉script和iframe之类的标签
 */
const safeHTML = computed(() => {
  if (!props.markdownContent) {
    return ''
  }

  // 配置 DOMPurify 以允许 KaTeX 相关标签和属性
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'math' || data.tagName === 'annotation') {
      return node
    }
  })

  const rendered = md.render(props.markdownContent)
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
  })

  return finalHTML
})
</script>

<template>
  <div
    id="content"
    ref="content"
    class="markdown-body"
    v-html="safeHTML"
  />
</template>

<style scoped>
@import url('@/assets/hl.css');

:deep(.katex-html) {
  display: none;
}

.markdown-body {
  /* color: var(--color-text); */
  background-color: var(--color-bg);
}

:deep(pre) {
  padding: 10px;
  pointer-events: none;
  z-index: 0;
  position: relative;
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
  cursor: pointer;
}
</style>
