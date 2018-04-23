/*  
 * Create and export configuration variables
 */

//Container for all the Environtments

var environments = {};

//Staging (default)
environments.staging = {
    'port': 3000,
    'envName': 'staging'
}

//Production env
environments.production = {
    'port': 5000,
    'envName': 'production'
}

//determine which environt was passed as a command-line argument

var currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
console.log(process.env.NODE_ENV);

//check that the current env is one of the envrinets above,if not default to staging
var environmentsToExport = typeof (environments[currentEnv]) === 'object' ?
    environments[currentEnv] : environments.staging;

module.exports = environmentsToExport;