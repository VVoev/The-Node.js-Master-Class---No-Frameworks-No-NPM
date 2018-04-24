//REQUEST HANDLERS

//Dependancies
var _data = require('./data');
var helpers = require('./helpers');

//Define the handlers
handlers = {
    ping: (data, cb) => {
        cb(200);
    },
    notFound: (data, cb) => {
        cb(404);
    },
    users(data, cb) {
        var acceptableMethods = ['get', 'post', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._users[data.method](data, cb);
        } else {
            cb(405);
        }
    }
}

//Validator
checkIfStringAndLeghtIsEnought = (name, len) => {
    var result = typeof (name) == 'string' && name.trim().length > 0 ? name.trim() : false;
    return result;
}

checkIfPhoneIsStringAndTenDigitsExactly = (phone) => {
    var result = typeof (phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    return result;
}

//Container for the users submethods

handlers._users = {};

//Get User
//Required data:phone
//Optional data:none

//TODO only authenticated should access themselves
handlers._users.get = (data, cb) => {
    //check the phone number 
    var phone = checkIfPhoneIsStringAndTenDigitsExactly(data.queryStringObject.phone);
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove the hashed password from the user user object before returning it to the requester
                delete data.hashedPassword;
                cb(200, data);
            } else {
                cb(404);
            }
        })
    } else {
        cb(400, { 'Error': 'Missing required data' });
    }
}


//Post User
handlers._users.post = (data, cb) => {
    //Require data: firstName,lastName,phone,password,tosAggrement
    //Optional data:none
    //chech that all fields are filled out
    var firstName = checkIfStringAndLeghtIsEnought(data.payload.firstName, 0);
    var lastName = checkIfStringAndLeghtIsEnought(data.payload.lastName, 0);
    var phone = checkIfPhoneIsStringAndTenDigitsExactly(data.payload.phone);
    var password = checkIfStringAndLeghtIsEnought(data.payload.password, 0);
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        //make sure the user doesnt already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                //hash the password
                var hashedPassword = helpers.hash(password);
                //create the user object
                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        tosAggrement: true
                    }

                    //store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            cb(200);
                        } else {
                            console.log(err);
                            cb(500, { 'Error': 'Could not create a new user' });
                        }
                    })
                } else {
                    cb(500, { 'Error': 'Could not hash the user' });
                }

            } else {
                //user already exist
                console.log(err);
                cb(400, { 'Error': 'user already exist with such phonenumber' });
            }
        })
    } else {
        cb(400, { 'Error': 'Missing required fields' });
    }
}

//Put User
handlers._users.put = (data, cb) => {
    // Check for required field
    var phone = checkIfPhoneIsStringAndTenDigitsExactly(data.payload.phone);

    // Check for optional fields
    var firstName = checkIfStringAndLeghtIsEnought(data.payload.firstName, 0);
    var lastName = checkIfStringAndLeghtIsEnought(data.payload.lastName, 0);
    var password = checkIfStringAndLeghtIsEnought(data.payload.password, 0);

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // Update the fields if necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the new updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            cb(200);
                        } else {
                            console.log(err);
                            cb(500, { 'Error': 'Could not update the user.' });
                        }
                    });
                } else {
                    cb(400, { 'Error': 'Specified user does not exist.' });
                }
            });
        } else {
            cb(400, { 'Error': 'Missing fields to update.' });
        }
    } else {
        cb(400, { 'Error': 'Missing required field.' });
    }

};

//Delete User
//Required field phone
//Todo only authenticated user should be able to delete
handlers._users.delete = (data, cb) => {
    //chech that phone number is valid
    var phone = checkIfPhoneIsStringAndTenDigitsExactly(data.queryStringObject.phone);
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                //Delete the user
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        cb(200);
                    } else {
                        cb(500, { 'Error': 'Could not delete the specified user' })
                    }
                })
            } else {
                cb(400, { 'Error': 'Could not find the specified user' });
            }
        })
    } else {
        cb(400, { 'Error': 'Missing required data' });
    }
}



//Export module
module.exports = handlers;