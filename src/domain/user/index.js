var Id = require('../../utils/Id');
var validator = require('./validateUser');
var makeUser = require('./domainUser');

const User = makeUser({ Id, validator });

module.exports = User;
