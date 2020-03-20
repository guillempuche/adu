'use strict';

const logger = require('../../utils/logger')('p:user:add');
const { buildUser } = require('../../domains/user');

/**
 * Add user.
 * @param {Object} param
 * @param {Object} param.usersDb Database adapter.
 * @return {addUser(): void}
 */
module.exports = function makeAddUser({ usersDb }) {
	if (typeof usersDb !== 'object')
		throw `makeAddUser - usersDb isn't supplied.`;

	return addUser;

	/**
	 * @async
	 * @param {Object} userData
	 * @return {Object} User (even if it isn't added). Returns `null` if there's an error.
	 */
	async function addUser(userData) {
		logger.debug('Adding user...');

		if (typeof userData !== 'object')
			throw `addUser - userData isn't supplied correctly.`;

		try {
			const userToAdd = buildUser(userData);

			// 2 checkings to know if user exists.
			let userExists = await usersDb.findById(userToAdd.getAuth0Id());
			if (!userExists) {
				logger.debug(
					`User with auth id ${userToAdd.getAuth0Id()} not found. Now, find by user id ${userToAdd.getId()}`
				);
				userExists = await usersDb.findById(userToAdd.getId());
			} else {
				logger.warn(
					`User ${userExists._id} not added on database. He already exists.`
				);
				return userExists;
			}

			// // Some users are in Auth0 database (when the user sign up using Auth0
			// // he is registered there before on our custom database), then we have
			// // to add the user roles on Auth0 database.
			// // IMPORTANT: it has to be before adding user on our custom database, because if
			// // there's some error on Auth0, we prevent to add it on the custom database.
			// const result = await replaceAuth0Roles(
			// 	userToAdd.getAuth0Id(),
			// 	userToAdd.getRoles()
			// );
			// if (result === false) throw `Can't add user roles on Auth0.`;

			const user = await usersDb.insertOne(userToAdd.getUser());

			logger.debug(`User ${user._id} added on database.`);
			return user;
		} catch (err) {
			logger.error(err);
			return null;
		}
	}
};
