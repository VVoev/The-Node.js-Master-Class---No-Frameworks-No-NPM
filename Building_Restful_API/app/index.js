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

        //Choose the handler this request should go
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        //Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            //use the status code called by the handler or default
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            //use the payload called back by the handler,or default to an empty
            payload = typeof (payload) === 'object' ? payload : {};

            //convert the payload to a string
            var payloadString = JSON.stringify(payload);

            //return the response
            res.setHeader('Content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);


            //send the response            
            console.log('Returning this response', statusCode, payloadString);

        })


        //Log the request path
        console.log('Request received on path ' + trimmedPath + 'with method ' + method + 'with queryString', queryStringObject);
    })

});

var port = process.env.port || 3000;
//start the server and have it listen on port 3000
server.listen(port, () => {
    console.log(`The server is listening on port ${port} now`);
})

//Define the handlers
handlers = {
    sample: (data, cb) => {
        //callback a http status code and a payload object
        cb(406, { 'name': 'sample handler' })
    },
    notFound: (data, cb) => {
        cb(404);
    }
}

//Define a request router
var router = {
    'sample': handlers.sample
};