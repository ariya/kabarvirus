const cacheName = 'kabarvirus';
const staticAsset = ['./', './index.html', './manifest.webmanifest', './404.html'];

self.addEventListener('install', async function () {
    const cache = await caches.open(cacheName);
    await cache.addall(staticAsset);
    return self.skipWaiting();
});

self.addEventListener('activate', function () {
    self.clients.claim();
});

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(q);
        await cache.put(req, fresh.clone());
        return fresh;
    } catch (e) {
        const cached = await cache.match(req);
        return cached;
    }
}

self.addEventListener('fetch', function (e) {
    const req = e.request;
    const url = new URL(req.url);

    if (url.origin === location.origin) {
        e.respondWith(cacheFirst(req));
    } else {
        e.respondWith(networkAndCache(req));
    }
});
