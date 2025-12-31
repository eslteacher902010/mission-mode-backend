const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  title: { type: String, required: true },   // e.g., "Focus Cadet"
  description: String,
  icon: String,                             // URL or icon name
  pointsRequired: { type: Number, default: 0 },
});

module.exports = mongoose.model('Badge', badgeSchema);
