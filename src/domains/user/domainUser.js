'use strict';

const logger = require('../../utils/logger')('d:user');

/**
 * User domain
 * @param {Object} params Inject necessary dependencies
 * @return {buildUser(): void} User getter methods
 */
module.exports = function makeBuildUser({ Id, validator }) {
	/**
	 * Create user object.
	 * @param {Object} param
	 * @param {string} [param._id=*]
	 * @param {string} [param.auth0Id=undefined]
	 * @param {string} [param.name.displayName=undefined]
	 * @param {string} [param.name.fullName=undefined]
	 * @param {string} [param.emails.auth=undefined]
	 * @param {string} [param.emails.account=undefined]
	 * @param {string[]} [param.organizations=[]]
	 * @param {string} [param.profilePicture=undefined]
	 * @return {{getUser: function, getId: function,  getAuth0Id: function, getName: function, getEmails: function,getRoles: function, getOrganizations: function, getProfilePicture: function}}
	 */
	function buildUser(
		// If there isn't the object, we create it.
		{
			_id = Id(),
			auth0Id = undefined,
			displayName = undefined,
			fullName = undefined,
			emails: { auth = undefined, account = undefined } = {
				auth: undefined,
				account: undefined
			},
			organizations = [],
			profilePicture = undefined
		} = {
			_id: Id(),
			auth0Id: undefined,
			displayName: undefined,
			fullName: undefined,
			emails: {
				auth: undefined,
				account: undefined
			},
			organizations: [],
			profilePicture: undefined
		}
	) {
		try {
			const user = {
				_id,
				auth0Id,
				displayName,
				fullName,
				emails: { auth, account },
				// // If roles isn't an array or is an empty array, add the default role.
				// roles:
				// 	Array.isArray(roles) && roles.length > 0
				// 		? roles
				// 		: ['visitor'],
				organizations,
				profilePicture
			};

			// // Clean duplicated roles.
			// user.roles = [...new Set(user.roles)];

			// // Clean duplicated faculties.
			// user._faculties = [...new Set(user._faculties)];

			validator(user);

			// It's only allowed to read the user properties.
			return Object.freeze({
				getUser: () => user,
				getId: () => user._id,
				getAuth0Id: () => user.auth0Id,
				getDisplayName: () => user.displayName,
				getFullName: () => user.fullName,
				getEmails: () => user.emails,
				getProfilePicture: () => user.profilePicture,
				getOrganizations: () => user.organizations
			});
		} catch (err) {
			logger.error(`Unable to build the user object. ${err}`);
			throw `buildUser can't build user object`;
		}
	}

	return buildUser;
};
