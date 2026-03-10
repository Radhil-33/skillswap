const express = require('express');
const { body, validationResult } = require('express-validator');
const SwapRequest = require('../models/SwapRequest');
const { Conversation } = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/swaps — send a swap request
router.post('/', auth, [
  body('to').notEmpty().withMessage('Recipient is required'),
  body('skillOffered').notEmpty().withMessage('Skill offered is required'),
  body('skillWanted').notEmpty().withMessage('Skill wanted is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, skillOffered, skillWanted, message } = req.body;

    if (to === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send swap request to yourself' });
    }

    const existing = await SwapRequest.findOne({
      from: req.user._id,
      to,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request to this user' });
    }

    const swap = new SwapRequest({
      from: req.user._id,
      to,
      skillOffered,
      skillWanted,
      message,
    });
    await swap.save();
    await swap.populate(['from', 'to']);

    res.status(201).json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/swaps — get all swap requests for current user
router.get('/', auth, async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    })
      .populate('from', 'name avatar skillsOffered')
      .populate('to', 'name avatar skillsOffered')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/swaps/:id/accept
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swap.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    swap.status = 'accepted';
    await swap.save();

    // Create a conversation between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [swap.from, swap.to] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [swap.from, swap.to],
      });
      await conversation.save();
    }

    await swap.populate(['from', 'to']);
    res.json({ swap, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/swaps/:id/reject
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swap.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    swap.status = 'rejected';
    await swap.save();
    await swap.populate(['from', 'to']);

    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
