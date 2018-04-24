//dependancies
var crypto = require('crypto');
var config = require('../config/config');

//container for all the helpers
var helpers = {};

//create a sha256 hash
helpers.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

//Parse a json to anb object of all cases,without throwing
helpers.parseJsonToObject = (str) => {
    try {
        var object = JSON.parse(str);
        return object;
    } catch (error) {
        return {};
    }
}

//Create a string of random characters of given length

helpers.createRandomString = (strLength) => {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        var possibleCharacters = 'qwertyuiopasdfghjklzxcvbnm1234567890';
        var str = '';
        for (i = 1; i < strLength; i += 1) {
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomChar;
        }

        return str;
    } else {
        return false;
    }
}



module.exports = helpers;