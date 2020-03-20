'use strict';

const logger = require('../../utils/logger')('p:user:get');

/**
 * Get user.
 * @param {Object} param
 * @param {Object} param.usersDb Database adapter.
 * @return {getUser(): void}
 */
module.exports = function makeGetUser({ usersDb }) {
	if (!usersDb) throw `makeGetUser - usersDb isn't supplied.`;

	return getUser;

	/**
	 * @async
	 * @param {Object} param
	 * @param {string} param.id Can be user id or user auth id.
	 * @return {?Object} User
	 */
	async function getUser({ id }) {
		logger.debug(`Getting user ${id}...`);

		if (typeof id !== 'string')
			throw `getUser - User id=${id} isn't supplied correctly.`;

		const user = await usersDb.findById(id);

		if (!user) return null;

		logger.debug('User found.');
		return user;
	}
};
