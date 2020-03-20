'use strict';

const { ApolloServer } = require('apollo-server-lambda');
const schema = require('./schema');
const resolvers = require('./resolvers');
const { getUserFromToken } = require('../../../../secondaryAdapters/auth');
const logger = require('../../../../utils/logger')(
	'pa:api:http:graphql:handler'
);

const server = new ApolloServer({
	typeDefs: schema,
	resolvers,
	context: async ({ event, context }) => {
		if (event.headers) {
			if (event.headers.authorization)
				context.user = await getUserFromToken(
					event.headers.authorization
				);
			else if (event.headers.facultyId)
				context.facultyId = even.headers.facultyId;
		}

		const response = {
			headers: event.headers,
			functionName: context.functionName,
			event,
			// Context can contain:
			// `user`: id and organizations.
			// `facultyId`: faculty id which user is interacting on the website.
			context
		};

		logger.info('User context', { context });
		return response;
	},
	formatError: err => {
		logger.error(err);
		return err;
	}
});

exports.graphql = server.createHandler({
	cors: {
		origin: process.env.APP_URL
	}
});
