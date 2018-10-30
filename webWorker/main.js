


var worker


document.onload = function(argument) {
}

document.querySelector('#start').addEventListener = function(){
  if(typeof(Worker) !== 'undefined'){
    if(typeof(worker) === 'undefined'){
      worker = new Worker('./task.js')
    }
    worker.onmessage = function(event){

      if(event && event.data){
        document.querySelector('#count').innerHTML(event.data.msg)
        return 
      }
    }

  }else{
    document.querySelector('#count').innerHTML('浏览器不支持')
  }
  
  
}  

document.querySelector('#post').addEventListener = function(){
  worker.postMessage({msg: 'hanmeimei'})
}

document.querySelector('#stop').addEventListener = function(){
  worker.terminate()
}


