// Library for storing and editing data


//Dependancies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

//Container
var lib = {};

//based directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/')

//write data to a file
lib.create = (dir, file, data, cb) => {
    //Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to string
            var stringData = JSON.stringify(data);

            //write to file and closeit
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            cb(false);
                        } else {
                            cb('Error closing the file')
                        }
                    });
                } else {
                    cb('error writing to new file');
                }
            })
        } else {
            cb('could not create new file,it may already exist');
        }
    })
}

lib.read = (dir, file, cb) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        if (!err && data) {
            var parsedData = helpers.parseJsonToObject(data);
            cb(false, parsedData);
        } else {
            cb(err, data);
        }
    });
}

lib.update = (dir, file, data, cb) => {
    // Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string
            var stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    // Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    cb(false);
                                } else {
                                    cb('Error closing existing file');
                                }
                            });
                        } else {
                            cb('Error writing to existing file');
                        }
                    });
                } else {
                    cb('Error truncating file');
                }
            });
        } else {
            cb('Could not open file for updating, it may not exist yet');
        }
    });

}


module.exports = lib;

//export the module