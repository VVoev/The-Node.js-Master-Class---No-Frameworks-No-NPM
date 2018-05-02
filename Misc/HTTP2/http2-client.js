//dependancies
var http2 = require('http2');


//create client
var client = http2.connect('http://localhost:6000');

//create a request
var req = client.request({
    ':path': '/'
})

//when a message is received and the pieces of it togerther
var str = '';
req.on('data', (chunk) => {
    str += chunk;
})

req.on('data', (chunk) => {
    console.log(chunk);
})

req.on('end', () => {
    console.log(str);
})

//end the req
req.end();

