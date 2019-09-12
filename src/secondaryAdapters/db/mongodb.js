'use strict';

const mongodb = require('mongodb');
const { MongoClient, ObjectID } = mongodb;

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true
});

const mongodbInit = async () => {
    if (client.isConnected() === false) await client.connect();

    return client.db(process.env.MONGODB_DB_NAME);
};

module.exports = {
    mongodbInit,
    createObjectId: _id => new ObjectID(_id)
};
