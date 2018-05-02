
//TLS 

//Dep
var tls = require('tls');
var fs = require('fs');
var path = require('path');

//server options
var options = {
    'key': fs.readFileSync(path.join(__dirname, '/../Building_Restful_API/app/https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../Building_Restful_API/app/https/cert.pem'))
};


var server = tls.createServer(options, (connection) => {
    var outMsg = 'pong';
    connection.write(outMsg);

    connection.on('data', (inbound) => {
        var inMsg = inbound.toString();
        console.log(`outbound:${outMsg} inbound:${inMsg}`);
    })
})

server.listen(6000);