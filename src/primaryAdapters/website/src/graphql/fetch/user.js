import gql from 'graphql-tag';

// // ================================================
// //          FRAGMENTS
// // ================================================
// const Fragments = {
//     user: gql`
//         fragment User on Question {
//             _id
//             public
//             categories
//             question_enUS
//             question_esES
//             question_ca
//             metadata {
//                 enabled
//             }
//         }
//     `
// };

// ================================================
//          QUERIES
// ================================================
const GET_ME = gql`
	query getUser {
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

const GET_FACULTY_ID = gql`
	query getFacultyId {
		facultyId @client
	}
`;

// ================================================
//          MUTATIONS
// ================================================
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

export {
	// Queries
	GET_ME,
	GET_FACULTY_ID,
	// Mutations
	VALIDATE_INVITATION_AND_LINK_FACULTY_TO_USER
};
