'use strict';

const logger = require('../../utils/logger')('sa:auth:auth0adapter');

/**
 * Replace all organizations for user (in Auth0) with the updated list of organizations.
 * @param {Object} param.auth0Management Auth0 Management SDK. If we are testing, it will be a mocked SDK.
 * @return {replaceOrganizationsInAuth0AppMetadata(): void}
 */
function makeReplaceOrganizationsInAuth0AppMetadata({ auth0Management }) {
	if (typeof auth0Management !== 'object')
		throw `auth0Management isn't supplied correctly.`;

	/**
	 * @async
	 * @param {string} userAuth0Id Auth0 user id.
	 * @param {Object[]} organizations List of organizations that will
	 * replace the old user organizations in Auth0. IMPORTANT: Data has
	 * already to be validated.
	 * @return {?boolean} `True` if the replacement has been successful, else `false`.
	 * If user isn't on Auth0 database, we return `null`.
	 */
	async function replaceOrganizationsInAuth0AppMetadata(
		userAuth0Id,
		organizations
	) {
		logger.debug(
			`Replacing organization from Auth0 user "${userAuth0Id}" with new orgs...`
		);

		if (
			typeof userAuth0Id !== 'string' ||
			Array.isArray(organizations) === false
		) {
			throw `Wrong arguments. userAuth0Id=${userAuth0Id}, organizations=${JSON.stringify(
				organizations
			)}`;
		}

		try {
			// Check if user exists.
			try {
				// https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L997
				// https://github.com/auth0/node-auth0/blob/master/src/management/UsersManager.js#L252
				await auth0Management.getUser({ id: userAuth0Id });
			} catch (err) {
				logger.debug(
					`User with auth0Id ${userAuth0Id} isn't in Auth0 database.`
				);
				return null;
			}

			// Update app metada for a user
			// IMPORTANT: data of organizations has to be validated before
			// pass to the adapter.
			// https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L1152
			await auth0Management.updateAppMetadata(
				{ id: userAuth0Id },
				{ organizations }
			);

			// // Get list of all roles in Auth0.
			// // https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L2694
			// const rolesOnManagement = await auth0Management.getRoles();

			// // Get roles auth0 id for each role to assign.
			// const rolesOnManagementFiltered = rolesOnManagement.filter(
			// 	({ name }) => (roles.some(role => role === name) ? true : false)
			// );
			// const rolesIds = rolesOnManagementFiltered.map(({ id }) => id);

			// // https://github.com/auth0/node-auth0/blob/master/src/management/index.js#L1360
			// // https://github.com/auth0/node-auth0/blob/master/src/management/UsersManager.js#L1360
			// await auth0Management.assignRolestoUser(
			// 	{ id: userAuth0Id },
			// 	{ roles: rolesIds }
			// );

			logger.debug('Organizations have been replaced in Auth0.');
			return true;
		} catch (err) {
			logger.error(err);
			return false;
		}
	}

	return replaceOrganizationsInAuth0AppMetadata;
}

module.exports = {
	makeReplaceOrganizationsInAuth0AppMetadata
};
