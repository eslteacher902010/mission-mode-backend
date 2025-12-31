const express = require('express');
const router = express.Router();
const Badge = require('../models/badge');

router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE - POST - /badges 
router.post('/', async (req, res) => {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.status(201).json(badge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

