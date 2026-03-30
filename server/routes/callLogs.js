const express = require('express');
const router = express.Router();
const CallLog = require('../models/CallLog');
const auth = require('../middleware/auth');

// Get all call logs for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const logs = await CallLog.find({
      $or: [{ caller: req.user.id }, { callee: req.user.id }],
    })
      .populate('caller', 'name avatar')
      .populate('callee', 'name avatar')
      .sort({ startTime: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Clear call logs for the logged-in user (optional, but good for UX)
router.delete('/', auth, async (req, res) => {
  try {
    await CallLog.deleteMany({
      $or: [{ caller: req.user.id }, { callee: req.user.id }],
    });
    res.json({ msg: 'Call logs cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
