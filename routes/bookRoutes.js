const express = require('express');
const router = express.Router();
const Book = require('../models/bookModel');

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const books = await Book.getAllBooks();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting books' });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting book' });
  }
});

// POST /api/books
router.post('/', async (req, res) => {
  try {
    const newId = await Book.createBook(req.body);
    res.status(201).json({ message: 'Book created', bookId: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating book' });
  }
});

// PUT /api/books/:id
router.put('/:id', async (req, res) => {
  try {
    await Book.updateBook(req.params.id, req.body);
    res.json({ message: 'Book updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating book' });
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  try {
    await Book.deleteBook(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting book' });
  }
});

module.exports = router;
