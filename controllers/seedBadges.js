// controllers/seedBadges.js
const express = require('express');
const router = express.Router();
const Badge = require('../models/badge');

// POST /seed-badges
router.post('/seed-badges', async (req, res) => {


  const badges = await Badge.insertMany([
    { title: "Starter", icon: "🌱 Newbie Award", pointsRequired: 1 },
    { title: "Focused", icon: "🎯 Focused Award", pointsRequired: 5 },
    { title: "Mission Pro", icon: "🔥 Mission Pro Award", pointsRequired: 10 },
    { title: "Elite", icon: "🏆 Elite Award", pointsRequired: 20 }
  ]);

  res.json(badges);
});

module.exports = router;
