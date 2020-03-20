/**
 * Get faculty.
 * @module
 */
'use strict';

const logger = require('../../utils/logger')('p:faculty:get');

/**
 * Get one faculty.
 * @param {Object} param
 * @param {Object} param.facultiesDb Database adapter.
 * @return {getFaculty(): void}
 */
module.exports = function makeGetFaculty({ facultiesDb }) {
	if (!facultiesDb) throw `makeGetFaculty - facultiesDb isn't supplied.`;

	return getFaculty;

	/**
	 * @async
	 * @param {Object} param
	 * @param {string} param._id
	 * @return {?Object} Faculty
	 */
	async function getFaculty({ _id }) {
		// throw new Error('test');
		logger.debug(`Getting the faculty ${_id}...`);

		if (typeof _id !== 'string')
			throw `getFaculty - Faculty id=${_id} isn't a string.`;

		try {
			const faculty = await facultiesDb.findById(_id);

			if (!faculty) return null;

			logger.debug('Faculty found.');
			return faculty;
		} catch (err) {
			logger.error(err);
			return null;
		}
	}
};
