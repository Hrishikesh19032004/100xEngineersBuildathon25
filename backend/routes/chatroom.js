// routes/chatroom.js - Fixed version
const express = require('express');
const Chatroom = require('../models/Chatroom');
const {Message} = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get chatroom details - Fixed parameter syntax
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const chatroomId = parseInt(id, 10);
    
    if (isNaN(chatroomId)) {
      return res.status(400).json({ error: 'Invalid chatroom ID' });
    }
    
    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    // Get recent messages
    const messages = await Message.findByChatroomId(chatroomId, 50);
    
    // Mark messages as read
    await Message.markAsRead(chatroomId, req.user.id);

    res.json({
      chatroom,
      messages
    });
  } catch (error) {
    console.error('Chatroom fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chatroom' });
  }
});

// Get chatroom messages with pagination - Fixed parameter syntax
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const chatroomId = parseInt(id, 10);
    
    if (isNaN(chatroomId)) {
      return res.status(400).json({ error: 'Invalid chatroom ID' });
    }
    
    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.findByChatroomId(
      chatroomId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({ messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;