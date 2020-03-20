const { gql } = require('apollo-server-lambda');

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

module.exports = { SEND_INVITATION };
