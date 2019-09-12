module.exports = {
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/client/',
        '<rootDir>/backend/'
    ],
    // preset: '@shelf/jest-mongodb'
    // setupFiles: [resolve(__dirname, './jest-setup.js')],
    // globalSetup: resolve(__dirname, './jest-setup.js'),
    // globalSetup: '<rootDir>/jest-setup',
    // globalTeardown: resolve(__dirname, './jest-teardown.js'),
    // globalTeardown: '<rootDir>/jest-teardown',
    // testEnvironment: '<rootDir>/__test__/jest-mongoV2.js',
    // testEnvironment: resolve(__dirname, './jest-environment.js')
    // testEnvironment: '<rootDir>/jest-environment'
    testEnvironment: '<rootDir>/tests/mongodb-environment'
    // testRunner: 'jest-circus/runner'
    // setupFilesAfterEnv: ['<rootDir>/mongodb-setup']
    // Indicates whether each individual test should be reported during the run
    //roots: ['<rootDir>/src/__test__/']
    // "testPathIgnorePatterns": [
    //     "<rootDir>/node_modules/",
    //     "<rootDir>/frontend/"
    // ],
    // "roots": [
    //     "<rootDir>/src/"
    // ]
};
