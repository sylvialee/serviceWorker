李晓娟    租赁平台技术中心-大前端研发部-李晓娟（花名：西薇亚）    15600591713    
service worker的功能点，使用限制。如何使用sw来实现客户端的离线缓存。现有的基于service worker实现的workbox,怎么使用


# service worker 实现离线缓存
近两年前端比较热的话题之一就是PWA（Progressive Web APP）——渐进式网页；致力于实现与原生APP相似的交互体验。

最早听说pwa，是2017年年底的时候，看到朋友圈里的前端大神分享相关文章、应用。今年大概3月份的时候，看到ios从11.3开始支持后，就开始认真了解相关实现。

了解后发现，这一技术涉及到的内容很多。总结下来，pwa的实现其实主要依赖于以下三点：

* `manifest` 实现手机主界面的web app图标、标题、开屏icon等
* `service worker`实现离线缓存请求、更新缓存、删除缓存；iOS safari在11.3系统已支持。
* `push`/`notification`实现消息推送及接收

其中service worker是离线应用的关键，我们主要来说说service worker（以下简称SW）

## 1、service worker 是什么
在说SW之前，先来回顾下js的单线程问题。

众所周知，js在浏览器中是单线程运行的；主要是为了准确操作`DOM`。但单线程存在的问题是，UI线程和js线程需要抢占资源，在js执行耗时逻辑时，容易造成页面假死，用户体验较差。

由此出现了异步操作，可不影响主界面的响应。如`ajax`、`promise`等。

后来html5开放的`web worker`可以在浏览器后台挂载新线程。它无法直接操作DOM，无法访问`window`、`document`、`parent`对象

SW是`web worker`的一种，也是挂载在浏览器后台运行的线程。主要用于代理网页请求，可缓存请求结果；可实现离线缓存功能。也拥有单独的作用域范围和运行环境

### 1.1 SW使用限制
SW除了work线程的限制外，由于可拦截页面请求，为了保证页面安全，浏览器端对sw的使用限制也不少。

- 无法直接操作DOM对象，也无法访问`window`、`document`、`parent`对象。可以访问`location`、`navigator`
- 可代理的页面作用域限制。默认是sw.js所在文件目录及子目录的请求可代理，可在注册时手动设置作用域范围
- 必须在 https 中使用，允许在开发调试的 `localhost` 使用

### 1.2 SW兼容性
目前移动端chrome及ios safari 11.3以上已支持
pc端火狐、谷歌、欧朋等支持

