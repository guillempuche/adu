import gql from 'graphql-tag';

// ================================================
//          MUTATIONS
// ================================================
const SEND_INVITATION = gql`
	mutation sendInvitation($facultyId: ID!, $email: String!) {
		sendInvitation(facultyId: $facultyId, email: $email) {
			code
			success
			message
		}
	}
`;

const IS_INVITATION_VALID = gql`
	query isInvitationValid($invitation: InputInvitation!) {
		isInvitationValid(invitation: $invitation) {
			code
			success
			message
		}
	}
`;

export { SEND_INVITATION, IS_INVITATION_VALID };
