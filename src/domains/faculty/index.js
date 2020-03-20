const { Id } = require('../../utils/generator');
const validator = require('./validateFaculty');
const makeBuildFaculty = require('./domainFaculty');

module.exports = {
	buildFaculty: makeBuildFaculty({ Id, validator })
};
