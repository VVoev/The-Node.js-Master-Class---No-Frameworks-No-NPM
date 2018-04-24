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



module.exports = helpers;