<script setup lang="ts">
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import Prism from 'prismjs'
import { computed, nextTick, useTemplateRef } from 'vue'
import 'prismjs/plugins/autoloader/prism-autoloader'
import 'github-markdown-css'
import 'prismjs/themes/prism-tomorrow.css'

const { markdownContent } = defineProps<{
  markdownContent: string
}>()

const content = useTemplateRef<HTMLDivElement>('content')

Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/'

const md: MarkdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
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

md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx]
  const srcIndex = token.attrIndex('src')
  const altIndex = token.attrIndex('alt')
  const titleIndex = token.attrIndex('title')
  if (srcIndex < 0)
    return ''
  if (!token.attrs)
    return ''
  const src = token.attrs[srcIndex][1]
  const alt = altIndex >= 0 ? `alt="${token.content}"` : ''
  const title = titleIndex >= 0 ? ` title="${token.attrs[titleIndex][1]}"` : ''
  // 添加懒加载属性
  return `<img src="${src}"${alt}${title} loading="lazy" />`
}

/**
 * @description 预处理 markdown 内容，使用 encodeURI 编码图片链接中的 URL
 */
function preprocessMarkdown(content: string): string {
  // 先用正则匹配一下
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, urlPart) => {
    const titleIndex = urlPart.lastIndexOf(' "')
    if (titleIndex > 0) {
      return `![${alt}](${encodeURI(urlPart.slice(0, titleIndex))} "${urlPart.slice(titleIndex + 2, -1)}")`
    }
    return `![${alt}](${encodeURI(urlPart)})`
  })
}

/**
 * @description 安全的html，会自动去掉script和iframe之类的标签
 */
const safeHTML = computed(() => {
  if (!markdownContent) {
    return ''
  }

  // 预处理 markdown 内容，编码图片链接中的空格
  const processedContent = preprocessMarkdown(markdownContent)

  // 配置 DOMPurify 以允许 KaTeX 相关标签和属性
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'math' || data.tagName === 'annotation') {
      return node
    }
  })

  const rendered = md.render(processedContent)
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
  nextTick(() => {
    Prism.highlightAllUnder(content.value!)
  })

  return finalHTML
})
</script>

<template>
  <div
    ref="content"
    class="markdown-body w-full"
    data-theme="light"
    v-html="safeHTML"
  />
</template>

<style scoped>
:deep(.katex-html) {
  display: none;
}

.markdown-body {
  color: var(--color-text);
  background-color: var(--color-bg);
}

:deep(pre) {
  padding: 10px;
  position: relative;
  overflow: auto;
}

:deep(pre code) {
  display: block;
  position: relative;
}

:deep(pre code)::after {
  content: '';
  background-image: url('/PhCopy.webp');
  background-size: cover;
  display: block;
  position: sticky;
  filter: invert(1);
  z-index: 10;
  width: 20px;
  height: 20px;
  bottom: calc(100% - 20px);
  left: calc(100% - 20px);
  margin-top: -20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
}

/* :deep(pre) {
  padding: 10px;
  z-index: 0;
  position: relative;
}
:deep(code)::after {
  content: '';
  background-image: url('/PhCopy.webp');
  background-size: cover;
  display: block;
  position: sticky;
  float: right;
  filter: invert(1);
  z-index: 1;
  width: 20px;
  height: 20px;
  top: 5px;
  right: 0;
  transform: translateZ(0);
  background-attachment: local;
  cursor: pointer;
} */
</style>
