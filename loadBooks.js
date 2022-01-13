const {MongoClient} = require('mongodb');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {promises: {readFile}} = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';
const directoryPath = path.dirname('/home/dmitriy/Documents/books/1');
const driveUri = 'https://drive.google.com/uc?id=';

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const bookPromises = files.map((file) => parseBook(directoryPath, file));

    Promise.all(bookPromises).then((books) => sendBooksToDB(books).catch(console.error));
});

async function parseBook(path, folder) {
    const getContentFile = async (file) => {
        return await readFile(`${path}/${folder}/${file}`)
            .then((content) => {
                return content.toString().trim();
            }).catch((error) => {
                console.error(error.message);
                throw error;
            });
    }

    const searchImage = (path, filter) => {
        if (!fs.existsSync(path)) {
            console.log("no dir ", path);
            return;
        }

        const files = fs.readdirSync(path);
        return files.filter(file => file.indexOf(filter) >= 0)
    }

    const image = searchImage(`${path}/${folder}`, '.jpg');

    const title = await getContentFile('title.txt');
    const description = await getContentFile('description.txt');
    const price = await getContentFile('price.txt');

    const imageId = await readFile('credentials.json')
        .then(content => {
            return new Promise((resolve, reject) => {
                authorize(JSON.parse(content), auth => resolve(uploadFile(auth, `${path}/${folder}`, image)));
            })
        })
        .catch(err => console.log('Error loading client secret file:', err));

    function uploadFile(auth, path, file) {
        const drive = google.drive({version: 'v3', auth});
        const folderId = '1Uy29onZRA8xrXQO1nXMtMTPgk-o9hV0Y';
        const fileMetadata = {
            'name': file,
            parents: [folderId]
        };
        const media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(`${path}/${file}`)
        };

        return new Promise((resolve, reject) => {
            drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                },
                (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        const id = res.data.id;
                        resolve(id);
                    }
                });
        })
    }

    const imageUri = driveUri + imageId;

    return {id: folder, path, title, description, price, image: imageUri};
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

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
