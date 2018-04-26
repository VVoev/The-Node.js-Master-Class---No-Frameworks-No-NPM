//Primary file for the API


//dependancies
var server = require('./lib/server');
var workers = require('./lib/workers');

var app = {};

//init
app.init = () => {
    //start the server
    server.init();
    //start the workers
    workers.init();
}

//execute
app.init();

module.exports = app;