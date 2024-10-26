const CACHE_NAME = 'cache-v1';
const CACHE_PERIOD = 24 * 60 * 60 * 1000;

const STATIC_ASSETS = ['/new/', '/new/index.html'];

// 删除旧缓存
async function cleanOldCaches() {
	const keys = await caches.keys();
	const cachesToDelete = keys.filter((key) => key !== CACHE_NAME);
	await Promise.all(cachesToDelete.map((key) => caches.delete(key)));
}

// 放在定期更新更好一些，但是我不知道为什么没有权限
async function updateCachePeriodically() {
	const cache = await caches.open(CACHE_NAME);
	const requests = await cache.keys();
	await Promise.all(
		requests.map(async (request) => {
			const response = await cache.match(request);
			if (response && response.headers.get('date')) {
				const cacheDate = new Date(response.headers.get('date'));
				if (Date.now() - cacheDate.getTime() > CACHE_PERIOD) {
					return cache.delete(request);
				}
			}
		})
	);
}

// 安装 Service Worker
self.addEventListener('install',async (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Opened cache');
			return cache.addAll(STATIC_ASSETS).catch((error)=>{
        console.error(error)
      })
		})
	);
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
	event.waitUntil(Promise.all([cleanOldCaches(), updateCachePeriodically()]));
});

async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) { 
		const cachedResponse = await caches.match(request, { ignoreSearch: true });
		if (cachedResponse) {
			return cachedResponse;
		}
		return new Response('Network error happened', {
			status: 408,
			headers: { 'Content-Type': 'text/plain' },
		});
	}
}

async function cacheFirst(request) {
	try {
		const cachedResponse = await caches.match(request);
		return cachedResponse || fetch(request);
	} catch (error) {
		return new Response('Cache error happened', {
			status: 408,
			headers: { 'Content-Type': 'text/plain' },
		});
	}
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.url.startsWith('https://api.ssemarket.cn/api')) {
		console.log('network first')
		event.respondWith(networkFirst(request));
	} else {
		console.log('cache first')
		event.respondWith(cacheFirst(request));
	}
});
