const { buildUser } = require('../../../src/domains/user');
const { Id } = require('../../../src/utils/generator');
const faker = require('faker');
const _ = require('lodash');

/**
 * User fake generator used on the tests.
 *
 * IMPORTANT: all data has to have some value (not undefined).
 * @param {Object} [overrides] Override some data to build the user object.
 * @return {Object} User
 */
module.exports = function makeBuildFakeUser(overrides) {
	const displayName = faker.name.firstName();
	const fullName = displayName + ' ' + faker.name.lastName();

	const user = {
		_id: Id(),
		auth0Id: Id(),
		displayName,
		fullName,
		emails: {
			auth: fullName.toLowerCase().replace(/ /g, '') + '@email.com',
			account: displayName.toLowerCase() + '@email.com'
		},
		profilePicture: faker.internet.avatar(),
		organizations: [
			{ type: 'faculty', _id: Id(), roles: ['agent'] },
			{ type: 'faculty', _id: Id(), roles: ['visitor'] }
		]
	};

	// merge is used to deep overrides in objects.
	return buildUser(_.merge(user, overrides)).getUser();
};
