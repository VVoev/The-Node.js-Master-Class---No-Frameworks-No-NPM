//Dependancies

var http2 = require('http2');

var server = http2.createServer();

//On a stream send back html

server.on('stream', (stream, headers) => {
    stream.respond({
        'status': 200,
        'content-type': 'text/html'
    })
    stream.end('<html><body><p>Hello from http 2</p></body></html>')
})

//listen on 6000
server.listen(6000);