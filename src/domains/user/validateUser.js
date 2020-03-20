'use strict';

const Joi = require('@hapi/joi');

const userSchema = Joi.object({
	_id: Joi.string().required(),
	auth0Id: Joi.string(),
	displayName: Joi.string(),
	fullName: Joi.string(),
	emails: Joi.object().keys({
		auth: Joi.string().email(),
		account: Joi.string().email()
	}),
	profilePicture: Joi.string().uri(),
	organizations: Joi.array().items(
		Joi.object().keys({
			type: Joi.string()
				.valid('faculty')
				.required(),
			// faculty _id or university id.
			_id: Joi.string().required(),
			// IMPORTANT: it's the same as in the file validateFaculty.js & validator.js on "utils" folder
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
				.unique()
				.required()
		})
	)
});

module.exports = user => {
	const { error, value } = userSchema.validate(user);

	if (error)
		throw `Error on validating user=${JSON.stringify(
			value
		)}. Error=${JSON.stringify(error.details)}.`;

	return null;
};
