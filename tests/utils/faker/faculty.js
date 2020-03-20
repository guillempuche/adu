const { buildFaculty } = require('../../../src/domains/faculty');
const { Id, UtcNow } = require('../../../src/utils/generator');
const faker = require('faker');

/**
 * @param {Object} [overrides] Add some data to build the faculty object.
 * @return {Object} Faculty
 */
module.exports = function buildFakeFaculty(overrides) {
	const faculty = {
		_id: Id(),
		name: faker.company.companyName(),
		invitations: [
			{
				email: faker.internet.email().toLowerCase(),
				code: Id().slice(0, 8),
				roles: ['faculty-admin'],
				// UNIX epoch with 13 digits.
				createdAt: UtcNow() - 1000
			},
			{
				email: faker.internet.email().toLowerCase(),
				code: Id().slice(0, 10),
				roles: ['agent'],
				createdAt: UtcNow()
			}
		]
	};

	return buildFaculty({ ...faculty, ...overrides }).getFaculty();
};
