//CLI Related task

//dependancies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
var os = require('os');
var v8 = require('v8');
var _data = require('./data');
class _events extends events { };
var e = new _events();

//instantiate the cli module object
var cli = {};

// Input handlers
e.on('man', function (str) {
    cli.responders.help();
});

e.on('help', function (str) {
    cli.responders.help();
});

e.on('exit', function (str) {
    cli.responders.exit();
});

e.on('stats', function (str) {
    cli.responders.stats();
});

e.on('list users', function (str) {
    cli.responders.listUsers();
});

e.on('more user info', function (str) {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', function (str) {
    cli.responders.listChecks(str);
});

e.on('more check info', function (str) {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', function () {
    cli.responders.listLogs();
});

e.on('more log info', function (str) {
    cli.responders.moreLogInfo(str);
});


// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function () {
    var commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get statistics on the underlying operating system and resource utilization',
        'List users': 'Show a list of all the registered (undeleted) users in the system',
        'More user info --{userId}': 'Show details of a specified user',
        'List checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
        'More check info --{checkId}': 'Show details of a specified check',
        'List logs': 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'More log info --{logFileName}': 'Show details of a specified log file',
    };

    //show a header for the help that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //show each command followed by its explanation in white:yellow
    for (var key in commands) {
        if (commands.hasOwnProperty(key)) {
            var value = commands[key];
            var line = '\x1b[33m' + key + '\x1b[0m';
            var padding = 60 - line.length;

            for (i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);
    cli.horizontalLine();
};

cli.verticalSpace = (lines) => {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;
    for (i = 0; i < lines; i += 1) {
        console.log('');
    }
}

cli.horizontalLine = () => {
    var width = process.stdout.columns;
    var lines = '';
    for (i = 0; i < width; i += 1) {
        lines += '-';
    }
    console.log(lines);
}

cli.centered = (str) => {
    str = typeof (str) === 'string' && str.trim().length > 0 ? str.trim() : '';

    var width = process.stdout.columns;

    var leftPadding = Math.floor((width - str.length) / 2);

    var line = '';
    for (i = 0; i < leftPadding; i += 1) {
        line += ' ';
    }
    line += str;
    console.log(line);
}

// Exit
cli.responders.exit = function () {
    process.exit(0);
};

// Stats
cli.responders.stats = function () {
    var stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': os.uptime() + ' Seconds',
    }

    //Create a hder for the stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for (var key in stats) {
        if (stats.hasOwnProperty(key)) {
            var value = stats[key];
            var line = '\x1b[33m' + key + '\x1b[0m';
            var padding = 60 - line.length;

            for (i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
};

// List Users
cli.responders.listUsers = function () {
    _data.list('users', (err, userIds) => {
        if (!err && userIds && userIds.length > 0) {
            cli.verticalSpace();
            userIds.forEach(userId => {
                _data.read('users', userId, (err, userData) => {
                    if (!err && userData) {
                        var line = `Name ${userData.firstName} ${userData.lastName} with phone:${userData.phone} Checks:`;
                        var numberOfChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
                        line += numberOfChecks;
                        console.log(line);
                        cli.verticalSpace();
                    }
                })
            });
        }
    })
};

// More user info
cli.responders.moreUserInfo = function (str) {
    //get the id from the string that has been provided
    var arr = str.split('--');
    var userId = typeof (arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

    if (userId) {
        _data.read('users', userId, (err, userData) => {
            if (!err && userData) {
                //remove the hashed password
                delete userData.hashedPassword;
                cli.verticalSpace();
                console.dir(userData, { 'colors': true });
                cli.verticalSpace();
            }
        })
    }
};

// List Checks
cli.responders.listChecks = function () {
    console.log("You asked to list checks");
};

// More check info
cli.responders.moreCheckInfo = function (str) {
    console.log("You asked for more check info", str);
};

// List Logs
cli.responders.listLogs = function () {
    console.log("You asked to list logs");
};

// More logs info
cli.responders.moreLogInfo = function (str) {
    console.log("You asked for more log info", str);
};


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