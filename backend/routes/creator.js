// Enhanced routes/creator.js
const express = require('express');
const Chatroom = require('../models/Chatroom');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if creator profile is completed
const requireCompleteProfile = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const isCompleted = await User.isProfileCompleted(req.user.id);
    
    if (!isCompleted) {
      return res.status(403).json({ 
        error: 'Profile completion required',
        needsProfileCompletion: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Profile check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get creator dashboard data (requires completed profile)
router.get('/dashboard', auth, authorize('creator'), requireCompleteProfile, async (req, res) => {
  try {
    const myChatrooms = await Chatroom.findByCreatorId(req.user.id);
    
    res.json({
      chatrooms: myChatrooms,
      stats: {
        activeChatrooms: myChatrooms.length,
        hasChats: myChatrooms.length > 0
      }
    });
  } catch (error) {
    console.error('Creator dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get creator chatrooms (requires completed profile)
router.get('/chatrooms', auth, authorize('creator'), requireCompleteProfile, async (req, res) => {
  try {
    const chatrooms = await Chatroom.findByCreatorId(req.user.id);
    res.json({ 
      chatrooms,
      hasChats: chatrooms.length > 0
    });
  } catch (error) {
    console.error('Chatrooms fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
});

module.exports = router;