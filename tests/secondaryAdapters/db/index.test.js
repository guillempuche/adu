'use strict';

const { facultiesDb, usersDb } = require('../../../src/secondaryAdapters/db');

describe('sa:db:index', () => {
	it('should be the db environment set up', () => {
		expect(process.env.IS_TESTING).toBe('true');
	});

	it('index.js should export functions', () => {
		expect(typeof facultiesDb).toBe('object');
		expect(typeof usersDb).toBe('object');
	});
});