目前来看移动端及pc端都是可以尝试使用哒
![avatar](http://img.hb.aicdn.com/6d1b16079c3f920c18aafb9701cf65b6ace6047f4a2b-YnMm5C)

不过在chrome里调试是最方便的，

可以直观看到当前SW的状态、使用页面；

![avatar](http://img.hb.aicdn.com/32a60afd46e9c0784e7391024b820b0e0ae93e0dc958-SHw7Ll)

在cacheStorage查看缓存空间的存储信息

![avatar](http://img.hb.aicdn.com/030bad0241e90860b4bce6e37fc7bd1f19f888cfb8ee-qGIUOk)

### 1.3、service worker可以解决的问题


* 用户多次访问网站时加快访问速度
* 离线缓存接口请求及文件，更新、清除缓存内容
* 可以在客户端通过 indexedDB API 保存持久化信息


## 2、生命周期
生命周期由5步：注册、安装成功（安装失败）、激活、运行、销毁
事件：install、activate、message、fetch、push、async


由于是离线缓存，所以在首次注册、二次访问、服务脚本更新等会有不同的生命周期

### 2.1 首次注册流程
从主线程注册后，会下载服务工作线程的js。
安装：执行过程即是 installing 过程，此时会触发 install 事件，并执行 installEvent 的 `waitUtil` 方法。执行完毕后，当前状态是 installed。
激活：立即进入 activating 状态；并触发 activate 事件，处理相关事件内容。执行完成后，变成 activated 状态
销毁： 当安装失败或进程被关闭时

![avatar](http://wx3.sinaimg.cn/mw690/76c6c688ly1fwrascaop4j209u0b3mxd.jpg)

### 2.2 二次访问
在上一次服务未销毁时，二次访问页面，直接停留在激活运行状态

![avatar](http://img.hb.aicdn.com/3490511aebb1bb33918826d77b316dce3a59345018bb7-DVsSqb)

### 2.3 服务脚本更新
如上图，sw.js中，每次访问都会被下载一次。并且至少每24小时会被下载一次。为的是避免错误代码一直被运行。
下载后，会比对是否更新，如果更新，就会重新注册安装serivceworker，安装成功后会处于 waiting 状态。
当 clients 都被关闭后，再次打开，才会激活最新的代码
当然，也有方法可以跳过等待，比方说在安装完成后，执行 `installEvent.skipWaiting()`

![avatar](http://wx1.sinaimg.cn/mw690/76c6c688ly1fwr9kw090jj20910chmxk.jpg)

![avatar](http://img.hb.aicdn.com/bbed3a78224e5f6405de0b56375f3a16c95392751e5f1-HDB77K)

## 3、SW的实际使用

### 3.1 注册
在主线程main.js中调起注册方法`register`，`register`只会被执行一次。

    // 主线程的main.js
    // 先判断浏览器是否支持
    if('serviceWorker' in navigator){
      navigator.serviceWorker
        
        // scope是自定义sw的作用域范围为根目录，默认作用域为当前sw.js所在目录的自文件
        .register('./sw.js', {scope: '/'})
            
        // 注册成功后会返回reg对象，指代当前服务线程实例
        .then(reg => {
          console.log('注册成功')  
        })
        .catch(error => {
          console.log('注册失败')
        })
    }else{
      console.log('当前浏览器不支持SW')
    }

### 3.2 安装
在服务线程中添加安装监听及对应需缓存的资源文件

    // 在sw.js中监听对应的安装事件，并预处理需要缓存的文件
    // 该部分内容涉及到cacheStorage API
    
    // 定义缓存空间名称
    const CACHE_NAME = 'sylvia_cache'
    
    // 定义需要缓存的文件目录
    let filesToCache = [
      '/src/css/test.css',
      '/src/js/test.js'
    ]
    
    // 监听安装事件，返回installEvent对象
    self.addEventListener('install', function(event){
        
      // waitUntil方法执行缓存方法
      event.waitUntil(
        
        // cacheStorage API 可直接用caches来替代
        // open方法创建/打开缓存空间，并会返回promise实例
        // then来接收返回的cache对象索引
        caches.open(CACHE_NAME).then(cache => {
            
          // cache对象addAll方法解析（同fetch）并缓存所有的文件
          cache.addAll(filesToCache)
        })
      )
    })

### 3.3 激活
第一次注册并安装成功后，会触发 activate 事件

    self.addEventListener('activate', event => {
      console.log('安装成功，即将监听作用域下的所有页面')
    })

在有sw脚本更新时，在后台默默注册安装新的脚本文件，安装成功后进入 waiting 状态。当前所有老版本控制的页面关闭后，再次打开时，新版本的脚本触发 activate 事件，此时可清除旧缓存，当前是修改 CACHE_NAME 的值来实现清除之前的缓存

    // 监听激活事件
    self.addEventListener('activate', event => {
      // 获取所有的缓存key值，将需要被缓存的路径加载放到缓存空间下
      var cacheDeletePromise = caches.keys().then(keyList => {
        Promise.all(keyList.map(key => {
          if(key !== CACHE_NAME){
            var deletePromise = caches.delete(key)
            return deletePromise
          }else{
            Promise.resolve()
          }
        }))
      })
      // 等待所有的缓存都被清除后，直接启动新的缓存机制
      event.waitUtil(
        Promise.all([cacheDeletePromise]).then(res => {
          this.clients.claim()
        })
      )
    })

### 3.4 运行
安装并激活成功后，就可以对页面实行`fetch`监控啦。


    // 可以过滤使用已缓存的请求，若无缓存，由fetch发起新的请求，并返回给页面
    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request).then(res => {
          if(res){
            return res
          }else{
            return fetch(event.request)
          }
        })
      )
    })

    // 也可连续将请求缓存到内存里
    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request).then(response => {
          if(response){
            return response
          }
          let requestClone = event.request.clone()
          return fetch(requestClone).then(res => {
            if(!res || res.status !== 200){
              return res
            }
            let resClone = res.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, resClone)
            })
            return res
          })
        })
      )
    })

