// Library for storing and editing data


//Dependancies
var fs = require('fs');
var path = require('path');

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
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        cb(err, data);
    });
}

lib.update = (dir, file, data, cb) => {
    //Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to string
            var stringData = JSON.stringify(data);

            //trunkate the file
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    //write to a file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    cb(false);
                                } else {
                                    cb('Error closing the file')
                                }
                            })
                        } else {
                            cb('Error writing to a existing file');
                        }
                    })
                } else {
                    cb('Error truncating file')
                }
            })

        } else {
            cb('could not open the file,maybe its not existing')
        }
    });
}

//delete a file
lib.delete = (dir, file, cb) => {
    //Unlink the file
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            cb(false);
        } else {
            cb('Error while deleting a file')
        }
    })
}


module.exports = lib;

//export the module