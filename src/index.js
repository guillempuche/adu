const serverless = require('serverless-http');
const server = require('./primaryAdapters/api/http');
const {settlogger,}

module.exports.handler = serverless(server({}));
