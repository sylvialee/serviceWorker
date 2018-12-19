const CACHE_NAME = 'sylvia_cache_v1.0.0'
const urlsToCache = [
  './worker.js'
]
const fetchUrl = [
  './static/img/cat.png'
]

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(cache)
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', function(e){
  console.log(e)
  let requestUrl = e.request.url
  if(fetchUrl.indexOf(requestUrl) > -1){
    caches.open(CACHE_NAME).then(cache => {
      return fetch('./static/img/dog.png').then(res => {
        return cache.put('./static/img/cat.png', res)
      })
    })
    
    e.responseWith(
      // caches.open(CACHE_NAME).then(cache => {
      //   cache.put(e.request, )
      // })
      return fetch('./static/img/dog.png').then(res => {
        return cache.put('./static/img/cat.png', res)
      })
    )
  }
})