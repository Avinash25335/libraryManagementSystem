const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { auth, librarianOrAdmin } = require('../middleware/auth');
const axios = require('axios');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add book (Manual)
router.post('/', [auth, librarianOrAdmin], async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update book
router.put('/:id', [auth, librarianOrAdmin], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete book
router.delete('/:id', [auth, librarianOrAdmin], async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Book deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// External Search (Google Books API)
router.get('/external-search', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`);
    const docs = response.data.docs || [];
    
    // Map Open Library response to our expected format
    const books = docs.slice(0, 10).map(doc => ({
      title: doc.title || 'Unknown Title',
      author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
      category: doc.subject ? doc.subject[0] : 'General',
      isbn: doc.isbn ? doc.isbn[0] : '',
      description: doc.first_publish_year ? `First published in ${doc.first_publish_year}` : '',
      coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
    }));
    res.json(books);
  } catch (err) {
    console.error("\n=== GOOGLE BOOKS API ERROR ===");
    console.error("Message:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    }
    console.error("URL hit:", `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
    console.error("==============================\n");
    res.status(500).send('External API error');
  }
});

module.exports = router;
