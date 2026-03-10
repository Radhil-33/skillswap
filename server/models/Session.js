const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  type: {
    type: String,
    enum: ['video', 'in-person'],
    default: 'video',
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
