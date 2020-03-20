'use strict';

const {
	makeGetUserFromToken,
	makeAreSomeRolesAllowed
} = require('./authorization');
const {
	makeReplaceOrganizationsInAuth0AppMetadata
} = require('./auth0Adapter');
const { roles: validator } = require('../../utils/validator');

const getUserFromToken = makeGetUserFromToken();
const areSomeRolesAllowed = makeAreSomeRolesAllowed({ validator });
const replaceOrganizationsInAuth0AppMetadata = makeReplaceOrganizationsInAuth0AppMetadata(
	{
		// More about the API on:
		// https://auth0.com/docs/api/management/v2
		// https://github.com/auth0/node-auth0/blob/master/src/management/index.js
		auth0Management: require('./auth0provider').Management
	}
);

module.exports = {
	getUserFromToken,
	areSomeRolesAllowed,
	replaceOrganizationsInAuth0AppMetadata
};
