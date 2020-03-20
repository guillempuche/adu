'use strict';

const validator = require('../../src/utils/validator');

describe('u:validator', () => {
	it('should exports an object', () => {
		expect(typeof validator).toBe('object');
		expect(validator).toHaveProperty('roles');
	});
	it('should validate correctly an array roles', () => {
		const { roles } = validator;
		expect(typeof roles).toBe('function');
		expect(roles(['agent'])).toBe(true);
		expect(roles(['aaa'])).toBe(false);
	});
});
