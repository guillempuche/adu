'use strict';

const logger = require('../../src/utils/logger');

describe('u:logger', () => {
	it('should exports the logger function', () => {
		expect(typeof logger).toBe('function');
	});

	it('should exports the logger function', () => {
		const logger = require('../../src/utils/logger')('test:util:logger');
		expect(logger).toHaveProperty('error');
		expect(logger).toHaveProperty('warn');
		expect(logger).toHaveProperty('info');
		expect(logger).toHaveProperty('debug');
	});
});
