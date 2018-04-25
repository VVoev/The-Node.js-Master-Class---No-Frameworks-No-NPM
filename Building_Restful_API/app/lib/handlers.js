//REQUEST HANDLERS

//Dependancies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('../config/config');

//Define the handlers
handlers = {
    ping: (data, cb) => {
        cb(200);
    },
    notFound: (data, cb) => {
        cb(404);
    },
    users: (data, cb) => {
        var acceptableMethods = ['get', 'post', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._users[data.method](data, cb);
        } else {
            cb(405);
        }
    },
    tokens: (data, cb) => {
        var acceptableMethods = ['get', 'post', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._tokens[data.method](data, cb);
        } else {
            cb(405);
        }
    },
    checks: (data, cb) => {
        var acceptableMethods = ['get', 'post', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            handlers._checks[data.method](data, cb);
        } else {
            cb(405);
        }
    }
}

//private Validator
checkIfStringAndLeghtIsEnought = (name, len) => {
    var result = typeof (name) == 'string' && name.trim().length > 0 ? name.trim() : false;
    return result;
}

checkIfPhoneIsStringAndTenDigitsExactly = (phone) => {
    var result = typeof (phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    return result;
}

updateTheOptionalParameter = (protocol, url, successCodes, timeoutSeconds, method, checkData) => {
    if (protocol) {
        checkData.protocol = protocol;
    }
    if (url) {
        checkData.url = url
    }
    if (successCodes) {
        checkData.successCodes = successCodes
    }
    if (timeoutSeconds) {
        checkData.timeoutSeconds = timeoutSeconds
    }
    if (method) {
        checkData.method = method;
    }

    return checkData;
}

//Container for all the checks methods
handlers._checks = {

    //Required data:protocol,url,method,successCode,timeoutSeconds
    //Optional data:none
    post: (data, cb) => {
        //validate inputs
        var protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
        var url = checkIfStringAndLeghtIsEnought(data.payload.url, 0);
        var method = typeof (data.payload.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
        var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
        var timeoutSeconds = typeof
            (data.payload.timeoutSeconds) == 'number' &&
            data.payload.timeoutSeconds % 1 === 0 &&
            data.payload.timeoutSeconds >= 1 &&
            data.payload.timeoutSeconds <= 5 ?
            data.payload.timeoutSeconds : false;

        if (protocol && url && method && successCodes && timeoutSeconds) {
            //Get the token from the headers
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

            _data.read('tokens', token, (err, tokenData) => {
                if (!err && tokenData) {
                    var userPhone = tokenData.phone;

                    //lookup the userdata
                    _data.read('users', userPhone, (err, userData) => {
                        if (!err && userData) {
                            var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                            //verify the user has less than the max 
                            if (userChecks.length < config.maxChecks) {
                                var checkId = helpers.createRandomString(20);

                                var checkObject = {
                                    'id': checkId,
                                    'userPhone': userPhone,
                                    'protocol': protocol,
                                    'url': url,
                                    'method': method,
                                    'successCodes': successCodes,
                                    'timeoutSeconds': timeoutSeconds
                                }

                                //save the object

                                _data.create('checks', checkId, checkObject, (err) => {
                                    if (!err) {
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);

                                        //save the new user data
                                        _data.update('users', userPhone, userData, (err) => {
                                            if (!err) {
                                                cb(200, checkObject);
                                            } else {
                                                cb(500, { 'Error': 'Could not update user with new check' });
                                            }
                                        })
                                    } else {
                                        cb(500, { 'Error': 'Could not create the new check' });
                                    }
                                })
                            } else {
                                cb(400, { 'Error': 'Use has already maximum number of checks' })
                            }
                        } else {
                            cb(403);
                        }
                    })
                } else {
                    cb(403);
                }
            })
        } else {
            cb(400, { 'Error': 'Missing required inputs' })
        }
    },

    //Required data:id
    //Optional data:none
    get: (data, cb) => {
        // Check that id is valid
        var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
        if (id) {
            // Lookup the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // Get the token that sent the request
                    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            // Return check data
                            cb(200, checkData);
                        } else {
                            cb(403);
                        }
                    });
                } else {
                    cb(404);
                }
            });
        } else {
            cb(400, { 'Error': 'Missing required field, or field invalid' })
        }
    },

    //Required data:id
    //Optional data:protocol,url,method,successCdes,timeoutSeconds (at least one must be set)
    put: (data, cb) => {
        // Check for required field
        var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

        // Check for optional fields
        var protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
        var url = checkIfStringAndLeghtIsEnought(data.payload.url, 0);
        var method = typeof (data.payload.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
        var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
        var timeoutSeconds = typeof
            (data.payload.timeoutSeconds) == 'number' &&
            data.payload.timeoutSeconds % 1 === 0 &&
            data.payload.timeoutSeconds >= 1 &&
            data.payload.timeoutSeconds <= 5 ?
            data.payload.timeoutSeconds : false;


        if (id) {
            //Check to see that there is at least one optional
            if (protocol || url || successCodes || timeoutSeconds || method) {
                _data.read('checks', id, (err, checkData) => {
                    if (!err && checkData) {
                        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                        console.log(token);
                        // Verify that the given token is valid for the phone number
                        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                //update the checkdata
                                checkData = updateTheOptionalParameter(protocol, url, successCodes, timeoutSeconds, method, checkData);

                                //Store the updates
                                _data.update('checks', id, checkData, (err) => {
                                    if (!err) {
                                        cb(200);
                                    } else {
                                        cb(500, { 'Error': 'Could not update the  check' });
                                    }
                                })
                            } else {
                                cb(403);
                            }
                        })
                    } else {
                        cb(400, { 'Error': 'check id does not exist' });
                    }
                })
            } else {
                cb(400, { 'Error': 'Missing optional parameter' });
            }
        } else {
            cb(500, { 'Error': 'Missing required fields' });
        }


    },

    //Required data:id
    //Optional data:none
    delete: (data, cb) => {
        // Check that id is valid
        var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
        if (id) {
            // Lookup the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // Get the token that sent the request
                    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {

                            // Delete the check data
                            _data.delete('checks', id, (err) => {
                                if (!err) {
                                    // Lookup the user's object to get all their checks
                                    _data.read('users', checkData.userPhone, (err, userData) => {
                                        if (!err) {
                                            var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                            // Remove the deleted check from their list of checks
                                            var checkPosition = userChecks.indexOf(id);
                                            if (checkPosition > -1) {
                                                userChecks.splice(checkPosition, 1);
                                                // Re-save the user's data
                                                userData.checks = userChecks;
                                                _data.update('users', checkData.userPhone, userData, (err) => {
                                                    if (!err) {
                                                        cb(200);
                                                    } else {
                                                        cb(500, { 'Error': 'Could not update the user.' });
                                                    }
                                                });
                                            } else {
                                                cb(500, { "Error": "Could not find the check on the user's object, so could not remove it." });
                                            }
                                        } else {
                                            cb(500, { "Error": "Could not find the user who created the check, so could not remove the check from the list of checks on their user object." });
                                        }
                                    });
                                } else {
                                    cb(500, { "Error": "Could not delete the check data." })
                                }
                            });
                        } else {
                            cb(403);
                        }
                    });
                } else {
                    cb(400, { "Error": "The check ID specified could not be found" });
                }
            });
        } else {
            cb(400, { "Error": "Missing valid id" });
        }
    }
}

