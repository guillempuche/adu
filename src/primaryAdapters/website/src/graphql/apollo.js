import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

import resolvers from './resolvers';

/**
 * Get Apollo Client.
 * @param {string} accessToken Aut0 access token.
 * @return {Object} Apollo Client
 */
function getApolloClient(accessToken = '') {
	// Set Apollo GraphQL Client header.
	const authorizationLink = setContext((_, { headers }) => {
		// Return the headers to the context, so httpLink can read them.
		return {
			headers: {
				...headers,
				authorization: accessToken ? `Bearer ${accessToken}` : ''
			}
		};
	});

	// Bundle Apollo Client options.
	const options = {
		// Apollo Link composition https://www.apollographql.com/docs/link/composition/
		link: ApolloLink.from([
			// https://www.apollographql.com/docs/link/links/error/
			onError(({ graphQLErrors, networkError }) => {
				if (graphQLErrors)
					graphQLErrors.forEach(({ message, locations, path }) =>
						console.log(
							`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
						)
					);
				if (networkError)
					console.error(`[Network error]: ${networkError}`);
			}),
			authorizationLink,
			new HttpLink({
				uri: '/graphql',
				// Tell to Apollo Client that the server has the same domain.
				credentials: 'same-origin'
			})
		]),
		cache: new InMemoryCache(),
		resolvers,
		connectToDevTools: true
	};

	// Initialize the Apollo local state.
	// https://www.apollographql.com/docs/react/data/local-state/#initializing-the-cache
	options.cache.writeData({
		data: {
			// Faculty where user is interacting
			facultyId: undefined,
			errors: {
				// If there's an error on the web, we put the error explanation.
				generalError: null
			}
		}
	});

	// https://www.apollographql.com/docs/react/api/apollo-client/
	return new ApolloClient(options);
}

export default getApolloClient;
