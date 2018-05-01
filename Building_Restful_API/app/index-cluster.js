/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var cluster = require('cluster');
var os = require('os');

// Declare the app
var app = {};

// Init function
app.init = function (callback) {

  if (cluster.isMaster) {
    // Start the workers
    workers.init();

    //start the cli and make sure its last
    setTimeout(() => {
      cli.init();
      callback();
    }, 50)


    for (var i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else {

    // Start if we are not in the master thread the server
    server.init();
  }




};

// Self executing
if (require.main === module) {
  app.init(function () { });
}


// Export the app
module.exports = app;
