// testPathIgnorePatterns: [
// 	'<rootDir>/node_modules',
// 	'<rootDir>/src/primaryAdapters/website',
// 	'<rootDir>/backend',
// 	'<rootDir>/client'
// ],
module.exports = {
	testMatch: [
		'<rootDir>/tests/**/*.test.js',
		'!<rootDir>/src/primaryAdapters/website'
	],
	// testPathIgnorePatterns: ['<rootDir>/src/primaryAdapters/website'],
	// Environment variables will be available on all tests.
	setupFiles: ['<rootDir>/tests/runEnvVariables'],
	testEnvironment: '<rootDir>/tests/mongodbEnvironment',
	coverageDirectory: '<rootDir>/tests/coverage',
	collectCoverageFrom: [
		'<rootDir>/src/**',
		'!<rootDir>/tests/**',
		'!<rootDir>/src/primaryAdapters/website/**'
	]
};
