'use strict';

const { buildFaculty } = require('../../domains/faculty');
const logger = require('../../utils/logger')('p:faculty:add');

/**
 * Add faculty.
 * @param {Object} param
 * @param {Object} param.facultiesDb Database adapter.
 * @return {addFaculty(): void}
 */
module.exports = function makeAddFaculty({ facultiesDb }) {
	if (!facultiesDb) throw `makeAddFaculty - facultiesDb isn't supplied.`;

	return addFaculty;

	/**
	 * @async
	 * @param {Object} facultyData
	 * @return {Object} Faculty (even if it isn't added). Returns `null` if there's an error.
	 */
	async function addFaculty(facultyData) {
		logger.debug('Adding the faculty...');

		if (typeof facultyData !== 'object')
			throw `addFaculty - facultyData isn't an object.`;

		try {
			const facultyToAdd = buildFaculty(facultyData);

			// 2 checkings to know if user exists.
			let facultyExists = await facultiesDb.findById(
				facultyToAdd.getId()
			);

			if (facultyExists) {
				logger.warn(
					`Faculty ${facultyExists._id} not added on database. It already exists.`
				);
				return facultyExists;
			}

			const faculty = await facultiesDb.insertOne(
				facultyToAdd.getFaculty()
			);
			logger.debug(`Faculty ${faculty._id} added on database.`);
			return faculty;
		} catch (err) {
			logger.error(err);
			return null;
		}
	}
};
