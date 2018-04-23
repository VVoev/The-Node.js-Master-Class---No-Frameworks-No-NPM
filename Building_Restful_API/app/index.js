//Primary file for the API

//Dependancies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

//the server should respond to all requests with a string
var server = http.createServer((req, res) => {

    //Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    //Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get the query string as an object
    var queryStringObject = parsedUrl.query;

    //Get the HTTP Method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    //Get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        //send the response
        res.end('Hello Wolrd\n');

        //Log the request path
        console.log('Request received on path ' + trimmedPath + 'with method ' + method + 'with queryString', queryStringObject);
        console.log('Request received with this payload', buffer);
    })

});

var port = process.env.port || 3000;
//start the server and have it listen on port 3000
server.listen(port, () => {
    console.log(`The server is listening on port ${port} now`);
})