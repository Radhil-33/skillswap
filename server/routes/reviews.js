const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews
router.post('/', auth, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().isLength({ max: 1000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findById(req.body.sessionId);
    if (!session || session.status !== 'completed') {
      return res.status(400).json({ message: 'Session not found or not completed' });
    }

    const isParticipant = session.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reviewee = session.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    const review = new Review({
      session: session._id,
      reviewer: req.user._id,
      reviewee,
      rating: req.body.rating,
      comment: req.body.comment || '',
    });
    await review.save();

    // Update user's average rating
    const allReviews = await Review.find({ reviewee });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewee, {
      rating: { average: Math.round(avgRating * 10) / 10, count: allReviews.length },
    });

    await review.populate('reviewer', 'name avatar');
    await review.populate('reviewee', 'name avatar');

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
