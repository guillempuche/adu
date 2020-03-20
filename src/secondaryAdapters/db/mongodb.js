'use strict';

const { MongoClient } = require('mongodb');

const client =
	process.env.IS_TESTING === 'true'
		? global.__MONGOCLIENT__
		: new MongoClient(process.env.MONGODB_URI, {
				useNewUrlParser: true
		  });

const mongodbInit = async () => {
	if (client.isConnected() === false) await client.connect();

	const DB_NAME =
		process.env.IS_TESTING === 'true'
			? global.__MONGODB_DB_NAME__
			: process.env.MONGODB_DB_NAME;
	return client.db(DB_NAME);
};

module.exports = {
	mongodbInit
};
