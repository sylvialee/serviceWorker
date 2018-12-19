const CACHE_NAME = 'sylvia_cache_v1.0.0'
const urlsToCache = [
  './worker.js',
  // './static/img/cat.png'
]
const fetchUrl = [
  '/serviceWorker/static/img/cat.png'
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
    // caches.open(CACHE_NAME).then(cache => {
    //   return fetch('./static/img/cat.png').then(res => {
    //     return cache.put('./static/img/dog.png', res)
    //   })
    // })
    
    e.responseWith(
      caches.match(e.request).then(res => {
        console.log(res)
        if(res){
          return res
        }
        let reqClone = e.request.clone()
        return fetch('./static/img/dog.png').then(response => {
          console.log(response)
          if(!response || response.status !== 200){
            return response
          }

          let responseClone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone)
          })
          return response
        })
      })
    )
  }
})