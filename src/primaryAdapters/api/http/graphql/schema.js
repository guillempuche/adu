'use strict';

const { gql } = require('apollo-server-lambda');

// Construct a schema using GraphQL schema language
const schema = gql`
	schema {
		query: Query
		mutation: Mutation
	}

	type Query {
		"We use token of header authorization."
		getMe: ResponseUser!
		# getFaculty(input: InputGetFaculty!): ResponseGetFaculty!
	}

	type Mutation {
		addUser(input: InputUser!): ResponseUser!
		"Send email & save the invitation data on its faculty."
		sendInvitation(facultyId: ID!, email: String!): ResponseGeneral!
		validateInvitationAndLinkFacultyToUser(
			invitation: InputInvitation!
		): ResponseUser!
	}

	####################
	# INPUTS
	input InputUser {
		auth0Id: String
		displayName: String
		fullName: String
		authEmail: String
	}

	input InputInvitation {
		facultyId: ID!
		code: ID!
		email: String!
	}

	# RESPONSES
	# Recommended in https://www.apollographql.com/docs/apollo-server/schema/schema/#designing-mutations
	"Template to communicate the status to the client."
	interface Response {
		success: Boolean!
		message: String!
		code: String!
	}

	"General response"
	type ResponseGeneral implements Response {
		code: String!
		success: Boolean!
		message: String!
	}

	type ResponseUser implements Response {
		code: String!
		success: Boolean!
		message: String!
		user: User
	}

	####################
	# MUTATIONS
	# # Responses for mutation

	####################
	# TYPES

	# Type User
	type User {
		"Not required because mutation addUser doesn't need id."
		_id: ID
		auth0Id: ID
		displayName: String
		fullName: String
		emails: Emails
		profilePicture: String
		organizations: [Organization]
	}
	type Emails {
		auth: String
		account: String
	}

	type Organization {
		type: String
		_id: ID
		roles: [String]
	}

	# # Type Faculty
	# type Faculty {
	#     _id: ID!
	#     name: String
	#     invitations: [Invitation]
	# }
	# type Invitation {
	#     code: ID
	#     email: String
	#     createdAt: Float
	# }
`;

module.exports = schema;
