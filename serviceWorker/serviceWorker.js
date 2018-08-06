


var CACHE_NAME = 'cache_from_nav'

var files = [
  '/main/style/common.css',
  '/main/script/common.js'
]

this.addEventListner('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      cache.addAll(files)
    })

  )
})
