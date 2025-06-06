<script setup lang="ts">
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import Prism from 'prismjs'
import { computed, ref } from 'vue'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup'
import 'github-markdown-css'
import 'prismjs/themes/prism-tomorrow.css'

const { markdownContent } = defineProps<{
  markdownContent: string
}>()

const content = ref(null)

const md: MarkdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    const languageMap: Record<string, string> = {
      html: 'markup',
      xml: 'markup',
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
    }

    const normalizedLang = languageMap[lang] || lang

    if (normalizedLang && Prism.languages[normalizedLang]) {
      try {
        const highlighted = Prism.highlight(str, Prism.languages[normalizedLang], normalizedLang)
        return `<pre class="language-${normalizedLang}"><code class="language-${normalizedLang}">${highlighted}</code></pre>`
      }
      catch (error) {
        console.warn('Prism highlighting failed:', error)
      }
    }

    return `<pre class="language-none"><code>${md.utils.escapeHtml(str)}</code></pre>`
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

md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx]
  const srcIndex = token.attrIndex('src')
  const altIndex = token.attrIndex('alt')
  const titleIndex = token.attrIndex('title')
  if (srcIndex < 0)
    return ''
  if(!token.attrs) return ''
  const src = token.attrs[srcIndex][1]
  const alt = altIndex >= 0 ? `alt="${token.content}"` : ''
  const title = titleIndex >= 0 ? ` title="${token.attrs[titleIndex][1]}"` : ''
  // 添加懒加载属性
  return `<img src="${src}"${alt}${title} loading="lazy" />`
}

/**
 * @description 安全的html，会自动去掉script和iframe之类的标签
 */
const safeHTML = computed(() => {
  if (!markdownContent) {
    return ''
  }

  // 配置 DOMPurify 以允许 KaTeX 相关标签和属性
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'math' || data.tagName === 'annotation') {
      return node
    }
  })

  const rendered = md.render(markdownContent)
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
    ref="content"
    class="markdown-body"
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
