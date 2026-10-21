const CACHE_NAME = "onehealth-static-v1"
const STATIC_PATHS = new Set(["/icon-192.png", "/icon-512.png"])

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(Array.from(STATIC_PATHS))
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith("onehealth-static-") &&
              cacheName !== CACHE_NAME,
          )
          .map((cacheName) => caches.delete(cacheName)),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    (!url.pathname.startsWith("/_next/static/") &&
      !STATIC_PATHS.has(url.pathname))
  ) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        return cachedResponse
      }

      const response = await fetch(request)
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone())
      }
      return response
    }),
  )
})
