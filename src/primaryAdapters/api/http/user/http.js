'use strict';

const logger = require('../../../../utils/logger')('pa:api:http:user');

module.exports.public = (event, context, callback) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: `Public API Allowed`,
			event
		})
	};

	callback(null, response);
};

module.exports.private = (event, context, cb) =>
	cb(null, {
		message: 'Private API',
		event
	});

module.exports.privateAdmins = (event, context, cb) =>
	cb(null, {
		message: 'Private API for Admins',
		event
	});

module.exports.guest = (event, context, callback) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: `Guest API`,
			event
		})
	};

	callback(null, response);
};

const { addUser } = require('../../../../ports/user');

module.exports.createUser = async event => {
	logger.debug('Lambda createUser called.');

	try {
		const user = await addUser(JSON.parse(event.body));
		logger.debug('User created.', user);

		if (!user) throw new Error();

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `User created`,
				user
			})
		};
	} catch (err) {
		logger.error('Error on creating the user', err);
		return {
			statusCode: 500,
			body: 'Error on creating the user.'
		};
	}
};
