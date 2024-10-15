import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  base:'/new/',
  plugins: [
    vue(),
    vueJsxPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      scope:'/new/',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        // 配置无需引入 workbox 的内容
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,webp}'],
      },
      devOptions: {
        // 开发环境是否开启 PWA
        enabled: false,
        type: 'module', 
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    historyApiFallback: true,
  }
})
