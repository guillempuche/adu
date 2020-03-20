'use strict';

const {
	getUserFromToken,
	areSomeRolesAllowed,
	replaceOrganizationsInAuth0AppMetadata
} = require('../../../src/secondaryAdapters/auth');
const {
	makeReplaceOrganizationsInAuth0AppMetadata
} = require('../../../src/secondaryAdapters/auth/auth0Adapter');

// Utils
const {
	auth0Management,
	createAuth0User,
	deleteAuth0User,
	getAuth0User
} = require('./auth0Utils');
const { addUser } = require('../../../src/ports/user');
const { clearDb } = require('../db/localDb');
const { buildFakeUser } = require('../../utils/faker');
const axios = require('axios');

describe('sa:auth', () => {
	let user, userAuth0;

	beforeAll(async () => {
		userAuth0 = await createAuth0User();
		// Create user on the db.
		user = await addUser(buildFakeUser({ auth0Id: userAuth0.user_id }));
	});

	afterAll(async () => {
		await deleteAuth0User(userAuth0.user_id);
		await clearDb();
	});

	it('index.js should export some functions', () => {
		expect(typeof getUserFromToken).toBe('function');
		expect(typeof areSomeRolesAllowed).toBe('function');
		expect(typeof replaceOrganizationsInAuth0AppMetadata).toBe('function');
	});

	describe('authorization', () => {
		let accessToken;

		// IMPORTANT: access token hasn't associated any user, for this reason
		// it doesn't contain user data.
		it('should get user from a given token', async () => {
			const {
				data: { access_token: accessToken }
			} = await axios.post(
				`https://${process.env.AUTH0_DOMAIN}/oauth/token`,
				{
					client_id: process.env.AUTH0_CLIENT_ID_APIGATEWAY,
					client_secret: process.env.AUTH0_CLIENT_SECRET_APIGATEWAY,
					audience: process.env.AUTH0_AUDIENCE_API_USER,
					grant_type: 'client_credentials'
				}
			);

			const { _id, organizations } = await getUserFromToken(
				'Bearer ' + accessToken
			);
			expect(typeof _id).toBe('string');
			expect(organizations).not.toBeDefined();
		});

		it(`shouldn't get the token `, async () => {
			await expect(getUserFromToken()).resolves.toBeNull();

			await expect(getUserFromToken('Bearer 1')).resolves.toBeNull();

			await expect(
				getUserFromToken('token ' + accessToken)
			).resolves.toBeNull();
		});

		it('should validate if some role are allowed', () => {
			user = buildFakeUser({
				organizations: [
					{
						type: 'faculty',
						_id: 'id',
						roles: ['faculty-admin', 'agent']
					}
				]
			});
			expect(
				areSomeRolesAllowed(['agent'], user.organizations, 'id')
			).toBe(true);
			expect(
				areSomeRolesAllowed(
					['faculty-admin', 'agent'],
					user.organizations,
					'id'
				)
			).toBe(true);
			expect(areSomeRolesAllowed(['agent'], ['visitor'])).toBe(false);
		});

		it(`should throw an error because of invalid argument`, () => {
			expect(() => {
				makeReplaceOrganizationsInAuth0AppMetadata();
			}).toThrow();
		});
	});

	describe('auth0', () => {
		let replaceOrganizationsInAuth0AppMetadata;

		beforeAll(async () => {
			replaceOrganizationsInAuth0AppMetadata = makeReplaceOrganizationsInAuth0AppMetadata(
				{
					// More about the API on: https://auth0.com/docs/api/management/v2
					auth0Management
				}
			);
		});

		it('should replaces organizations on Auth0', async () => {
			let updatedUser,
				organizations = [
					{ type: 'faculty', _id: 'idA', roles: ['agent'] },
					{ type: 'faculty', _id: 'idB', roles: ['visitor'] }
				];

			// Add organizations.
			await expect(
				replaceOrganizationsInAuth0AppMetadata(
					userAuth0.user_id,
					organizations
				)
			).resolves.toBe(true);
			// Check if Auth0 database has the list of organizations in user app_metadata.
			// https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L997
			updatedUser = await getAuth0User(userAuth0.user_id);
			expect(updatedUser.app_metadata.organizations).toEqual(
				organizations
			);

			// Delete an organizations
			organizations.splice(0, 1);
			await expect(
				replaceOrganizationsInAuth0AppMetadata(
					userAuth0.user_id,
					organizations
				)
			).resolves.toBe(true);
			// Check if Auth0 database has updated list of organizations in user app_metadata.
			updatedUser = await getAuth0User(userAuth0.user_id);
			expect(updatedUser.app_metadata.organizations).toEqual(
				organizations
			);

			// User isn't on the Auth0 database.
			await expect(
				replaceOrganizationsInAuth0AppMetadata('user', organizations)
			).resolves.toBeNull();
		});

		it('should throw an error because arguments are wrong.', async () => {
			await expect(
				replaceOrganizationsInAuth0AppMetadata()
			).rejects.toBeTruthy();
			await expect(
				replaceOrganizationsInAuth0AppMetadata('string', null)
			).rejects.toBeTruthy();
			await expect(
				replaceOrganizationsInAuth0AppMetadata(null, [])
			).rejects.toBeTruthy();
		});
	});
});
