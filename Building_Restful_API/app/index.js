//Primary file for the API

//Dependancies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config/config');
var fs = require('fs');

//instantiate the HTTP server
var httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});


//start the http server and have it listen on port 3000
httpServer.listen(config.httpPort, () => {
    console.log(`The server is listening on port ${config.httpPort} now at env ${config.envName} mode`);
})

//instantiate the Https server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});
//start the https server
httpsServer.listen(config.httpsPort, () => {
    console.log(`The server is listening on port ${config.httpsPort} now at env ${config.envName} mode`);
})
//all the server logic for both http and https
var unifiedServer = (req, res) => {
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
}

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