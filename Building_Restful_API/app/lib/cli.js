//CLI Related task

//dependancies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events { };
var e = new _events();

//instantiate the cli module object
var cli = {};

//input processor
cli.processInput = (str) => {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;

    if (str) {
        //codify the unique strings that cli can handle
        var uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more logs info'
        ]

        //go thru the possible inputs and emit a event when match is found
        var matchFound = false;
        var counter = 0;
        uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                //emit an event matching the input
                e.emit(input, str);
                return true;
            }
        });

        //if no match is found tell the user to try again
        if (!matchFound) {
            console.log('Sorry try again');
        }
    }
}

//init
cli.init = () => {
    //send the start message to the console in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'THE CLI is running ');

    //start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    })

    //create an initial prompt
    _interface.prompt();

    //handle each line of input separately
    _interface.on('line', (str) => {
        //send to the input proccesor
        cli.processInput(str);

        //re-initialize the promt afterwards
        _interface.prompt();
    })

    //if the user stop the cli,kill the associated process
    _interface.on('close', () => {
        process.exit(0);
    })
}


//export
module.exports = cli;