const CACHE_NAME = 'sylvia_cache_v1.0.0'
const urlsToCache = [
  './test.js',
  './test.css'
]

self.addEventListener('install', function(e){
  console.log(1, e)
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(cache)
      return cache.addAll(urlsToCache)
    })
  )
})