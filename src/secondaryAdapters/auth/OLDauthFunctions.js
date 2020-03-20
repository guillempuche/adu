// /**
//  * Documentation:
//  * - https://serverless.com/framework/docs/providers/aws/events/apigateway/#http-endpoints-with-custom-authorizers
//  * - https://docs.aws.amazon.com/en_pv/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
//  * - https://docs.aws.amazon.com/apigateway/api-reference/resource/authorizer/#type
//  * - https://docs.aws.amazon.com/en_pv/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html
//  * - https://github.com/serverless/examples/blob/master/aws-node-auth0-cognito-custom-authorizers-api
//  * - https://github.com/serverless/examples/blob/master/aws-node-auth0-custom-authorizers-api
//  */
// 'use strict';

// const logger = require('../../utils/logger')('sa:auth:authorizers');
// const { checkTokenAndGetPolicy, generatePolicy } = require('./auth');

// /**
//  * Request-based Lambda authorizer function.
//  *
//  * Documentation:
//  * - Request authorizer info: https://docs.aws.amazon.com/apigateway/api-reference/resource/authorizer/#type
//  * - Create a request-based Lambda Authorizer function: https://docs.aws.amazon.com/en_pv/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
//  */
// module.exports.trusted = (event, context, cb) => {
//     logger.debug('Lambda authorizer Trusted is called.', { event });

//     const { Host } = event.headers;

//     if (
//         process.env.NODE_ENV !== 'production' &&
//         Host === 'guillemau-dev.ngrok.io'
//     ) {
//         logger.debug('Host is trusted in development.');
//         cb(null, generatePolicy('me', 'Allow', event.methodArn));
//     } else if (Host === 'guillemau-dev.ngrok.io') {
//         logger.debug('Host is trusted in production.');
//         cb(null, generatePolicy('me', 'Allow', event.methodArn));
//     } else {
//         logger.debug('Host is untrusted');
//         cb('Unauthorized');
//     }
// };

// /**
//  * Token-based Lambda authorizer function.
//  *
//  * Allowed roles: `agent`, `faculty-admin` & `superadmin`.
//  *
//  * Documentation:
//  * - https://docs.aws.amazon.com/en_pv/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
//  */
// module.exports.authenticated = (event, context, cb) => {
//     logger.debug('Lambda authorizer Authenticated is called.');

//     const policy = checkTokenAndGetPolicy(
//         ['agent', 'faculty-admin', 'superadmin'],
//         event.authorizationToken,
//         event.methodArn
//     );

//     if (!policy) return cb('Unauthorized');

//     return cb(null, policy);
// };

// /**
//  * Token-based Lambda authorizer function.
//  *
//  * Allowed roles: `faculty-admin` & `superadmin`.
//  *
//  * Documentation:
//  * - https://docs.aws.amazon.com/en_pv/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
//  */
// module.exports.authenticatedAdmins = (event, context, cb) => {
//     logger.debug('Lambda authorizer Authenticated Admins is called.');

//     const policy = checkTokenAndGetPolicy(
//         ['faculty-admin', 'superadmin'],
//         event.authorizationToken,
//         event.methodArn
//     );

//     if (!policy) return cb('Unauthorized');

//     return cb(null, policy);
// };

// /**
//  * Custom authorizer for unauthenticated users (ex: clients)
//  */
// module.exports.unauthenticated = (event, context, cb) => {
//     logger.debug('Unauthenticated function - event', event);
//     return cb();
//     // const policy = checkTokenAndGetPolicy(
//     //     event.authorizationToken,
//     //     event.methodArn
//     // );

//     // if (!policy) return cb('Unauthorized');

//     // return cb(null, policy);
// };
