const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: { type: Number, required: true },  // in minutes
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
    default: 'pending',
  },
    remainingMs: {
    type: Number,
    default: null
  },
  lastResumedAt: {
    type: Date,
    default: null
  },

  lastCompleted: {
  type: Date,
  default: null,
},


  isDaily: {
    type: Boolean,
    default: false,
  },

  checkCount: {
  type: Number,
  default: 0,
},

  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  points: { type: Number, default: 0 },
  rewardBadge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
  startTime: Date,
  endTime: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mission', missionSchema);
