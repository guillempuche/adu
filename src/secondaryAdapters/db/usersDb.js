'use strict';

const logger = require('../../utils/logger')('sa:db:usersdb');

/**
 * Faculty MongoDB database operations.
 *
 * MongoDB docs:
 *  - docs: https://docs.mongodb.com/manual/
 *  - reference: http://mongodb.github.io/node-mongodb-native/3.3/reference
 *  - API: https://mongodb.github.io/node-mongodb-native/3.3/api
 * @param {Object} param
 * @param {Function} param.makeDb Database connector.
 * @param {Function} param.operator Operator to use with the database.
 * @return {{findById: Function, updateOne: Function, insertOne: Function}}
 */
module.exports = function makeUsersDb({ makeDb, operator }) {
	if (!makeDb) throw `makeUsersDb - makeDb isn't supplied.`;

	return Object.freeze({
		findById,
		insertOne,
		updateOne
		// findByFacultyId,
	});

	/**
	 * Find a user according to an id.
	 * @async
	 * @param {string} id
	 * @return {?Object} User
	 */
	async function findById(id) {
		logger.debug(`findById - Finding user with id=${id}...`);

		try {
			if (typeof id !== 'string') throw `id=${id} must be a string.`;

			// We check the user on its "_id" or/and auth id.
			const db = await makeDb();
			let result = await db.collection('users').findOne({ _id: id });

			if (!result) {
				result = await db.collection('users').findOne({ auth0Id: id });

				if (!result) {
					logger.warn(`findById - User ${id} not found.`);
					return null;
				}
			}
			logger.debug(`findById - User ${id} found.`);
			return result;
		} catch (err) {
			logger.error(`findById -`, err);
			throw `User findById - ${JSON.stringify(err)}`;
		}
	}

	/**
	 * Insert one user (it must contains `_id`).
	 * @async
	 * @param {Object} user
	 * @return {Object} User inserted.
	 */
	async function insertOne(user) {
		logger.debug('insertOne - Inserting one user...');

		try {
			if (typeof user !== 'object')
				throw `User must be an object and it's type="${typeof user}".`;

			const db = await makeDb();
			await db.collection('users').insertOne(user);

			logger.debug('insertOne - User inserted.', user);
			return user;
		} catch (err) {
			logger.error(`insertOne -`, err);
			throw `User insertOne - ${JSON.stringify(err)}`;
		}
	}

	/**
	 * Update one user.
	 * @async
	 * @param {Object} user
	 * @return {Object} User updated.
	 */
	async function updateOne(user) {
		logger.debug('updateOne - Updating a user...', user);

		const { _id, ...rest } = user;

		try {
			if (!operator) throw `Operator isn't supplied.`;

			const db = await makeDb();
			const result = await db
				.collection('users')
				.updateOne({ _id }, operator.flatten({ ...rest }));

			if (result.modifiedCount === 0) throw `User not updated.`;

			logger.debug('updateOne - User updated.');
			return user;
		} catch (err) {
			logger.error(`updateOne -`, err);
			throw `User updateOne - ${JSON.stringify(err)}`;
		}
	}

	// /**
	//  * Find all users linked with an specific faculty.
	//  * @param {string} id
	//  * @return {?Array} List of users.
	//  */
	// async function findByFacultyId(id) {
	//     logger.debug('Finding faculty user with id...');

	//     if (!id) throw new Error(`Faculty id must be supplied.`);

	//     const db = await makeDb();
	//     const result = await db
	//         .collection('users')
	//         .find({ _faculties: createObjectId(id) });
	//     const found = await result.toArray();

	//     if (found.length === 0) {
	//         logger.debug('Faculty not found.');
	//         return null;
	//     }

	//     logger.debug('Faculty found.');
	//     return found;
	// }
};
