/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var exampleDebug = require('./lib/examleDebugingProblem');

// Declare the app
var app = {};

// Init function
app.init = function () {

  debugger;

  // Start the server
  server.init();

  // Start the workers
  workers.init();

  //start the cli and make sure its last
  setTimeout(() => {
    cli.init();
  }, 50)


  var foo = 1;
  debugger;
  foo++;
  debugger;
  foo = foo * foo;
  debugger;
  foo = foo.toString();
  debugger;
  //cll the init of the error
  exampleDebug.init();

};

// Self executing
app.init();


// Export the app
module.exports = app;
