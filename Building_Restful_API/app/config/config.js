/*  
 * Create and export configuration variables
 */

//Container for all the Environtments

var environments = {};

//Staging (default)
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': 'ACf581080104d101e0301f7a7e214f502a',
        'authToken': 'bd6fb19d21170735aa41d70202393476',
        'fromPhone': '+359988803738'
    }
}

//Production env
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    }
}

//determine which environt was passed as a command-line argument

var currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check that the current env is one of the envrinets above,if not default to staging
var environmentsToExport = typeof (environments[currentEnv]) === 'object' ?
    environments[currentEnv] : environments.staging;

module.exports = environmentsToExport;