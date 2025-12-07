const express = require('express');
const router = express.Router();
const Borrowing = require('../models/borrowingModel');

// GET /api/borrowings  or /api/borrowings?memberId=1
router.get('/', async (req, res) => {
  try {
    const memberId = req.query.memberId;
    const data = await Borrowing.getBorrowings(memberId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting borrowings' });
  }
});

// POST /api/borrowings   (borrow a book copy)
router.post('/', async (req, res) => {
  try {
    const id = await Borrowing.createBorrowing(req.body);
    res.status(201).json({ message: 'Borrowing created', borrowingId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating borrowing' });
  }
});

// POST /api/borrowings/:id/return
router.post('/:id/return', async (req, res) => {
  try {
    const borrowId = req.params.id;
    const { returnDate } = req.body; // e.g. "2025-12-01"
    const result = await Borrowing.returnBorrowing(borrowId, returnDate);
    // result contains { daysLate, fine }
    res.json({
      message: 'Book returned',
      daysLate: result?.daysLate ?? 0,
      fine: result?.fine ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error returning book' });
  }
});

// POST /api/borrowings/:id/pay  (fake payment: mark fine as paid)
router.post('/:id/pay', async (req, res) => {
  try {
    const borrowId = req.params.id;
    await Borrowing.payFine(borrowId);
    res.json({ message: 'Fine marked as paid' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error paying fine' });
  }
});

module.exports = router;
