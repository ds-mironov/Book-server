const {Router} = require('express');
const BookController = require('../controllers/book.controller');

const router = Router();

router.get('/books', BookController.getBooks);
router.get('/books/:id', BookController.getBookById);

module.exports = router;
