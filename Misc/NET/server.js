

//dep
var net = require('net');

var server = net.createServer((connection) => {
    var outMsg = 'pong';
    connection.write(outMsg);

    connection.on('data', (inbound) => {
        var inMsg = inbound.toString();
        console.log(`outbound:${outMsg} inbound:${inMsg}`);
    })
})


server.listen(6000);