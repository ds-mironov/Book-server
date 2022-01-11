const {MongoClient} = require('mongodb');
const path = require('path');
const {readdir, promises: {readFile}} = require('fs');

const directoryPath = path.dirname('/home/dmitriy/Documents/books/1');

readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const bookPromises = files.map((file) => parseBook(directoryPath + '/' + file));

    Promise.all(bookPromises).then((books) => sendBooksToDB(books).catch(console.error));
});

function parseBook(path) {
    let title = readFile(path + '/title.txt').then((content) => {
        return content.toString().trim();
    }).catch((error) => {
        console.error(error.message);
        throw error;
    });

    let description = readFile(path + '/description.txt').then((content) => {
        return content.toString().trim();
    }).catch((error) => {
        console.error(error.message);
        throw error;
    });

    let price = readFile(path + '/price.txt').then((content) => {
        return content.toString().trim();
    }).catch((error) => {
        console.error(error.message);
        throw error;
    });

    return Promise.all([title, description, price]).then(([title, description, price]) => {
        const id = title.split(' ').join('_');
        return {id, path, title, description, price};
    });
}

async function sendBooksToDB(books) {
    const uri = 'mongodb+srv://dmitriy:HVCglhDVJwKeQVLr@cluster0.gpgzl.mongodb.net/app?retryWrites=true&w=majority';
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
