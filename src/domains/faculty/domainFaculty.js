'use strict';

const logger = require('../../utils/logger')('d:faculty');

/**
 * Faculty domain
 * @param {Object} params Inject necessary dependencies
 * @param {function} params.Id Id generator
 * @param {function} params.validator Faculty data validator.
 * @return {buildFaculty(): void} Faculty get methods
 */
module.exports = function makeBuildFaculty({ Id, validator }) {
	/**
	 * @param {Object} param
	 * @param {string} [param._id=*]
	 * @param {string} [param.name=undefined]
	 * @param {[{code: string, email: string, roles: string[], createdAt: number}]} [param.invitations=[]]
	 * @return {{getFaculty: function, getId: function, getName: function, getInvitations: function}}
	 */
	function buildFaculty(
		// If there isn't the object, we create it.
		{ _id = Id(), name = undefined, invitations = [] } = {
			_id: Id(),
			name: undefined,
			invitations: []
		}
	) {
		try {
			const faculty = {
				_id,
				name,
				invitations
			};

			// Clean duplicated roles in each invitation.
			faculty.invitations = faculty.invitations.map(invitation => {
				invitation.roles = [...new Set(invitation.roles)];
				return invitation;
			});

			// Validator adds the default role for every new invitation if
			// we don't provide the invitation with a role.
			validator(faculty);

			// It's only allowed to read the faculty properties.
			return Object.freeze({
				getFaculty: () => faculty,
				getId: () => faculty._id,
				getName: () => faculty.name,
				getInvitations: () => faculty.invitations
			});
		} catch (err) {
			logger.error(`Unable to build the faculty object. ${err}`);
			throw `buildFaculty can't build faculty object.`;
		}
	}

	return buildFaculty;
};
