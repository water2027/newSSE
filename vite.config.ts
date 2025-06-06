import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
const base = process.env.CF_PAGES ? '/' : '/new/'
export default defineConfig({
  base,
  plugins: [
    vue(),
    vueJsxPlugin(),
    UnoCSS(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/new/',
      srcDir: 'src',
      strategies: 'generateSW',
      manifest: {
        name: 'SSE MARKET',
        short_name: 'SSE',
        scope: `${base}`,
        start_url: `${base}`,
        display: 'fullscreen',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: `${base}android-chrome-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${base}android-chrome-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        // 开发环境是否开启 PWA
        enabled: false,
        type: 'module',
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: new RegExp(
              `^https://ssemarket\.cn${base}.*\.js$`,
            ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: new RegExp(
              `^https://ssemarket\.cn${base}.*\.css$`,
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'css-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
        globPatterns: [],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
  },
})
