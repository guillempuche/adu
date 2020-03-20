/**
 * Add invitation to the faculty.
 * @module
 */
'use strict';

const { buildFaculty } = require('../../domains/faculty');
const logger = require('../../utils/logger')('p:faculty:addinvitation');

/**
 * Add an invitation to one faculty.
 * @param {Object} param
 * @param {Object} param.facultiesDb Database adapter.
 * @param {function} param.Id Id generator.
 * @param {function} param.UtcNow Actual date.
 * @return {addFacultyInvitation(): void}
 */
module.exports = function makeAddFacultyInvitation({
	facultiesDb,
	Id,
	UtcNow
}) {
	if (!facultiesDb || !Id || !UtcNow)
		throw `makeGetFaculty - Some argument isn't supplied.`;

	/**
	 * @async
	 * @param {Object} param
	 * @param {string} param._id
	 * @param {string} param.email
	 * @param {string[]} [param.roles=["agent"]]
	 * @return {?Object} Faculty
	 */
	async function addFacultyInvitation({ _id, email, roles = ['agent'] }) {
		logger.debug(
			`Adding an invitation to the faculty ${_id} with email=${email} and roles=${JSON.stringify(
				roles
			)}.`
		);

		if (
			typeof _id !== 'string' ||
			typeof email !== 'string' ||
			!Array.isArray(roles)
		)
			throw `addFacultyInvitation - Faculty id=${_id}, email=${email} or roles=${JSON.stringify(
				roles
			)} are invalid.`;

		// If roles is an empty array, we add the default role.
		if (roles.length === 0) roles = ['agent'];

		try {
			let existingFaculty = await facultiesDb.findById(_id);

			if (!existingFaculty) throw `Faculty doesn't exist.`;

			// Create the invitation.
			const invitation = {
				code: Id().slice(0, 10),
				email,
				roles,
				createdAt: UtcNow()
			};
			// Create the faculty object with the new invitation.
			existingFaculty.invitations.push(invitation);
			const facultyWithChanges = buildFaculty(
				existingFaculty
			).getFaculty();
			const facultyUpdated = await facultiesDb.updateOne(
				facultyWithChanges
			);
			logger.debug(`Port has added an invitation to the faculty.`);
			return facultyUpdated;
		} catch (err) {
			logger.error(err);
			return null;
		}
	}

	return addFacultyInvitation;
};
