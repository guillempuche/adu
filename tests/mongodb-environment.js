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
        // http://mongodb.github.io/node-mongodb-native/3.2/api/MongoClient.html
        this.mongodb = new MongoClient(this.mongodbUri, {
            useNewUrlParser: true
        });
    }

    // http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html
    async setup() {
        console.error('\nMongoDB Environment Setup');
        await super.setup();

        // process.env.MONGO_URL = this.mongodbUri;
        // this.global.__MONGO_URI__ = this.mongodbUri;
        const connection = await this.mongodb.connect();
        this.global.__MONGOD__ = await connection.db('au-dev');

        // // Create collections
        // await this.global.__MONGOD__.createCollection('users');
    }

    // http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html
    async teardown() {
        // // await this.global.__MONGOD__.dropDatabase();
        await this.mongodb.close();
        this.global = {};

        // At the end of the Teardown function.
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }
};
