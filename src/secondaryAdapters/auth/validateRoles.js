'use strict';

const logger = require('../../utils/logger')('sa:auth:validateroles');
const Joi = require('@hapi/joi');

// IMPORTANT: roles names from user domain file "validateUser.js".
const rolesSchema = Joi.array().items(
	Joi.string()
		.valid(
			// With authentication
			'superadmin',
			// With authentication
			'faculty-admin',
			// With authentication
			'agent',
			// With authentication
			'user',
			// Without authentication, but with credentials (ex: _id, name...).
			'visitor'
		)
		.required()
);

/**
 * @param {string[]} roles Roles to validate.
 * @throws Will throw an error if validation is invalid.
 * @return {boolean} `True` if it's valid, else `false`.
 */
module.exports = roles => {
	const { error, value } = rolesSchema.validate(roles);

	if (error) {
		logger.error(
			`Error on validating roles=${JSON.stringify(
				roles
			)}. ${JSON.stringify(error.details)}. ${JSON.stringify(value)}.`
		);
		return false;
	}

	logger.debug(`Roles=${JSON.stringify(roles)} format validated.`);
	return true;
};
