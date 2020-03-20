'use strict';

const NodeEnvironment = require('jest-environment-node');
const { MongoClient } = require('mongodb');
// https://github.com/shelfio/jest-mongodb
// const { resolve } = require('path');
// const cwd = require('cwd');
// const MongodbMemoryServer = require('mongodb-memory-server');

module.exports = class MongoDbEnvironment extends NodeEnvironment {
	constructor(config) {
		super(config);
		this.mongodbUri =
			'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';

		// Set reference to mongod in order to close the server during teardown.
		// http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html
		this.mongoClient = new MongoClient(this.mongodbUri, {
			useNewUrlParser: true
		});

		this.global.__MONGODB_DB_NAME__ = 'au-test';
	}

	// http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html
	async setup() {
		// console.log('\nMongoDB Environment Setup');
		await super.setup();

		// process.env.MONGO_URL = this.mongodbUri;
		// this.global.__MONGO_URI__ = this.mongodbUri;

		// const connection = await this.mongodb.connect();
		// this.global.__MONGOD__ = await connection.db('au-dev');

		// if (this.mongoClient.isConnected() === false) {
		//     console.log('Is connected A? ' + this.mongoClient.isConnected());
		//     await this.mongoClient.connect();
		// }
		// console.log('Is connected B? ' + this.mongoClient.isConnected());
		// this.global.__MONGOD__ = await this.mongoClient.db('au-dev');
		this.global.__MONGOCLIENT__ = this.mongoClient;

		// if (this.mongoClient.isConnected() === false) {
		//     console.log('Is connected A? ' + this.mongoClient.isConnected());
		//     await this.mongoClient.connect();
		// }
		// this.global__MONGOD__ = this.min
		// console.log(this.global.__MONGOD__);

		// // Create collections
		// await this.global.__MONGOD__.createCollection('users');
	}

	// http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html
	async teardown() {
		// It's the same code than clearDb from tests\secondaryAdapters\db\localDb.js
		if (this.mongoClient.isConnected() === false)
			await this.mongoClient.connect();
		const db = await this.mongoClient.db(this.global.__MONGODB_DB_NAME__);
		const collections = await db.listCollections().toArray();
		Promise.all(
			collections.map(collection => db.dropCollection(collection.name))
		);

		await this.mongoClient.close();
		this.global = {};

		// At the end of the Teardown function.
		await super.teardown();
	}

	runScript(script) {
		return super.runScript(script);
	}
};
