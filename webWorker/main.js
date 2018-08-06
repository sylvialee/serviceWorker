

(function(a){


  var worker = new Worker('./task.js')

  worker.postMessage({
    title: "hello",
    msg: "say hi from main.js"
  })
  
  worker.onmessage = function(event){

    if(event && event.data){
      console.log(event.data.msg)
      return 
    }
    worker.terminal()
  }

  worker.onerror = function(err){
    console.log(err)
  }

})(window)
