'use strict';

const makeUsersDb = require('./usersDb');
const { mongodbInit, createObjectId } = require('./mongodb');
// Library to transform objects to mongo update instructions using operators. https://www.npmjs.com/package/mongo-dot-notation
const $ = require('mongo-dot-notation');

const usersDb = makeUsersDb({
    makeDb: mongodbInit,
    createObjectId,
    operator: $
});

module.exports = {
    usersDb
};
