/*  
 * Create and export configuration variables
 */

//Container for all the Environtments

var environments = {};

//Staging (default)
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
}

//Production env
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
}

//determine which environt was passed as a command-line argument

var currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check that the current env is one of the envrinets above,if not default to staging
var environmentsToExport = typeof (environments[currentEnv]) === 'object' ?
    environments[currentEnv] : environments.staging;

module.exports = environmentsToExport;