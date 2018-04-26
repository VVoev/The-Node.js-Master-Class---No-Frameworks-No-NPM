//dependancies
var crypto = require('crypto');
var config = require('../config/config');
var https = require('https');
var querystring = require('querystring');

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
        for (i = 1; i <= strLength; i += 1) {
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomChar;
        }

        return str;
    } else {
        return false;
    }
}


//Send a SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, cb) => {
    //validate parameters
    phone = typeof (phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;

    if (phone && msg) {

        //configure the request payload
        var payload = {
            'From': config.twilio.fromPhone,
            'To': '+44' + phone,
            'Body': msg
        }

        //stringify the payload
        var stringPayload = querystring.stringify(payload);

        //configure the request details
        // Configure the request details
        var requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }

        };

        var req = https.request(requestDetails, (res) => {
            //grab the status of the send request
            var status = res.statusCode;

            if (status === 200 || status === 201) {
                cb(false);
            } else {
                cb(`status code returned ${status}`)
            }
        })
    } else {
        cb('Given parameters are missing or invalid');
    }

    //bind to the error event so it does not kill the node loop
    req.on('error', (error) => {
        cb(error);
    })

    //add the payload
    req.write(stringPayload);

    //end the request
    req.end();
}


module.exports = helpers;