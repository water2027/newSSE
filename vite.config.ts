import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import dnsPrefetchPlugin from './plugins/vite-plugin-dns-prefetch'
// https://vitejs.dev/config/
const base = process.env.CF_PAGES ? '/' : '/new/'
export default defineConfig({
  base,
  plugins: [
    vue(),
    vueJsxPlugin(),
    UnoCSS(),
    // analyzer({
    //   analyzerMode: 'server', // 默认值，启动本地服务器
    //   openAnalyzer: true, // 自动打开浏览器
    //   analyzerPort: 8888, // 分析服务器端口
    // }),
    dnsPrefetchPlugin({
      maxLinks: 5,
      exclude: ['localhost', '127.0.0.1', 'vuejs.org'],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }
          id = id.split('node_modules/')[1]

          if (id.includes('vue')) {
            return 'vue'
          }

          if (id.includes('markdown-it') || id.includes('dompurify') || id.includes('katex')) {
            return 'markdown'
          }

          // 不知道以后会不会换高亮包, 单独提出来吧
          if (id.includes('prismjs')) {
            return 'prismjs'
          }

          if (id.includes('crypto-js')) {
            return 'cryptoJs'
          }

          return 'vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
