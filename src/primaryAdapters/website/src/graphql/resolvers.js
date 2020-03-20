import gql from 'graphql-tag';

export default {
	Query: {
		/**
		 * Save the user faculty id.
		 *
		 * IMPORTANT: it works well if user has only 1 organization.
		 */
		getFacultyId: (_, __, { cache }) => {
			console.log('Query getFacultyId...');
			// const GET_FACULTY_ID = gql`
			// 	query getFacultyId {
			// 		facultyId @client
			// 	}
			// `;
			// const { facultyId } = cache.readQuery({ query: GET_FACULTY_ID });
			const userOrgsQuery = gql`
				query getOrgs {
					getMe @client {
						organizations {
							_id
						}
					}
				}
			`;

			console.log('userOrgsQuery=' + JSON.stringify(userOrgsQuery));
			const facultyId = userOrgsQuery.organizations[0]._id;
			cache.writeQuery({
				data: {
					facultyId
				}
			});
			return facultyId;
		}
	},
	Mutation: {
		// setFacultyId: (_, __, { cache }) => {
		// 	const userOrgsQuery = gql`
		// 		query getOrgs {
		// 			getMe @client {
		// 				organizations
		// 			}
		// 		}
		// 	`;
		// 	const facultyId = userOrgsQuery.organizations[0]._id;
		// 	cache.writeQuery({
		// 		data: {
		// 			facultyId
		// 		}
		// 	});
		// 	return facultyId;
		// }
	}
};
