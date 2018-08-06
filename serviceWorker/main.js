


if(navigator.serviceWorker){

  navigator.serviceWorker.register('./serviceWorker.js').then(function(success){
    console.log(success)
  }, function(err){
    console.log(err)
  })

}