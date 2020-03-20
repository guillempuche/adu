const { gql } = require('apollo-server-lambda');

// ================================================
//          QUERIES
// ================================================
const GET_ME = gql`
	query getMe {
		getMe {
			code
			success
			message
			user {
				_id
				auth0Id
				displayName
				fullName
				emails {
					auth
					account
				}
				organizations {
					type
					_id
					roles
				}
				profilePicture
			}
		}
	}
`;

// ================================================
//          MUTATIONS
// ================================================
const ADD_USER = gql`
	mutation addUser($input: InputUser!) {
		addUser(input: $input) {
			code
			success
			message
			user {
				_id
				auth0Id
				displayName
				fullName
				emails {
					auth
					account
				}
				organizations {
					type
					_id
					roles
				}
				profilePicture
			}
		}
	}
`;

const VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER = gql`
	mutation validateInvitationAndLinkFacultyToUser(
		$invitation: InputInvitation!
	) {
		validateInvitationAndLinkFacultyToUser(invitation: $invitation) {
			success
			message
			code
			user {
				_id
				auth0Id
				displayName
				fullName
				emails {
					auth
					account
				}
				organizations {
					type
					_id
					roles
				}
				profilePicture
			}
		}
	}
`;

module.exports = {
	GET_ME,
	ADD_USER,
	VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER
};
