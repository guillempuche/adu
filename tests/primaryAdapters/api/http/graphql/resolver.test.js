'use strict';

const resolvers = require('../../../../../src/primaryAdapters/api/http/graphql/resolvers');

describe('pa:api:http:graphql:resolvers', () => {
	it('should export object with Query and Mutation', () => {
		expect(typeof resolvers).toBe('object');
		expect(resolvers).toHaveProperty('Query');
		expect(resolvers).toHaveProperty('Mutation');
		expect(resolvers).toHaveProperty('Response');
	});

	it('should have Query resolvers', () => {
		expect(resolvers.Query).toMatchObject({
			getMe: expect.any(Function)
		});
	});

	it('should have Mutation resolvers', () => {
		expect(resolvers.Mutation).toMatchObject({
			addUser: expect.any(Function),
			sendInvitation: expect.any(Function),
			validateInvitationAndLinkFacultyToUser: expect.any(Function)
		});
	});
});
