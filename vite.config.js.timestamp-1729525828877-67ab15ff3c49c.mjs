// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/water/Documents/CODE/work/newSSE/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/water/Documents/CODE/work/newSSE/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsxPlugin from "file:///C:/Users/water/Documents/CODE/work/newSSE/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/water/Documents/CODE/work/newSSE/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/water/Documents/CODE/work/newSSE/vite.config.js";
var vite_config_default = defineConfig({
  base: "/new/",
  plugins: [
    vue(),
    vueJsxPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      scope: "/new/",
      srcDir: "src",
      filename: "sw.js",
      manifest: {
        "name": "SSE MARKET",
        "short_name": "SSE",
        "scope": "/new/",
        "start_url": "/new/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#000000",
        "icons": [
          {
            "src": "/new/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/new/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      },
      devOptions: {
        // 开发环境是否开启 PWA
        enabled: false,
        type: "module"
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
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    historyApiFallback: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx3YXRlclxcXFxEb2N1bWVudHNcXFxcQ09ERVxcXFx3b3JrXFxcXG5ld1NTRVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcd2F0ZXJcXFxcRG9jdW1lbnRzXFxcXENPREVcXFxcd29ya1xcXFxuZXdTU0VcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3dhdGVyL0RvY3VtZW50cy9DT0RFL3dvcmsvbmV3U1NFL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgdnVlSnN4UGx1Z2luIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTonL25ldy8nLFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgdnVlSnN4UGx1Z2luKCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIHNjb3BlOicvbmV3LycsXHJcbiAgICAgIHNyY0RpcjogJ3NyYycsXHJcbiAgICAgIGZpbGVuYW1lOiAnc3cuanMnLFxyXG4gICAgICBtYW5pZmVzdDp7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiU1NFIE1BUktFVFwiLFxyXG4gICAgICAgIFwic2hvcnRfbmFtZVwiOiBcIlNTRVwiLFxyXG4gICAgICAgIFwic2NvcGVcIjogXCIvbmV3L1wiLFxyXG4gICAgICAgIFwic3RhcnRfdXJsXCI6IFwiL25ldy9cIixcclxuICAgICAgICBcImRpc3BsYXlcIjogXCJzdGFuZGFsb25lXCIsXHJcbiAgICAgICAgXCJiYWNrZ3JvdW5kX2NvbG9yXCI6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIFwidGhlbWVfY29sb3JcIjogXCIjMDAwMDAwXCIsXHJcbiAgICAgICAgXCJpY29uc1wiOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIFwic3JjXCI6IFwiL25ldy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZ1wiLFxyXG4gICAgICAgICAgICBcInNpemVzXCI6IFwiMTkyeDE5MlwiLFxyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgXCJzcmNcIjogXCIvbmV3L2FuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nXCIsXHJcbiAgICAgICAgICAgIFwic2l6ZXNcIjogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiXHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTY2MkZcdTU0MjZcdTVGMDBcdTU0MkYgUFdBXHJcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogJ21vZHVsZScsIFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIF0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNjc3M6IHt9XHJcbiAgICB9XHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2VydmVyOntcclxuICAgIGhpc3RvcnlBcGlGYWxsYmFjazogdHJ1ZSxcclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlQsU0FBUyxlQUFlLFdBQVc7QUFDOVYsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sa0JBQWtCO0FBQ3pCLFNBQVMsZUFBZTtBQUorSyxJQUFNLDJDQUEyQztBQU14UCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFLO0FBQUEsRUFDTCxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxPQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixVQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxvQkFBb0I7QUFBQSxRQUNwQixlQUFlO0FBQUEsUUFDZixTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsUUFBUTtBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsVUFDVjtBQUFBLFFBRUY7QUFBQSxNQUNGO0FBQUEsTUFDQSxZQUFZO0FBQUE7QUFBQSxRQUVWLFNBQVM7QUFBQSxRQUNULE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTSxDQUFDO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFPO0FBQUEsSUFDTCxvQkFBb0I7QUFBQSxFQUN0QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
