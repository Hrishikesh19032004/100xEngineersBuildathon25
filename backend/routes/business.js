// routes/business.js - Fixed version
const express = require('express');
const User = require('../models/User');
const Chatroom = require('../models/Chatroom');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get business dashboard data
router.get('/dashboard', auth, authorize('business'), async (req, res) => {
  try {
    const creators = await User.findByRole('creator');
    const myChatrooms = await Chatroom.findByBusinessId(req.user.id);
    
    res.json({
      creators,
      chatrooms: myChatrooms,
      stats: {
        totalCreators: creators.length,
        activeChatrooms: myChatrooms.length
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get all creators
router.get('/creators', auth, authorize('business'), async (req, res) => {
  try {
    const creators = await User.findByRole('creator');
    res.json({ creators });
  } catch (error) {
    console.error('Creators fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// Initiate chat with creator - Fixed parameter syntax
router.post('/initiate-chat/:creatorId', auth, authorize('business'), async (req, res) => {
  try {
    const { creatorId } = req.params;
    const creatorIdNum = parseInt(creatorId, 10);
    
    if (isNaN(creatorIdNum)) {
      return res.status(400).json({ error: 'Invalid creator ID' });
    }
    
    // Verify creator exists
    const creator = await User.findById(creatorIdNum);
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const chatroom = await Chatroom.create(req.user.id, creatorIdNum);
    
    res.json({
      message: 'Chatroom created successfully',
      chatroom
    });
  } catch (error) {
    console.error('Chat initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate chat' });
  }
});

// Get business chatrooms
router.get('/chatrooms', auth, authorize('business'), async (req, res) => {
  try {
    const chatrooms = await Chatroom.findByBusinessId(req.user.id);
    res.json({ chatrooms });
  } catch (error) {
    console.error('Chatrooms fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
});

module.exports = router;