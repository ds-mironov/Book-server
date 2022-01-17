const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

const app = express();

app.use(express.json());

app.use(cors(corsOptions));

app.use('/api/', require('./routes/book.routes'));

const PORT = config.get('dbConfig.port') || 4000;

async function start() {
    try {
        await mongoose.connect(
            config.get('dbConfig.mongoUri'),
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (e) {
        console.log('Server startup error', e.message);
        process.exit(1);
    }
}

start();
