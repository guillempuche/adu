'use strict';

const Joi = require('@hapi/joi');

const facultySchema = Joi.object({
	_id: Joi.string().required(),
	name: Joi.string(),
	// Empty array or array with specific roles
	invitations: Joi.array().items(
		Joi.object().keys({
			code: Joi.string().required(),
			email: Joi.string()
				.email()
				.required(),
			// IMPORTANT: it's the same as in the file validateUser.js & validator.js on "utils" folder
			roles: Joi.array()
				.items(
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
				)
				.unique(),
			// UNIX epoch (UTC in milliseconds = 13-digits)
			createdAt: Joi.date()
				// This doesn't chech if it's a 13 digit number.
				.timestamp('javascript')
				.required()
		})
	)
});

module.exports = faculty => {
	const { error, value } = facultySchema.validate(faculty);

	if (error)
		throw `Error on validating faculty=${JSON.stringify(
			value
		)}. Error=${JSON.stringify(error.details)}.`;

	return null;
};
