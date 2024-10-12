import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute, setDefaultHandler } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'


precacheAndRoute(self.__WB_MANIFEST);

// 设置默认处理策略
setDefaultHandler(new NetworkFirst({
  cacheName: 'default',
  networkTimeoutSeconds: 5,
}));

// 脚本文件缓存策略
registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'scripts'
  })
);

// 样式文件缓存策略
registerRoute(
  ({ request }) => request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'styles'
  })
);

// 图片缓存策略
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// API请求处理（包含背景同步）
const bgSyncPlugin = new BackgroundSyncPlugin('apiQueue', {
  maxRetentionTime: 24 * 60 // 最多重试24小时（以分钟为单位）
});

registerRoute(
  ({url}) => url.href.startsWith('https://ssemarket.cn/api'),
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// 动态页面导航路由
const dynamicPageRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'dynamic-pages',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  }),
  {
    allowlist: [/^\/new\//],
  }
);

registerRoute(dynamicPageRoute);

// 离线回退
const offlineFallbackRoute = new NavigationRoute(
  new CacheFirst({
    cacheName: 'offline-fallback',
  }),
  {
    navigationFallback: './offline.html',
  }
);

registerRoute(offlineFallbackRoute);

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 已安装');
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 已激活');
});

console.log('Service Worker 已加载');