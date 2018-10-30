


if(navigator.serviceWorker){

  navigator.serviceWorker.register('./serviceWorker.js').then(function(success){
    console.log(success)
  }, function(err){
    console.log(err)
  })

  navigator.serviceWorker.onmessage = function(e){
    console.log(e.data)
  }

}