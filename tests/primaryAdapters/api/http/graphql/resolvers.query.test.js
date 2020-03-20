'use strict';

// For GraphQL and Apollo Server
const { GET_ME } = require('./gql');
const { createTestClient } = require('apollo-server-testing');

// Database
const { addUser } = require('../../../../../src/ports/user');
const { addFaculty } = require('../../../../../src/ports/faculty');
const { clearDb } = require('../../../../secondaryAdapters/db/localDb');

// Utils
const { buildFakeUser, buildFakeFaculty } = require('../../../../utils/faker');
const { createApolloServer } = require('./resolverUtils');

/**
 * IMPORTANT: For testing resolvers we have 2 paths:
 * - GraphQL Testing Server
 * - Resolvers Query object (in Resolvers file)
 *
 * The query functions can need user context.
 */
describe('pa:api:http:graphql:resolvers query', () => {
	let user, faculty, response;

	let validFaculyId, validUserContext;
	beforeAll(async () => {
		// Faculty has to be the same as the faculty assigned to the
		// user because it's used in some tests.
		faculty = await addFaculty(buildFakeFaculty());

		user = await addUser(
			buildFakeUser({
				organizations: [
					{
						type: 'faculty',
						_id: faculty._id,
						roles: ['agent', 'user']
					}
				]
			})
		);

		(validUserContext = {
			_id: user._id,
			organizations: user.organizations
		}),
			(validFaculyId = user.organizations[0]._id);
	});

	afterAll(async () => {
		await clearDb();
	});

	describe('getMe', () => {
		// const validUserContext = {
		// 		_id: user._id,
		// 		organizations: user.organizations
		// 	},
		// 	validFaculyId = user.organizations[0]._id;

		it('should get user data of oneself', async () => {
			// With user context.
			response = await createTestClient(
				createApolloServer(
					{
						auth0Id: user.auth0Id,
						organizations: user.organizations
					},
					null
				)
			).query({
				query: GET_ME
			});
			expect(response.data.getMe.success).toBe(true);

			// An empty list of organizations.
			response = await createTestClient(
				createApolloServer(
					{
						auth0Id: user.auth0Id,
						organizations: []
					},
					null
				)
			).query({
				query: GET_ME
			});
			expect(response.data.getMe.success).toBe(true);
		});

		it(`shouldn't get a user`, async () => {
			// Without user context.
			response = await createTestClient(createApolloServer()).query({
				query: GET_ME
			});
			expect(response.data.getMe.success).toBe(false);

			// Wrong user id.
			response = await createTestClient(
				createApolloServer({ auth0Id: 'id', organizations: [] }, null)
			).query({
				query: GET_ME
			});
			expect(response.data.getMe.success).toBe(false);

			// // Wrong variable
			// response = await createTestClient(
			// 	createApolloServer(user._id, ['visitor'])
			// ).query({
			// 	query: GET_USER,
			// 	variables: { id: 'wrongUserId' }
			// });
			// expect(response.data.getUser.success).toBe(false);

			// // Without the user id in the context.
			// response = await createTestClient(
			// 	createApolloServer(null, ['agent'])
			// ).query({
			// 	query: GET_USER
			// });
			// expect(response.data.getUser.success).toBe(false);
		});
	});
});
