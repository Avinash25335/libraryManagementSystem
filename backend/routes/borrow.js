const express = require('express');
const router = express.Router();
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { auth, librarianOrAdmin } = require('../middleware/auth');

const FINE_PER_DAY = 5; // ₹5 per day overdue

// ─────────────────────────────────────────
// Borrow a book
// ─────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { bookId, days } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ msg: 'Book not available' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (days || 14));

    const borrow = new Borrow({ userId: req.user.id, bookId, dueDate });
    await borrow.save();

    book.availableCopies -= 1;
    await book.save();

    res.json(borrow);
  } catch (err) {
    console.error('Borrow error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────
// Return a book (calculates fine on return)
// ─────────────────────────────────────────
router.post('/return/:id', auth, async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id).populate('bookId');
    if (!borrow) return res.status(404).json({ msg: 'Record not found' });

    const now = new Date();
    const returnDate = now;
    let fine = 0;

    // Calculate fine if returned after due date
    if (now > borrow.dueDate) {
      const daysOverdue = Math.ceil((now - borrow.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * FINE_PER_DAY;
    }

    borrow.returnDate = returnDate;
    borrow.status = 'returned';
    borrow.fine = fine;
    await borrow.save();

    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({ ...borrow.toJSON(), fine, message: fine > 0 ? `Book returned with a fine of ₹${fine}` : 'Book returned successfully!' });
  } catch (err) {
    console.error('Return error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────
// Mark fine as paid (Admin)
// ─────────────────────────────────────────
router.post('/pay-fine/:id', [auth, librarianOrAdmin], async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ msg: 'Record not found' });
    borrow.finePaid = true;
    await borrow.save();
    res.json({ msg: 'Fine marked as paid', borrow });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────
// Get user borrow history (with live fine)
// ─────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Borrow.find({ userId: req.user.id }).populate('bookId').sort({ borrowDate: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─────────────────────────────────────────
// Admin: Get all borrows
// ─────────────────────────────────────────
router.get('/admin/all', [auth, librarianOrAdmin], async (req, res) => {
  try {
    const allBorrowed = await Borrow.find()
      .populate('bookId')
      .populate('userId', 'name email')
      .sort({ borrowDate: -1 });
    res.json(allBorrowed);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
