const {MongoClient} = require("mongodb");
const config = require("config");

async function sendBooksToDB(books) {
    const uri = config.get('dbConfig.mongoUri');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        await createMultipleListings(client, books);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function createMultipleListings(client, newListings) {
    const result = await client.db("book_server").collection("books").insertMany(newListings);

    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

module.exports = sendBooksToDB;
