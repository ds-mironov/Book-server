const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());

// app.use('/api/books', require('./routes/books.routes'));

async function start() {
    try {
        await mongoose.connect(
            'mongodb+srv://dmitriy:HVCglhDVJwKeQVLr@cluster0.gpgzl.mongodb.net/books',
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
