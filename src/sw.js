import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

// 预缓存
precacheAndRoute(self.__WB_MANIFEST)

// 脚本文件缓存策略
registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate()
)

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
)

// 离线页面
const navigationRoute = new NavigationRoute(
  new NetworkOnly({
    networkTimeoutSeconds: 3,
  }),
  {
    navigationFallback: '/offline.html',
  }
)
registerRoute(navigationRoute)

// 定期更新缓存
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
)

console.log('Service Worker 已加载')