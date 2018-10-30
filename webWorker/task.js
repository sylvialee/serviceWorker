

onmessage = function(message){
  var data = {
    title: 'hello back',
    msg: 'say hello from'
  }
  if(message && message.data){
    data.msg = data.msg + message.data.msg
    console.log(message.data.msg)
  }
  postMessage(data)
}

function count(){
  for(var i=0; i<10000000000; i++){
    if(i%1000 === 0){
      postMessage(i)
    }
  }
}
count()