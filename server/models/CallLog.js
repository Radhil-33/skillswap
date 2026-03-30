const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  callee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  callType: {
    type: String,
    enum: ['video', 'audio'],
    default: 'video',
  },
  status: {
    type: String,
    enum: ['completed', 'missed', 'rejected'],
    required: true,
  },
  duration: {
    type: Number, // duration in seconds
    default: 0,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
});

module.exports = mongoose.model('CallLog', callLogSchema);
