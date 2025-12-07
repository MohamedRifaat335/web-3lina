const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservationModel');

// GET /api/reservations or /api/reservations?memberId=1
router.get('/', async (req, res) => {
  try {
    const memberId = req.query.memberId;
    const data = await Reservation.getReservations(memberId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting reservations' });
  }
});

// POST /api/reservations
router.post('/', async (req, res) => {
  try {
    const id = await Reservation.createReservation(req.body);
    res.status(201).json({ message: 'Reservation created', reservationId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

// PUT /api/reservations/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'Pending' | 'Active' | 'Completed' | 'Cancelled'
    await Reservation.updateReservationStatus(req.params.id, status);
    res.json({ message: 'Reservation status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

module.exports = router;
