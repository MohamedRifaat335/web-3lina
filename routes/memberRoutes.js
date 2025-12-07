const express = require('express');
const router = express.Router();
const Member = require('../models/memberModel');

// GET /api/members
router.get('/', async (req, res) => {
  try {
    const members = await Member.getAllMembers();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting members' });
  }
});

// GET /api/members/:id
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting member' });
  }
});

// POST /api/members
router.post('/', async (req, res) => {
  try {
    const newId = await Member.createMember(req.body);
    res.status(201).json({ message: 'Member created', memberId: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating member' });
  }
});

// PUT /api/members/:id
router.put('/:id', async (req, res) => {
  try {
    await Member.updateMember(req.params.id, req.body);
    res.json({ message: 'Member updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating member' });
  }
});

// DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
  try {
    await Member.deleteMember(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting member' });
  }
});

module.exports = router;
