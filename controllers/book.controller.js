const Book = require('../models/Book');

class BookController {
    async getBooks(req, res) {
        const { page, limit } = req.query;

        try {
            const books = await Book.find()
                .limit(limit)
                .skip((page - 1) * limit)
                .exec();

            const count = await Book.countDocuments();

            res.json({
                books,
                totalBooks: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } catch (e) {
            res.status(500).json(e.message);
        }
    }

    async getBookById(req, res) {
        const {id} = req.params;

        if (!id) {
            res.status(400).json({message: 'Id указан'});
        }

        try {
            const book = await Book.findOne({ISBN: +id});
            res.status(200).json(book);
        } catch (e) {
            res.status(500).json(e.message);
        }
    }
 }

module.exports = new BookController();
