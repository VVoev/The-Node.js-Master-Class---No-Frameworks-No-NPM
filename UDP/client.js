//sending a message to udp server on port 6000
var dgram = require('dgram');


var client = dgram.createSocket('udp4');

//define the mssage and pull it into the buffer
var msgString = 'Some message';
var msgBuffer = Buffer.from(msgString);

client.send(msgBuffer, 6000, 'localhost', (err) => {
    client.close();
})