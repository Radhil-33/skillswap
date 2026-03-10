const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile/:id
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().isLength({ max: 500 }),
  body('location').optional().trim(),
  body('skillsOffered').optional().isArray(),
  body('skillsWanted').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedFields = ['name', 'bio', 'location', 'avatar', 'skillsOffered', 'skillsWanted'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/search?skill=python&page=1
router.get('/search', auth, async (req, res) => {
  try {
    const { skill, page = 1, limit = 12 } = req.query;
    const query = { _id: { $ne: req.user._id } };

    if (skill) {
      query['skillsOffered.name'] = { $regex: skill, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
