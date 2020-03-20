'use strict';

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logger = require('../../utils/logger')('sa:auth:authorization');

/**
 * Get user info from the token.
 */
function makeGetUserFromToken() {
	/**
	 * @async
	 * @param {string} token
	 * @return {?{auth0Id: string, organizations: Object[]}} Return user data, else return `null`
	 */
	const getUserFromToken = async token => {
		logger.debug(`Checking token...`);

		if (!token) {
			logger.warn(`Token is undefined.`);
			return null;
		}

		const tokenParts = token.split(' ');
		const tokenValue = tokenParts[1];

		if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
			logger.warn(`Token isn't a bearer token.`);
			return null;
		}

		const options = {
			audience: process.env.AUTH0_AUDIENCE_API_USER,
			issuer: process.env.AUTH0_ISSUER,
			algorithms: [process.env.AUTH0_ALGORITHM]
		};
		try {
			logger.debug('Getting signing keys...');

			// Get PEM encoded public key for RSA.
			// IMPORTANT: we can also use getSigningKey(). Ex: https://github.com/auth0-samples/jwt-rsa-aws-custom-authorizer/blob/master/lib.js
			const publicKey = await new Promise((resolve, reject) => {
				jwksClient({
					jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
					cache: true
				}).getSigningKeys((err, keys) => {
					if (err) {
						logger.warn('Error on getting the signing keys.', err);
						reject();
					}

					logger.debug('Signing keys received.');
					resolve(keys[0].publicKey || keys[0].rsaPublicKey);
				});
			});

			// Verifies secret and checks expiration, then return token data.
			return jwt.verify(
				tokenValue,
				publicKey,
				options,
				(err, decoded) => {
					if (err) throw Error(err);

					const auth0Id = decoded['sub'];
					const orgs = decoded[process.env.AUTH0_TOKEN_ORGANIZATIONS];

					const user = { auth0Id, organizations: orgs };

					logger.debug(`Verified token of user ${auth0Id}.`);
					return user;
				}
			);
		} catch (err) {
			logger.warn('Token is invalid. ', err);
			return null;
		}
	};
	return getUserFromToken;
}

/**
 * Check if at least one of user roles is allowed.
 * @param {function} param.validator It validates the roles.
 * @return {areSomeRolesAllowed(): void}
 */
function makeAreSomeRolesAllowed({ validator }) {
	if (typeof validator !== 'function') throw `Validator isn't supplied.`;

	/**
	 * @param {string[]} allowedRoles User roles that are allowed. Can be: `agent`, `faculty-admin` & `superadmin`.
	 * @param {Objects[]} userOrganizaitons User organizations.
	 * @param {string} facultyId Which user organization we have to retrieve the roles.
	 * @param {string[]} rolesToCheck User roles to be checked.
	 * @return {boolean} `True` if roles are allowed, else `false`.
	 */
	const areSomeRolesAllowed = (
		allowedRoles,
		userOrganizaitons,
		facultyId
	) => {
		const org = userOrganizaitons.find(
			({ type, _id }) => type === 'faculty' && _id === facultyId
		);

		// If faculty isn't found on list of user organizations, then we return false.
		if (!org) return false;

		try {
			if (!validator(allowedRoles) || !validator(org.roles)) return false;
		} catch (err) {
			return false;
		}

		// If at least one role to check exists on allowed roles array, then return true, else false.
		const areValid = org.roles.some(
			role => allowedRoles.indexOf(role) !== -1
		);

		logger.debug(
			`Some of these roles=${JSON.stringify(org.roles)} are allowed.`
		);
		return areValid;
	};
	return areSomeRolesAllowed;
}

module.exports = {
	makeGetUserFromToken,
	makeAreSomeRolesAllowed
};

/**
 * Check if token if valid, then create and return the policy.
 *
 * Documentation:
 * - https://github.com/auth0/node-jwks-rsa/blob/master/src/JwksClient.js
 * - https://github.com/serverless/examples/blob/master/aws-node-auth0-cognito-custom-authorizers-api/auth.js
 *
 * @param {string[]} [allowedRoles=[]] Roles that are allowed. They are extracted from the token.
 * @param {string} token
 * @param {string} resource Policy resource.
 * @return {?Object} Return policy document if the token is valid, else `null`.
 */
// async function checkTokenAndGetPolicy(allowedRoles = [], token, resource) {
// 	logger.debug(`Checking token...`);

// 	if (!token) {
// 		logger.debug(`Token is undefined.`);
// 		return null;
// 	}

// 	const tokenParts = token.split(' ');
// 	const tokenValue = tokenParts[1];

// 	if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
// 		logger.debug(`Token isn't a bearer token.`);
// 		return null;
// 	}

// 	const options = {
// 		audience: process.env.AUTH0_AUDIENCE_API_USER,
// 		issuer: process.env.AUTH0_ISSUER,
// 		algorithms: [process.env.AUTH0_ALGORITHM]
// 	};
// 	try {
// 		logger.debug('Getting signing keys...');

// 		// Get PEM encoded public key for RSA.
// 		// IMPORTANT: we can also use getSigningKey(). Ex: https://github.com/auth0-samples/jwt-rsa-aws-custom-authorizer/blob/master/lib.js
// 		const publicKey = await new Promise((resolve, reject) => {
// 			jwksClient({
// 				jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
// 				cache: true
// 			}).getSigningKeys((err, keys) => {
// 				if (err) {
// 					logger.debug('Error on getting the signing keys.', err);
// 					reject();
// 				}

// 				logger.debug('Signing keys received.');
// 				resolve(keys[0].publicKey || keys[0].rsaPublicKey);
// 			});
// 		});

// 		// Verifies secret and checks expiration, then return the policy.
// 		return jwt.verify(tokenValue, publicKey, options, (err, decoded) => {
// 			if (err) {
// 				throw new Error(err);
// 				// logger.debug('Token is invalid.', err);
// 				// return null;
// 			}

// 			// Check if token isn't allowed.
// 			const roles = decoded[process.env.AUTH0_TOKEN_ROLES];
// 			// If there isn't any 'allowed role' defined, then anyone have access.
// 			if (allowedRoles.length >= 1) {
// 				if (
// 					allowedRoles.some(role => roles.some(el => el === role)) ===
// 					false
// 				) {
// 					logger.debug(
// 						`Token (with roles ${JSON.stringify(
// 							roles
// 						)}) hasn't any allowed role (${JSON.stringify(
// 							allowedRoles
// 						)}).`,
// 						err
// 					);
// 					return null;
// 				}
// 			}
// 			logger.debug('Verified token.');
// 			return generatePolicy(decoded.sub, 'Allow', resource);
// 		});
// 	} catch (err) {
// 		logger.debug('Token is invalid.', err);
// 		return null;
// 	}
// }

/**
 * Policy generator.
 *
 * Examples: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
 */
// function generatePolicy(principalId, effect, resource) {
// 	logger.debug('Generating the policy...');

// 	const policy = {
// 		principalId
// 	};

// 	if (effect && resource) {
// 		const policyDocument = {};
// 		policyDocument.Version = '2012-10-17';
// 		policyDocument.Statement = [];
// 		policyDocument.Statement.push({
// 			Action: 'execute-api:Invoke',
// 			Effect: effect,
// 			Resource: resource
// 		});
// 		policy.policyDocument = policyDocument;
// 	}

// 	logger.debug('Policy generated.', policy);

// 	return policy;
// }