//Container for the tokens methods
handlers._tokens = {
    //Tokens post
    //Required data phone and password
    //Optional data:none
    post: (data, cb) => {
        var phone = checkIfPhoneIsStringAndTenDigitsExactly(data.payload.phone);
        var password = checkIfStringAndLeghtIsEnought(data.payload.password, 0);
        if (phone && password) {
            //Lookup the user who matches the phone number
            _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    //hash the send password and comprare it
                    var hashedPassword = helpers.hash(password);
                    if (hashedPassword === userData.hashedPassword) {
                        //create a new token with random name set expiration date one hour in the future
                        var tokenId = helpers.createRandomString(20);
                        var expires = Date.now() + (1000 * 60 * 60);
                        var tokenObject = {
                            'phone': phone,
                            'id': tokenId,
                            'expires': expires
                        };

                        //save the token
                        _data.create('tokens', tokenId, tokenObject, (err) => {
                            if (!err) {
                                cb(200, tokenObject);
                            } else {
                                cb(500, { 'Error': 'Could not create new token' });
                            }
                        })
                    } else {
                        cb(400, { 'Error': 'passwords doesnt match' })
                    }

                } else {
                    cb(400, { 'Error': 'Such user is not found' })
                }
            })
        } else {
            cb(400, { 'Error': 'Missing required fields' })
        }
    },

    //Required data:id
    //Optional data:none
    get: (data, cb) => {
        //check the phone number 
        var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;
        if (id) {
            _data.read('tokens', id, (err, tokenData) => {
                if (!err && tokenData) {
                    cb(200, tokenData);
                } else {
                    cb(404);
                }
            })
        } else {
            cb(400, { 'Error': 'Missing required data' });
        }
    },

    //Tokens put
    //Required data:id,extend
    //Optional data:none
    put: (data, cb) => {
        var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
        var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
        if (id && extend) {
            _data.read('tokens', id, (err, tokenData) => {
                if (!err && tokenData) {
                    //check to make sure the token isnt already expired
                    if (tokenData.expires > Date.now()) {
                        tokenData.expires = Date.now() + (1000 * 60 * 60);

                        //store the new update
                        _data.update('tokens', id, tokenData, (err) => {
                            if (!err) {
                                cb(200);
                            } else {
                                cb(500, { 'Error': 'Could not update the token' });
                            }
                        })
                    } else {
                        cb(400, { 'Error': 'Token has been expired' });
                    }
                } else {
                    cb(400, { 'Error': 'Specified token does not exist' });
                }
            })
        } else {
            cb(400, { 'Error': 'Missing required field(s) or fields(s) are invalid' });
        }
    },


    //Tokens delete
    //Required data: id
    //Optional data:none
    delete: (data, cb) => {
        var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        if (id) {
            //lookup the token
            _data.read('tokens', id, (err, data) => {
                if (!err && data) {
                    _data.delete('tokens', id, (err) => {
                        if (!err) {
                            cb(200);
                        } else {
                            cb(400, { 'Error': 'Coulnt delete the token' });
                        }
                    })
                } else {
                    cb(400, { 'Error': 'could not find the specified token' });
                }
            })
        } else {
            cb(400, { 'Error': 'provided id is incorrect' });
        }
    }
}

