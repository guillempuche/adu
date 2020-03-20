'use strict';

const handler = require('../../../../../src/primaryAdapters/api/http/graphql/handler');

describe('pa:api:http:graphql:handler', () => {
	it('should export an object and the graphql function', () => {
		expect(typeof handler).toBe('object');
		expect(handler).toHaveProperty('graphql');

		expect(typeof handler.graphql).toBe('function');
		const graphqlRequest = handler.graphql;
		expect(typeof graphqlRequest).toBe('function');
	});

	it('should export an object and the graphql function', () => {
		expect(typeof handler).toBe('object');
		expect(handler).toHaveProperty('graphql');

		expect(typeof handler.graphql).toBe('function');
		const graphqlRequest = handler.graphql;
		expect(typeof graphqlRequest).toBe('function');
	});
});
