'use strict';

// For GraphQL and Apollo Server
const {
	ADD_USER,
	SEND_INVITATION,
	VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER
} = require('./gql');
const { createTestClient } = require('apollo-server-testing');
const { createApolloServer } = require('./resolverUtils');

// Others adapters
const {
	sendEmail
} = require('../../../../secondaryAdapters/email/mockMailjet');

// Database
const {
	createAuth0User,
	deleteAuth0User,
	getAuth0User
} = require('../../../../secondaryAdapters/auth/auth0Utils');
const { addUser } = require('../../../../../src/ports/user');
const { addFaculty } = require('../../../../../src/ports/faculty');
const { clearDb } = require('../../../../secondaryAdapters/db/localDb');

// Utils
const { buildFakeUser, buildFakeFaculty } = require('../../../../utils/faker');
const nock = require('nock');

/**
 * IMPORTANT: For testing resolvers we have 2 paths:
 * - GraphQL Testing Server
 * - Resolvers Mutation object (in Resolvers file)
 *
 * The mutation functions can need user context.
 */
describe('pa:api:http:graphql:resolvers mutation', () => {
	let user, faculty, response, auth0User;

	afterAll(async () => {
		await clearDb();
	});

	describe('addUser', () => {
		beforeAll(async () => {
			// IMPORTANT: create user on Auth0 before add it on our database,
			// because after we will have to use the Auth0 user id.
			auth0User = await createAuth0User();
			user = await addUser(buildFakeUser({ auth0Id: auth0User.user_id }));

			// Faculty has to be the same as the faculty assigned to the
			// user (it's used in some tests).
			faculty = await addFaculty(buildFakeFaculty());
		});

		afterAll(async () => {
			await deleteAuth0User(user.auth0Id);
		});

		it('should add a user', async () => {
			response = await createTestClient(createApolloServer()).mutate({
				mutation: ADD_USER,
				variables: {
					input: {
						auth0Id: user.auth0Id,
						displayName: user.displayName,
						fullName: user.fullName,
						authEmail: user.emails.auth
					}
				}
			});
			expect(response.data.addUser.success).toBe(true);

			// Check if Auth0 database has updated list of organizations in user app_metadata.
			auth0User = await getAuth0User(user.auth0Id);
			expect(auth0User.app_metadata.organizations).toEqual(
				user.organizations
			);
		});

		it(`shouldn't add a user`, async () => {
			// Without input variables.
			response = await createTestClient(createApolloServer()).mutate({
				mutation: ADD_USER,
				variables: {}
			});
			expect(response.data).not.toBeTruthy();

			// displayName has to be a string.
			response = await createTestClient(createApolloServer()).mutate({
				mutation: ADD_USER,
				variables: {
					input: {
						displayName: null,
						fullName: user.fullName,
						authEmail: user.emails.auth,
						auth0Id: user.auth0Id
					}
				}
			});
			expect(response.data.addUser.success).toBeFalsy();

			// fullName has to be a string.
			response = await createTestClient(createApolloServer()).mutate({
				mutation: ADD_USER,
				variables: {
					input: {
						displayName: user.displayName,
						fullName: null,
						authEmail: user.emails.auth,
						auth0Id: user.auth0Id
					}
				}
			});
			expect(response.data.addUser.success).toBeFalsy();

			// authEmail has to be a string.
			response = await createTestClient(createApolloServer()).mutate({
				mutation: ADD_USER,
				variables: {
					input: {
						displayName: user.displayName,
						fullName: user.fullName,
						authEmail: null,
						auth0Id: user.auth0Id
					}
				}
			});
			expect(response.data.addUser.success).toBeFalsy();

			// auth0Id has to be a string.
			response = await createTestClient(createApolloServer()).mutate({
				mutation: ADD_USER,
				variables: {
					input: {
						displayName: user.displayName,
						fullName: user.fullName,
						authEmail: user.emails.auth,
						auth0Id: null
					}
				}
			});
			expect(response.data.addUser.success).toBeFalsy();
		});
	});

	describe('sendInvitation', () => {
		beforeAll(async () => {
			// Faculty has to be the same as the faculty assigned to the
			// user because it's used in some tests.
			faculty = await addFaculty(buildFakeFaculty());

			user = await addUser(
				buildFakeUser({
					organizations: [
						{
							type: 'faculty',
							_id: faculty._id,
							roles: ['agent']
						}
					]
				})
			);

			// Mock email provider.
			nock('https://api.mailjet.com')
				.post('/v3.1/send')
				.reply(200, sendEmail);
		});

		it('should send an invitation', async () => {
			/**
			 * Send invitation and save it to the list of invitations of the faculty.
			 *
			 * We use these variables:
			 * - faculty id has to be equal to the assigned faculties of the user
			 * who send the invitation.
			 * - email is the recipient of the invitation.
			 */
			response = await createTestClient(
				createApolloServer(
					{
						auth0Id: user.auth0Id,
						organizations: user.organizations
					},
					user.organizations[0]._id
				)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: user.emails.auth
				}
			});
			expect(response.data.sendInvitation.success).toBe(true);
		});

		it(`shouldn't send an invitation`, async () => {
			// Without user in context.
			response = await createTestClient(
				createApolloServer(null, user.organizations[0]._id)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: user.emails.auth
				}
			});
			expect(response.data.sendInvitation.success).toBe(false);

			// Wrong user id in context.
			response = await createTestClient(
				createApolloServer(
					{ auth0Id: undefined, organizations: user.organizations },
					user.organizations[0]._id
				)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: user.emails.auth
				}
			});
			expect(response.data.sendInvitation.success).toBe(false);

			// Without correct user organizations in context.
			response = await createTestClient(
				createApolloServer(
					{ auth0Id: user.auth0Id, organizations: [] },
					'id'
				)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: user.emails.auth
				}
			});
			expect(response.data.sendInvitation.success).toBe(false);

			// Unauthorized user roles (user who wants to send the invitation).
			response = await createTestClient(
				createApolloServer(
					{
						auth0Id: user.auth0Id,
						organizations: [
							{
								type: 'faculty',
								_id: 'id',
								roles: [
									'visitor',
									'faculty-admin',
									'superadmin',
									'user'
								]
							}
						]
					},
					'id'
				)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: user.emails.auth
				}
			});
			expect(response.data.sendInvitation.success).toBe(false);

			const validUserContext = {
				auth0Id: user.auth0Id,
				organizations: user.organizations
			};
			const validFaculyId = user.organizations[0]._id;

			// Wrong faculty that isn't in the use list of the assigned faculties.
			response = await createTestClient(
				createApolloServer(validUserContext, validFaculyId)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: 'facultyA',
					email: user.emails.auth
				}
			});
			expect(response.data.sendInvitation.success).toBe(false);
			// facultyId can't be null
			response = await createTestClient(
				createApolloServer(validUserContext, validFaculyId)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: null,
					email: 'test@email.com'
				}
			});
			expect(response.data).not.toBeTruthy();

			// Wrong email.
			response = await createTestClient(
				createApolloServer(validUserContext, validFaculyId)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: 'emailA@emailA.com'
				}
			});
			expect(response.data.sendInvitation.success).toBe(false);
			// Email can't be null
			response = await createTestClient(
				createApolloServer(validUserContext, validFaculyId)
			).mutate({
				mutation: SEND_INVITATION,
				variables: {
					facultyId: faculty._id,
					email: null
				}
			});
			expect(response.data).not.toBeTruthy();
		});
	});

	describe('validateInvitationAndLinkFacultyToUser', () => {
		let code, email;

		beforeAll(async () => {
			// The user is registered and is linked to 0 organizations.
			user = await addUser(
				buildFakeUser({
					auth0Id: undefined,
					organizations: []
				})
			);

			// Faculty has to be the same as the faculty assigned to the
			// user (it's used in some tests).
			faculty = buildFakeFaculty();
			faculty.invitations[0].roles = ['agent'];
			faculty = await addFaculty(faculty);
			({ code, email } = faculty.invitations[0]);
		});

		it('should validate an invitation and link faculty id to user', async () => {
			// To validate the invitation and assign the faculty id, the user has to be authenticated.
			response = await createTestClient(
				createApolloServer(user._id, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code,
						email
					}
				}
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.success
			).toBe(true);

			// Faculty has to be linked to the user.
			user.organizations.push({
				type: 'faculty',
				_id: faculty._id,
				roles: ['agent']
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.user
					.organizations
			).toEqual(user.organizations);

			// // Old user roles will be replaced with the new ones (extracted from an invitation).
			// expect(
			// 	response.data.validateInvitationAndLinkFacultyToUser.user.roles
			// ).toEqual(expect.arrayContaining(user.roles));
			// expect(
			// 	response.data.validateInvitationAndLinkFacultyToUser.user.roles
			// ).toEqual(expect.arrayContaining(user.roles));
		});

		it('should invalidate the invitation', async () => {
			// Without the context: user id.
			response = await createTestClient(createApolloServer()).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code,
						email
					}
				}
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.success
			).toBe(false);

			expect(response.data).not.toBeTruthy();
			// `facultyId` has to be a string.
			response = await createTestClient(
				createApolloServer(user._id, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code,
						email
					}
				}
			});
			expect(response.data).not.toBeTruthy();
			// Wrong faculty.
			response = await createTestClient(
				createApolloServer(user._id, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: 'facultyA',
						code,
						email
					}
				}
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.success
			).toBe(false);

			// code has to be a string.
			response = await createTestClient(
				createApolloServer(user._id, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code: null,
						email
					}
				}
			});
			expect(response.data).not.toBeTruthy();
			// Wrong code.
			response = await createTestClient(
				createApolloServer(user._id, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code: 'code',
						email
					}
				}
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.success
			).toBe(false);

			// email has to be a string.
			response = await createTestClient(
				createApolloServer(user._id, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code,
						email: null
					}
				}
			});
			expect(response.data).not.toBeTruthy();
			// Wrong email.
			response = await createTestClient(
				createApolloServer(null, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: faculty._id,
						code,
						email: 'test@email.com'
					}
				}
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.success
			).toBe(false);

			// Invalid when invitation is created later than 72h.
			const newFaculty = buildFakeFaculty({ _id: faculty._id });
			newFaculty.invitations[0].createdAt =
				Date.now() - 7 * 24 * 60 * 60 * 1000;
			await addFaculty(newFaculty);
			response = await createTestClient(
				createApolloServer(null, null)
			).mutate({
				mutation: VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER,
				variables: {
					invitation: {
						facultyId: newFaculty._id,
						code: newFaculty.invitations[0].code,
						email: newFaculty.invitations[0].email
					}
				}
			});
			expect(
				response.data.validateInvitationAndLinkFacultyToUser.success
			).toBe(false);
		});
	});
});
