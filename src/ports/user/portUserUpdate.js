'use strict';

const { buildUser } = require('../../domains/user');
const logger = require('../../utils/logger')('p:user:update');

/**
 * Update one user.
 *
 * IMPORTANT: `roles` and `_faculties` arrays are replaced with the new ones.
 * @param {Object} param
 * @param {Object} param.usersDb Database adapter.
 * @param {function} param.isEqual
 * @param {function} param.cloneDeep
 * @param {function} param.merge
 * @return {updateUser(): void}
 */
module.exports = function makeUpdateUser({
	usersDb,
	isEqual,
	cloneDeep,
	merge
}) {
	if (
		typeof usersDb !== 'object' ||
		typeof isEqual !== 'function' ||
		typeof cloneDeep !== 'function' ||
		typeof merge !== 'function'
	)
		throw `makeUpdateUser - Some argument isn't supplied correctly.`;

	return updateUser;

	/**
	 * @async
	 * @param {Object} userChanges Changes to apply. Must to contain `_id`. It
	 * can't contain the organizations.
	 * @param {Object} [organizations=null] Organizations that has to be added
	 * (if they don't exist). updated with the new data or deleted.
	 * @param {string} organizations.action Can be: `put` or `delete`.
	 * @param {Object[]} organizations.organizations If action is `put`, then add or updated
	 * all organizations; else if `delete`, then delete all organizations.
	 * @return {?Object} User, else `null` if there's an error.
	 */
	async function updateUser({ _id, ...changes }, organizations = null) {
		logger.debug('Updating a user...');

		// Changes can't contain 'organizations', if we want to change
		// an organization, it has to be on the second argument.
		if (typeof _id !== 'string' || changes.hasOwnProperty('organizations'))
			throw `updateUser - First argument must contain user id or contain 'organizations'`;

		try {
			let existingUser, userWithChanges;

			existingUser = await usersDb.findById(_id);

			if (!existingUser) throw 'User not found.';

			// Update any value of the user, except for organizations.
			// Only update if `changes` is an empty object ({}, it means
			// there aren't any data to be updated), then we have to define
			// its type before using it on the spread syntax.
			if (Object.keys(changes).length > 0) {
				userWithChanges = merge(existingUser, changes);
				userWithChanges = buildUser(userWithChanges).getUser();
			}
			// Copy the user data to modify below.
			else userWithChanges = cloneDeep(existingUser);

			// Add/update/delete user organizations (if exist the argument).
			if (organizations) {
				organizations.organizations.forEach(org => {
					// Find in which position is the organization to be
					// added, updated or deleted.
					const index = userWithChanges.organizations.findIndex(
						({ type, _id }) => org.type === type && org._id === _id
					);

					switch (organizations.action) {
						// Add the new orgs or update orgs with the new ones.
						case 'put':
							// Clean duplicated roles.
							org.roles = [...new Set(org.roles)];

							// Add the organization if it doesn't exist.
							if (index === -1)
								userWithChanges.organizations.push(org);
							// Update the organization with the new data.
							else userWithChanges.organizations[index] = org;
							break;
						case 'delete':
							if (index === -1)
								throw `We can't delete organization=${JSON.stringify(
									org
								)} because we don't find it.`;

							userWithChanges.organizations.splice(index, 1);
							break;
						default:
							throw `Invalid action=${organizations.action}`;
					}
					// Validate the data.
					userWithChanges = buildUser(userWithChanges).getUser();
				});
			}

			// If there isn't any change, return the user.
			if (isEqual(existingUser, userWithChanges)) {
				logger.debug(
					`User hasn't changed because there aren't any changes.`
				);
				return existingUser;
			}

			// Update user in database.
			const userUpdated = await usersDb.updateOne(userWithChanges);
			logger.debug('User updated.', userUpdated);
			return userUpdated;
		} catch (err) {
			logger.error(err);
			return null;
		}
	}
};
