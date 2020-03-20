/**
 * IMPORTANT:
 * 1. Before you have to install MongoDB Server as a Services on the your machine.
 * 2. Then, run on cmd this: $ mongod --dbpath D:\Codi\Code\au\tests\secondaryAdapters\db\mongoserver
 * to start the MongoDB on your machine.
 */
'use strict';

// /**
//  * Connect to MongoDB + create a new Db instance sharing the current socket connections.
//  *
//  * More info: http://mongodb.github.io/node-mongodb-native/3.2/api/MongoClient.html
//  */
// async function startDb() {
//     return global.__MONGOD__;
// }

async function clearDb() {
	// It's the same code than Teardown from "tests\mongodbEnvironment.js"
	if (this.global.__MONGOCLIENT__.isConnected() === false)
		await this.global.__MONGOCLIENT__.connect();

	const db = await this.global.__MONGOCLIENT__.db(
		process.env.TEST_MONGODB_DB_NAME
	);

	const collections = await db.listCollections().toArray();
	Promise.all(
		collections.map(collection => db.dropCollection(collection.name))
	);

	// const collections = await global.__MONGOD__.listCollections().toArray();
	// return Promise.all(
	//     collections
	//     .map(({ name }) => name)
	//     .map(collection => global.__MONGOD__.collection(collection).drop())
	//     // // delete all the documents along with the collection itself.
	//     // .map(collection => global.__MONGOD__.collection(collection).remove({}))
	//     );
	// const collections = await db.listCollections().toArray();
	// return Promise.all(
	//     collections
	//         .map(({ name }) => name)
	//         .map(collection => db.collection(collection).drop())
	// );
	// collections.forEach(async collection => {
	//     await db.dropCollection(collection.name);
	// });
}

module.exports = {
	// startDb,
	clearDb
};
