const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendLoginNotificationEmail, sendAdminWelcomeEmail } = require('../services/emailService');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Convert email to lowercase for case-insensitive comparison
    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email: emailLower, password });
    await user.save();

    // Send welcome email asynchronously (don't wait for it)
    sendWelcomeEmail(emailLower, name).catch(err => 
      console.error('Failed to send welcome email:', err)
    );

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Convert email to lowercase for case-insensitive comparison
    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Send login notification email asynchronously
    sendLoginNotificationEmail(emailLower, user.name, new Date()).catch(err => 
      console.error('Failed to send login notification:', err)
    );

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// POST /api/auth/admin-register (Admin Sign Up)
router.post('/admin-register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('adminCode').notEmpty().withMessage('Admin code is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, adminCode } = req.body;

    // Verify admin code
    const ADMIN_CODE = process.env.ADMIN_CODE || 'admin123';
    if (adminCode !== ADMIN_CODE) {
      return res.status(403).json({ message: 'Invalid admin code' });
    }

    // Convert email to lowercase
    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new admin user
    const user = new User({ name, email: emailLower, password, role: 'admin' });
    await user.save();

    // Send admin welcome email asynchronously
    sendAdminWelcomeEmail(emailLower, name).catch(err => 
      console.error('Failed to send admin welcome email:', err)
    );

    const token = generateToken(user._id);
    res.status(201).json({ message: 'Admin account created successfully', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
