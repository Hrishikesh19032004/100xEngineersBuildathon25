// Enhanced routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateLogin, validateCreatorProfile } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Signup
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { email, password, username, role, profile } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ email, password, username, role, profile });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        profileCompleted: user.profile_completed
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        profileCompleted: user.profile_completed
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete creator profile (only for first-time setup)
router.post('/complete-profile', auth, authorize('creator'), validateCreatorProfile, async (req, res) => {
  try {
    // Check if profile is already completed
    const isCompleted = await User.isProfileCompleted(req.user.id);
    if (isCompleted) {
      return res.status(400).json({ error: 'Profile already completed' });
    }

    const {
      channelName,
      platforms,
      totalSubscribers,
      viewsLast30Days,
      contentCategory,
      description,
      socialLinks
    } = req.body;

    const profileData = {
      channelName,
      platforms, // Array of { name, url, subscribers }
      totalSubscribers,
      viewsLast30Days,
      contentCategory,
      description: description || '',
      socialLinks: socialLinks || {},
      profileCompletedAt: new Date().toISOString()
    };

    const updatedUser = await User.completeCreatorProfile(req.user.id, profileData);

    res.json({
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        profile: updatedUser.profile,
        profileCompleted: updatedUser.profile_completed
      }
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check profile completion status
router.get('/profile-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      profileCompleted: user.profile_completed,
      needsCompletion: user.role === 'creator' && !user.profile_completed
    });
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ 
    user: {
      ...req.user,
      profileCompleted: req.user.profile_completed
    }
  });
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

module.exports = router;