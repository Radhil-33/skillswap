const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/sessions
router.post('/', auth, [
  body('swapRequestId').notEmpty().withMessage('Swap request ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('duration').optional().isInt({ min: 15, max: 480 }),
  body('type').optional().isIn(['video', 'in-person']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const swap = await SwapRequest.findById(req.body.swapRequestId);
    if (!swap || swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Swap request not found or not accepted' });
    }

    const isParticipant = [swap.from.toString(), swap.to.toString()].includes(req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const session = new Session({
      participants: [swap.from, swap.to],
      swapRequest: swap._id,
      date: req.body.date,
      duration: req.body.duration || 60,
      type: req.body.type || 'video',
      notes: req.body.notes || '',
    });
    await session.save();
    await session.populate('participants', 'name avatar email');

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar')
      .populate('swapRequest')
      .sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/sessions/:id/complete
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant = session.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = 'completed';
    await session.save();
    await session.populate('participants', 'name avatar');

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/sessions/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant = session.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = 'cancelled';
    await session.save();
    await session.populate('participants', 'name avatar');

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
