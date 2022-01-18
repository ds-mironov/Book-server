const {Schema, model} = require('mongoose');

const schema = new Schema({
    ISBN: {
        type: Number, required: true, index: true, unique: true
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
        currency: {type: String, required: true},
        value: {type: Number, required: true},
        displayValue: {type: String, required: true}
    },
    image: {
        type: String, required: true
    },
});

module.exports = model('Book', schema);
