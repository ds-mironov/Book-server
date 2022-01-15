const {Schema, model} = require('mongoose');

const schema = new Schema({
    id: {
        type: String, required: true, unique: true
    },
    title: {
        type: String, required: true
    },
    author: {
        type: String, required: true
    },
    descriptions: {
        type: String, required: true
    },
    price: {
        type: String, required: true
    },
    image: {
        type: String, required: true
    },
    // orders: [{type: Types.ObjectId, ref: 'Author'}]
});

module.exports = model('Book', schema);
