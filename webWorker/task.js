

onmessage = function(message){
  var data = {
    title: 'hello back',
    msg: 'say hello from task.js'
  }
  if(message && message.data){
    console.log(message.data.msg)
  }
  postMessage(data)
}