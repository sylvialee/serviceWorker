const CACHE_NAME = 'sylvia_cache_v1.0.0'
const urlsToCache = [
  './worker.js'
]

// 需要被监听的url
const fetchUrl = [
  'https://sylvialee.github.io/serviceWorker/static/img/cat.png'
]

// 需要拦截替换的url
const replaceUrl = {
  'https://sylvialee.github.io/serviceWorker/static/img/cat.png': './static/img/dog.png'
}

// 安装时的监听，用于缓存资源
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(cache)
      return cache.addAll(urlsToCache)
    })
  )
})

// fetch监听
self.addEventListener('fetch', function(e){

  console.log(1, e)
  // 请求URL
  let requestUrl = e.request.url

  // 拦截匹配
  if(fetchUrl.indexOf(requestUrl) > -1){

    // 返回结果替换
    e.respondWith(

      // 请求在缓存中匹配
      caches.match(e.request).then(res => {
        console.log(2, res)
        
        // 缓存不为空时，直接返回缓存结果
        if(res){
          return res
        }

        // 缓存为空时，需要先复制请求信息流或者选择被拦截的信息
        let reqClone = (replaceUrl[requestUrl] ? replaceUrl[requestUrl] : e.request.clone())

        // 返回请求结果
        return fetch(reqClone).then(response => {

          console.log(3, response)
          
          // 返回报错或者为空时，直接返回给页面
          if(!response || response.status !== 200){
            return response
          }

          // 返回结果为200时，缓存结果并将结果返回给页面
          let responseClone = response.clone()

          // 打开缓存空间对象，并缓存
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone)
          })

          return response
        }).catch(err => {

          console.log(4, err)
        })
      })
    )
  }
})