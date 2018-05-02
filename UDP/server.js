//dep

var dgram = require('dgram');

//create a server
var server = dgram.createSocket('udp4');

server.on('message', (messageBuffer, sender) => {
    var messageString = messageBuffer.toString();
    console.log(messageString);
})

server.bind(6000);