const {Schema, model} = require('mongoose');

const schema = new Schema({
    ISBN: {
        type: Number, required: true, unique: true
    },
    title: {
        type: String, required: true
    },
    author: {
        type: String, required: true
    },
    summary: {
        type: String, required: true
    },
    price: {
        type: Object, required: true
    },
    image: {
        type: String, required: true
    },
});

module.exports = model('Book', schema);
