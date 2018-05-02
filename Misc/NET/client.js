
//TCP(NET)

//Dep
var net = require('net');

//def msg
var outbound = 'ping';
var client = net.createConnection({ 'port': 6000 }, () => {
    //send the msg
    client.write(outbound);
});

//when the server respond log it and kill the client
client.on('data', (inboundMsg) => {
    msgStr = inboundMsg.toString();
    console.log(`outbound:${outbound} inbound:${msgStr}`);
    client.end();
})