import ROUTES from './routes';
import Joi from '@hapi/joi';

/**
 * Check if the actual browser user is a client or not (it's a faculty's user)
 */
const isClientURL = () => {
	if (window.location.pathname === ROUTES.chatClient.path) return true;

	return false;
};

/**
 * Validate roles format
 *
 * IMPORTANT: roles names validation is also on backend.
 * @param {string[]} roles Roles to validate.
 * @return {?string[]} If they are valid, return the roles, else `null`.
 */
const rolesFormatValidator = roles => {
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
	const { error, value } = rolesSchema.validate(roles);

	if (error) {
		console.error(
			`Error on validating roles=${JSON.stringify(
				roles
			)}. ${JSON.stringify(error.details)}. ${JSON.stringify(value)}.`
		);
		return null;
	}

	return value;
};

/**
 * If some role exist in the list of allowed roles, then the user is allowed.
 * @param {string[]} allowedRoles User roles that are allowed. Can be: `agent`, `faculty-admin` & `superadmin`.
 * @param {string[]} userRoles User roles to be checked.
 * @return {boolean} `True` if roles are allowed, else `false`.
 */
const areSomeRolesAllowed = (allowedRoles, userRoles) => {
	// If at least one role to check exists on allowed roles array, then return true, else false.
	return userRoles.some(role => allowedRoles.indexOf(role) !== -1);
};

export { isClientURL, rolesFormatValidator, areSomeRolesAllowed };
