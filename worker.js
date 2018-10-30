var count = 0


onmessage = function(message){
  count++
  console.log(count, message.data)
  postMessage({
    id: message.data.id,
    message: message.data.msg
  })
}
