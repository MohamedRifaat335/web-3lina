const express = require('express');
const router = express.Router();
const Auth = require('../models/authModel');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Email and Password required' });
    }

    const member = await Auth.getMemberByCredentials(Email, Password);
    if (!member) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // simple login (no JWT): frontend will store Mem_ID, Name, Email
    res.json({
      message: 'Login successful',
      memberId: member.Mem_ID,
      name: member.Name,
      email: member.Email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during member login' });
  }
});

module.exports = router;
