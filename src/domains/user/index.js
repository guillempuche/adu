const { Id } = require('../../utils/generator');
const validator = require('./validateUser');
const makeBuildUser = require('./domainUser');

module.exports = { buildUser: makeBuildUser({ Id, validator }) };
