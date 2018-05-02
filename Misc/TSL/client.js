//TLS CLient

//dep
var tls = require('tls');
var fs = require('fs');
var path = require('path');

var outboundMessage = 'ping';

//server options
var options = {
    'ca': fs.readFileSync(path.join(__dirname, '/../Building_Restful_API/app/https/cert.pem')) //only require because we use self signed cert
};

// Create the client
var client = tls.connect(6000, options, () => {
    // Send the message
    client.write(outboundMessage);
});

// When the server writes back, log what it says then kill the client
client.on('data', function (inboundMessage) {
    var messageString = inboundMessage.toString();
    console.log("I wrote " + outboundMessage + " and they said " + messageString);
    client.end();
});