const schema = require('../../../../../src/primaryAdapters/api/http/graphql/schema');
const resolvers = require('../../../../../src/primaryAdapters/api/http/graphql/resolvers');
const logger = require('../../../../../src/utils/logger')(
	'pa:graphql:resolverutils'
);

// To create Apollo Server test
const { ApolloServerBase } = require('apollo-server-core');

module.exports = {
	/**
	 * Create an Apollo Server with user context.
	 *
	 * More on Graphql Server handler.js.
	 *
	 * @param {Object} [user] User
	 * @param {string} [facultyId] Faculty id which user is interacting on the website.
	 * @return {{query: function, mutation: function}} Server methods.
	 */
	createApolloServer: (user, facultyId) => {
		return new ApolloServerBase({
			typeDefs: schema,
			resolvers,
			context: () => {
				const context = {
					context: {
						user,
						facultyId
					}
				};
				logger.debug('Context', { context: context.context });
				return context;
			},
			formatError: err => {
				logger.error(err);
				return err;
			}
		});
	}
};
