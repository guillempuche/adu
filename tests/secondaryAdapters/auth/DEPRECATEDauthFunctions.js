/**
 * Documentation for input event of API Gateway Lambda authorizer:
 * https://docs.aws.amazon.com/en_pv/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
 */
'use strict';

const mod = require('../../../src/secondaryAdapters/auth/authFunctions');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrappedAuthenticated = lambdaWrapper.wrap(mod, {
	handler: 'authenticated'
});
const axios = require('axios');

describe('deprecated', async () => {
	let accessToken;

	beforeAll(async () => {
		try {
			const { data } = await axios.post(
				`https://${process.env.AUTH0_DOMAIN}/oauth/token`,
				{
					client_id: process.env.AUTH0_CLIENT_ID_APIGATEWAY,
					client_secret: process.env.AUTH0_CLIENT_SECRET_APIGATEWAY,
					audience: process.env.AUTH0_AUDIENCE_API_USER,
					grant_type: 'client_credentials'
				}
			);

			({ access_token: accessToken } = data);
		} catch (err) {
			console.error(err);
		}
	});

	it('should allow access', async () => {
		try {
			const data = await wrappedAuthenticated.run({
				type: 'TOKEN',
				authorizationToken: `Bearer ${accessToken}`,
				methodArn:
					'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/*'
			});

			expect(data).toHaveProperty('principalId');
			expect(data).toHaveProperty('policyDocument');
			data.policyDocument.Statement.forEach(statement => {
				expect(statement.Effect).toBe('Allow');
			});
		} catch (err) {
			console.error(err);
		}
	});
	it('should deny the access', async () => {
		try {
			const data = await wrappedAuthenticated.run({
				type: 'TOKEN',
				authorizationToken: `Bearer 1234`,
				methodArn:
					'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/*'
			});

			expect(data).toBe(null);
		} catch (err) {
			console.error(err);
		}
	});
});
