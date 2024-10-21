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
      scope:'/new/',
      srcDir: 'src',
      filename: 'sw.js',
      manifest:{
        "name": "SSE MARKET",
        "short_name": "SSE",
        "scope": "/new/",
        "start_url": "/new/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#000000",
        "icons": [
          {
            "src": "icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          }
        ]
      },
      devOptions: {
        // 开发环境是否开启 PWA
        enabled: false,
        type: 'module', 
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    historyApiFallback: true,
  }
})
