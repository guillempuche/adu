'use strict';

const mod = require('../../../../../src/primaryAdapters/api/http/user/http');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrappedCreateUser = lambdaWrapper.wrap(mod, { handler: 'createUser' });

describe('API HTTP for user', () => {
	beforeAll(done => {
		//  lambdaWrapper.init(liveFunction); // Run the deployed lambda

		done();
	});

	it('should create user', () => {
		const body =
			'{"name":{"displayName":"user1"},"emails":{"auth":"user1@foo.com"},"roles":["agent"],"auth":{"auth0Id":"abc123"}}';
		return wrappedCreateUser.run({ body }).then(response => {
			console.log('Response', response);
			expect(JSON.parse(response.body).user).toMatchObject(
				JSON.parse(body)
			);
		});
	});
});
