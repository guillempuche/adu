/**
 * Operation for faculty database.
 * @module
 */
'use strict';

const logger = require('../../utils/logger')('sa:db:facultiesdb');

/**
 * Faculty MongoDB database operations.
 *
 * MongoDB docs:
 * - docs: https://docs.mongodb.com/manual/
 * - reference: http://mongodb.github.io/node-mongodb-native/3.3/reference
 * - API: https://mongodb.github.io/node-mongodb-native/3.3/api
 * @param {Object} param
 * @param {Function} param.makeDb Database connector.
 * @param {Function} param.operator Operator to use with the database.
 * @return {{findById: Function, updateOne: Function, insertOne: Function}}
 */
module.exports = function makeFacultiesDb({ makeDb, operator }) {
	if (!makeDb) throw `makeFacultiesDb - makeDb isn't supplied.`;

	return Object.freeze({
		findById,
		updateOne,
		insertOne
	});

	/**
	 * Find a faculty using an id.
	 * @async
	 * @param {string} id
	 * @return {?Object} Faculty
	 */
	async function findById(id) {
		logger.debug(`Finding faculty by id=${id}...`);

		try {
			if (typeof id !== 'string') throw `id=${id} must be a string.`;

			const db = await makeDb();
			const result = await db
				.collection('faculties')
				.findOne({ _id: id });

			if (!result) {
				logger.warn(`Faculty ${id} not found.`);
				return null;
			}
			logger.debug(`Faculty ${id} found.`);
			return result;
		} catch (err) {
			logger.error(`Faculty findById - ${JSON.stringify(err)}`);
			throw `Faculty findById - ${JSON.stringify(err)}`;
		}
	}

	/**
	 * Update one faculty.
	 * @async
	 * @param {Object} faculty
	 * @return {Object} Faculty updated.
	 */
	async function updateOne(faculty) {
		logger.debug('Updating a faculty.', faculty);

		const { _id, ...rest } = faculty;

		try {
			if (!operator) throw `Operator isn't supplied.`;

			const db = await makeDb();
			const result = await db
				.collection('faculties')
				.updateOne({ _id }, operator.flatten({ ...rest }));

			if (result.modifiedCount === 0) throw `Faculty not updated.`;

			logger.debug('Faculty updated.');
			return faculty;
		} catch (err) {
			logger.error(`Faculty updateOne - ${JSON.stringify(err)}`);
			throw `Faculty updateOne - ${JSON.stringify(err)}`;
		}
	}

	/**
	 * Insert one faculty (it must contains `_id`).
	 * @async
	 * @param {Object} faculty
	 * @return {Object} Faculty inserted.
	 */
	async function insertOne(faculty) {
		logger.debug('insertOne - Inserting one faculty...');

		try {
			if (typeof faculty !== 'object')
				throw `Faculty must be an object and it's type="${typeof faculty}".`;

			const db = await makeDb();
			await db.collection('faculties').insertOne(faculty);

			logger.debug('insertOne - Faculty inserted.', faculty);
			return faculty;
		} catch (err) {
			logger.error(`insertOne - ${JSON.stringify(err)}`);
			throw `Faculty insertOne - ${JSON.stringify(err)}`;
		}
	}
};
