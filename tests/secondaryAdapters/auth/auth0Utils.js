'use strict';

const { ManagementClient } = require('auth0');
const { buildFakeUser } = require('../../utils/faker');
const _ = require('lodash');

// Instance of Auth0 Management SDK.
const auth0Management = new ManagementClient({
	domain: process.env.AUTH0_DOMAIN,
	// Auth0 User API
	clientId: process.env.AUTH0_CLIENT_ID_USERAPI,
	clientSecret: process.env.AUTH0_CLIENT_SECRET_USERAPI,
	scope:
		'create:users delete:users read:users read:user_idp_tokens read:roles update:users'
});

/**
 * Connect to Auth0 Management SDK.
 * @return {Object} Return Auth0 Management instances.
 */
module.exports.auth0Management = auth0Management;

/**
 * Create user in Auth0 database.
 *
 * IMPORTANT: after create Auth0, Management returns `user_id`=`auth0|...`
 * @param {Object} [overrides] Override some data to the user.
 * @return {Object} Auth0 user object.
 */
module.exports.createAuth0User = async overrides => {
	const fakeUser = buildFakeUser();

	let userAuth0 = {
		connection: process.env.AUTH0_DB_DEVELOPMENT,
		email: fakeUser.emails.auth,
		blocked: false,
		email_verified: false,
		given_name: 'Test',
		family_name: 'Test',
		name: 'Test Test',
		nickname: 'Testing',
		picture:
			'https://secure.gravatar.com/avatar/15626c5e0c749cb912f9d1ad48dba440?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png',
		user_id: 'test-' + fakeUser.auth0Id,
		password: 'Asdfs-f951',
		verify_email: false,
		user_metadata: {},
		app_metadata: {}
	};

	userAuth0 = _.merge(userAuth0, overrides);

	// Create a test user in Auth0.
	// More info:
	// https://auth0.com/docs/api/management/v2/#!/Users/post_users
	// https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L1065
	// https://github.com/auth0/node-auth0/blob/master/src/management/UsersManager.js#L170
	await auth0Management.createUser(userAuth0);
	// Auth0 add automatically on its database 'auth0' to the user_id, then we have to make the changes on our local user.
	userAuth0.user_id = 'auth0|' + userAuth0.user_id;

	return userAuth0;
};

/**
 * Get user from Auth0 database.
 * @param {string} id Auth0 user id.
 * @return {Object} User from Auth0.
 */
module.exports.getAuth0User = async id => {
	return await auth0Management.getUser({
		id
	});
};

/**
 * Delete user in Auth0.
 * @param {string} id Auth0 user id.
 */
module.exports.deleteAuth0User = async id => {
	// More info:
	// https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L1043
	// https://auth0.com/docs/api/management/v2/#!/Users/delete_users_by_id
	// https://github.com/auth0/node-auth0/blob/master/src/management/UsersManager.js#L387
	await auth0Management.deleteUser({ id });
};
