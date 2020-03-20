'use strict';

const makeUsersDb = require('./usersDb');
const makeFacultiesDb = require('./facultiesDb');
const { mongodbInit } = require('./mongodb');
const { startDb } = require('../../../tests/secondaryAdapters/db/localDb');
// Library to transform objects to mongo update instructions using operators. https://www.npmjs.com/package/mongo-dot-notation
const $ = require('mongo-dot-notation');

// IMPORTANT: For production, we use MongoDB Cloud (now it isn't able), else if
// MongoDB local server for testing, else MongoDb Cloud for development.
// To use the local server, after install it on the local machine and
// previously to run the app we have to:
// - set enviroment variable IS_TESTING="true" in in .env file.
// - run this command: $ mongod --dbpath D:\Codi\Code\au\tests\secondaryAdapters\db\mongoserver

const usersDb = makeUsersDb({
	makeDb:
		// process.env.NODE_ENV === 'production'
		//     ? '' // To be filled
		// : process.env.IS_TESTING === 'true'
		// ? startDb // Local machine db :
		mongodbInit, // Development cloud db
	operator: $
});
const facultiesDb = makeFacultiesDb({
	makeDb:
		// process.env.NODE_ENV === 'production'
		// ? '' // To be filled
		// : : process.env.IS_TESTING === 'true'
		// ? startDb // Local machine db :
		mongodbInit, // Development cloud db
	operator: $
});

module.exports = {
	usersDb,
	facultiesDb
};
