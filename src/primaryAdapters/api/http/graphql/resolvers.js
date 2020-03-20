'use strict';

// Ports
const { getUser, addUser, updateUser } = require('../../../../ports/user');
const {
	getFaculty,
	addFacultyInvitation
} = require('../../../../ports/faculty');

// Adapaters
const {
	areSomeRolesAllowed,
	replaceOrganizationsInAuth0AppMetadata
} = require('../../../../secondaryAdapters/auth');
const { sendInvitation } = require('../../../../secondaryAdapters/email');

// Utils
const logger = require('../../../../utils/logger')(
	'pa:api:http:graphql:resolvers'
);

module.exports = {
	Query: {
		/**
		 * Get user data of oneself with the authorization token that has user id.
		 * Allowed for: `user` & `agent`
		 */
		getMe: async (_, __, { context }) => {
			logger.debug('getUser called.');

			try {
				if (!context.user)
					throw `Context hasn't user object.`;

				// if (
				// 	!areSomeRolesAllowed(
				// 		['user', 'agent'],
				// 		context.user.organizations,
				// 		context.facultyId
				// 	)
				// )
				// 	throw 'Unauthorized';

				const auth0Id = context.user.auth0Id || undefined;
				if (!auth0Id)
					throw `getUser can't fetch user with auth0Id=${auth0Id}.`;

				const user = await getUser({ id: auth0Id });

				if (!user) throw `User not found`;

				return createResponse('User found', { user });
			} catch (err) {
				logger.warn(err);
				return createResponse('User not found', null, false, 409);
			}
		}
	},
	Mutation: {
		/**
		 * Add one user
		 *
		 * IMPORTANT:
		 * - Used in one Auth0 Rule.
		 * - Allowed for any user.
		 */
		addUser: async (
			_,
			{ input: { auth0Id, displayName, fullName, authEmail } }
		) => {
			logger.debug('addUser - Adding a user...');

			try {
				const user = await addUser({
					auth0Id,
					fullName,
					displayName,
					emails: { auth: authEmail }
				});

				if (!user) throw `addUser - User can't be added.`;

				const replacement = await replaceOrganizationsInAuth0AppMetadata(
					auth0Id,
					user.organizations
				);

				if (!replacement)
					throw `addUser - Error on replacing user organizations on Auth0 app_metadata.`;

				logger.info('User added.');
				return createResponse('User added', user);
			} catch (err) {
				logger.warn(err);
				return createResponse('User not added', null, false);
			}
		},
		/**
		 * Send invitation and save it to the list of invitations of the faculty.
		 *
		 * We use these variables:
		 * - `facultyId` (got it from the email) has to be equal to the assigned faculty of the user
		 * who send the invitation.
		 * - `email` is the recipient of the invitation.
		 *
		 * Allowed for: `agent`
		 */
		sendInvitation: async (_, { facultyId, email }, { context }) => {
			logger.debug('sendInvitation - Sending faculty invitation...');

			try {
				if (!context.user || typeof context.facultyId !== 'string')
					throw `Context hasn't user object or facultyId.`;

				if (
					!areSomeRolesAllowed(
						['agent'],
						context.user.organizations,
						context.facultyId
					)
				)
					throw 'Unauthorized';

				const auth0Id = context.user._auth0Id || undefined;
				if (!auth0Id)
					throw `sendInvitation hasn't user auth0Id=${auth0Id}.`;

				const user = await getUser({ id: auth0Id });
				if (!user) throw `sendInvitation - User isn't correct.`;
				else if (
					!user.organizations.some(
						({ type, _id }) =>
							type === 'faculty' && _id === facultyId
					)
				)
					throw `sendInvitation - Faculty ${facultyId} not found on list of user organizations (user ${id}).`;

				// Add invitation to faculty and send the invitation via
				// email (the recipient of the invitation).
				// IMPORTANT: This port adds the default role.
				const faculty = await addFacultyInvitation({
					_id: facultyId,
					email
				});

				if (!faculty) throw `Invitation not added.`;

				const { invitations } = faculty;
				logger.debug(
					`sendInvitation - Invitation added. ${JSON.stringify(
						invitations.length - 1
					)}`
				);
				const response = await sendInvitation({
					facultyId,
					// Get the code from the invitation that has been added.
					code: invitations[invitations.length - 1].code,
					nameSender: user.displayName,
					emailSender: user.emails.auth,
					emailReceiver: email
				});

				if (!response)
					throw `sendInvitation error on sending the email invitation.`;

				return createResponse('Invitation sent', null, true);
			} catch (err) {
				logger.warn(err);
				// 409: conflict
				return createResponse('Invitation not sent', null, false, 409);
			}
		},
		/**
		 * Validate invitation, then if it's valid, we link the faculty to
		 * the user valid and replace the old user roles with the roles from
		 * the faculty.
		 *
		 * IMPORTANT:
		 * - It has to be the same email, code, faculty id & invitation
		 * created maximum 72 hours before.
		 * - Allowed for any user.
		 */
		validateInvitationAndLinkFacultyToUser: async (
			_,
			{ invitation: { facultyId, code, email } },
			{ context }
		) => {
			logger.debug(
				'validateInvitationAndLinkFacultyToUser - Validating the invitation and linking faculty to user...'
			);

			try {
				const id = context.user._id || undefined;
				if (!id)
					throw `validateInvitationAndLinkFacultyToUser hasn't user id=${id}.`;

				const faculty = await getFaculty({ _id: facultyId });

				if (!faculty) throw `Faculty ${facultyId} doesn't exist`;

				// Find if invitation is valid according to: email, code and created
				// maximum 72 hours ago (72.01h not included).
				// IMPORTANT: if you change the limit, change it also in the invitation
				// email template.
				const invitationFound = faculty.invitations.find(
					item =>
						item.email === email &&
						item.code === code &&
						(Date.now() - item.createdAt) / (1000 * 60 * 60) <= 72
				);

				if (!invitationFound)
					throw `Invitation not valid. Email=${email} Code=${code}.`;

				// Update user roles & assign faculty id to the current list of user faculties.
				const { _faculties } = await getUser({ id });
				const userUpdated = await updateUser({
					_id: id,
					// Replace old roles with the new ones.
					roles: invitationFound.roles,
					// Add new faculty id to the list.
					_faculties: [..._faculties, facultyId]
				});

				if (!userUpdated) throw `Error on updating user ${id}`;

				return createResponse('Faculty assigned', {
					user: userUpdated
				});
			} catch (err) {
				logger.warn(err);
				// 406: not acceptable
				return createResponse('Invitation invalid', null, false, 406);
			}
		}
	},
	Response: {
		__resolveType() {
			return null;
		}
	}
};

/**
 * Create and get a standard response.
 * @param {string} message The explanation for either good and bad operations.
 * @param {?Object} [result] Can be an object with a key to used it in the return (ex: {user: ...}) or `null`.
 * @param {boolean} [success=true]
 * @param {number} [code=200] Http code.
 * @return {{success: boolean, message: string, code: string, any: *}}
 */
function createResponse(message, result, success = true, code = 200) {
	if (typeof message !== 'string') {
		logger.error('createResponse has to have a message.');
		throw 'createResponse has to have a message.';
	}

	// Default response
	let response = {
		// 400: Bad Request
		code: success ? code : 400,
		success: success || false,
		message
	};

	// Add result data (only if it exists) to the response.
	if (result) {
		// Create personalized result. Ex: response = {..., user: ...}
		const resultKey = Object.keys(result.valueOf())[0];
		response[resultKey] = result[resultKey];
	}

	logger.info('createResponse - ', response);
	return response;
}