//Container for the users submethods

handlers._users = {};
//Get User
//Required data:phone
//Optional data:none
handlers._users.get = (data, cb) => {
    //check the phone number 
    var phone = checkIfPhoneIsStringAndTenDigitsExactly(data.queryStringObject.phone);
    if (phone) {

        // Get token from headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password from the user user object before returning it to the requester
                        delete data.hashedPassword;
                        cb(200, data);
                    } else {
                        cb(404);
                    }
                });
            } else {
                cb(403, { "Error": "Missing required token in header, or token is invalid." })
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' })
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

            // Get token from headers
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {

                    // Lookup the user
                    _data.read('users', phone, (err, userData) => {
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
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    cb(200);
                                } else {
                                    cb(500, { 'Error': 'Could not update the user.' });
                                }
                            });
                        } else {
                            cb(400, { 'Error': 'Specified user does not exist.' });
                        }
                    });
                } else {
                    cb(403, { "Error": "Missing required token in header, or token is invalid." });
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

        // Get token from headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                cb(200);
                            } else {
                                cb(500, { 'Error': 'Could not delete the specified user' });
                            }
                        });
                    } else {
                        cb(400, { 'Error': 'Could not find the specified user.' });
                    }
                });
            } else {
                cb(403, { "Error": "Missing required token in header, or token is invalid." });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

//Verify if a given token id is current valid for a given user
handlers._tokens.verifyToken = (id, phone, cb) => {

    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                cb(true);
            } else {
                cb(false);

            }
        } else {
            cb(false);
        }
    })
}




//Export module
module.exports = handlers;