### 3.5 进程销毁
- 当安装失败时会被浏览器丢弃该工作线程
- 浏览器后台启动SW时，会消耗性能，所以在不需要使用缓存时，可销毁

    self.terminate()



## 4、应用框架workbox
目前chrome有出一套完整的SW实用框架，可以较低成本的实现离线缓存
并提前封装好了对应所需的API
### 使用方法
在sw.js的文件中直接引入workbox的cdn上的文件

    importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-alpha.3/workbox-sw.js')
    if(workbox){
      console.log('your workbox is working now')
    }else{
      console.log('it can't work!')
    }

如果浏览器支持，可以直接在引用API接口：

- precaching，可以在注册成功后直接缓存的文件
- routing，匹配符合规则的url，与stratagies合作来完成文件的缓存

示例：
    
    // 注册完成后，即缓存对应的文件列表
    workbox.precaching.precacheAndRoute([
      '/src/static/js/index.js',
      '/src/static/css/index/css',
      {url: '/src/static/img/logo.png', revision" }
    ])
    
    // routing方法匹配请求文件路径，strategies用来存储对应文件
    workbox.routing.registerRoute(
      matchFunction,  // 字符串或者是正则表达式
      handler // 可以使用workbox.strategies缓存策略来缓存
    )

`workbox.strategies`缓存策略有：

- staleWhileRevalidate 使用已有的缓存，然后发起请求，用请求结果来更新缓存
- networkFirst 先发起请求，请求成功后会缓存结果。如果失败，则使用最新的缓存
- cacheFirst 总是先使用缓存，如果无匹配的缓存，则发起网络请求并缓存结果
- networkOnly 强制发起请求
- cacheOnly 强制使用缓存

示例：
     
     // 缓存使用方法
    workbox.routing.registerRoute(
      '/src/index.js',
      workbox.strategies.staleWhileRevalidate()
    )
    
## 5、总结
以上可以实现简单的离线缓存。

####但在实际使用中，一般离线内容有： 数据请求类、静态资源类、html页面类等。

- 数据请求类：主要可缓存一些重要数据，需要注意数据量，一半浏览器分配给sw的空间是有限的，需要及时更新及删除无效数据。
- 静态资源类：一般是放在cdn上的文件，这时需要处理一些跨域缓存问题
- html页面类：页面的缓存需要谨慎处理，因为如果注册sw的代码写在页面上的话，注意采用第二种缓存方法


####缓存更新，大多是两种：

- 引用新的sw.js的文件，即修改注册时的文件名
- 修改`cacheStorage`中的缓存对象名称（推荐这种）

回到html的缓存问题。如果缓存了注册sw的页面文件，那么访问时，总会从缓存中取页面内容。此时若采用第一种缓存方式，那么会出现sw永远无法更新的问题

目前来看还是比较推荐使用workbox来接入，实现比较方便，缓存策略也比较实用


## 6、参考文献
1、https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API

2、https://www.jianshu.com/p/916a01670a23

3、https://developers.google.com/web/tools/workbox/

## 7、demo演示
由于微信中并不支持SW，所以建议在浏览器中打开
- demo地址：https://sylvialee.github.io/serviceWorker/
- 二维码： 
![avatar](http://img.hb.aicdn.com/b194b23056db821f98ba530ef793dc71d1a9a3ce656-8xLBXw)
