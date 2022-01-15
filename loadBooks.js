const path = require('path');
const fs = require('fs');
const {readFile} = require('fs/promises');
const {google} = require('googleapis');
const config = require('config');
const sendBooksToDB = require('./services/mongodb.service');
const authorize = require('./services/google.drive.service')

const directoryPath = path.dirname(config.get('pathFolder'));
const driveUri = config.get('googleDrive.driveUri');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const bookPromises = files.map((file) => parseBook(directoryPath, file));

    Promise.all(bookPromises).then((books) => sendBooksToDB(books).catch(console.error));
});

async function parseBook(path, folder) {
    const bookInfo = await readFile(`${path}/${folder}/book_info.json`)
        .then((content) => {
            return JSON.parse(content);
        }).catch((error) => {
            console.error(error.message);
            throw error;
        });

    const searchImage = (path, filter) => {
        if (!fs.existsSync(path)) {
            console.log("no dir ", path);
            return;
        }

        const files = fs.readdirSync(path);
        return files.filter(file => file.indexOf(filter) >= 0)
    }

    const image = searchImage(`${path}/${folder}`, '.jpg');

    const imageId = await readFile('credentials.json')
        .then(content => {
            return new Promise((resolve) => {
                authorize(JSON.parse(content), auth => resolve(uploadFile(auth, `${path}/${folder}`, image)));
            })
        })
        .catch(err => console.log('Error loading client secret file:', err));

    function uploadFile(auth, path, file) {
        const drive = google.drive({version: 'v3', auth});
        const folderId = config.get('googleDrive.folderId');
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

    return {...bookInfo, image: driveUri + imageId};
}
