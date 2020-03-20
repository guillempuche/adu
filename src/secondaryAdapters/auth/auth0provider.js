'use strict';

const { ManagementClient } = require('auth0');

module.exports = {
	Management: new ManagementClient({
		domain: process.env.AUTH0_DOMAIN,
		clientId: process.env.AUTH0_CLIENT_ID_USERAPI,
		clientSecret: process.env.AUTH0_CLIENT_SECRET_USERAPI,
		scope: 'read:users read:user_idp_tokens read:roles update:users'
	})
};
