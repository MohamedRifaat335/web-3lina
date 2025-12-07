const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Email and Password required' });
    }

    const admin = await Admin.getAdminByCredentials(Email, Password);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // simple login response (no JWT/session for now)
    res.json({
      message: 'Login successful',
      adminId: admin.Admin_ID,
      name: admin.Name,
      email: admin.Email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during admin login' });
  }
});

// optional: list all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.getAllAdmins();
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting admins' });
  }
});

// optional: create admin
router.post('/', async (req, res) => {
  try {
    const id = await Admin.createAdmin(req.body);
    res.status(201).json({ message: 'Admin created', adminId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating admin' });
  }
});

module.exports = router;
