// routes/message.js - Fixed version
const express = require('express');
const { Message, MESSAGE_TYPES } = require('../models/Message');
const Chatroom = require('../models/Chatroom');
const { auth } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');

const router = express.Router();

// Send message
router.post('/send', auth, validateMessage, async (req, res) => {
  try {
    const { chatroomId, content, messageType } = req.body;
    const chatroomIdNum = parseInt(chatroomId, 10);
    
    if (isNaN(chatroomIdNum)) {
      return res.status(400).json({ error: 'Invalid chatroom ID' });
    }
    
    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomIdNum, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await Message.create({
      chatroomId: chatroomIdNum,
      senderId: req.user.id,
      content,
      messageType
    });

    // Update chatroom last activity
    await Chatroom.updateLastActivity(chatroomIdNum);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read - Fixed parameter syntax
router.put('/read/:chatroomId', auth, async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const chatroomIdNum = parseInt(chatroomId, 10);
    
    if (isNaN(chatroomIdNum)) {
      return res.status(400).json({ error: 'Invalid chatroom ID' });
    }
    
    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomIdNum, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Message.markAsRead(chatroomIdNum, req.user.id);
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread count - Fixed parameter syntax
router.get('/unread/:chatroomId', auth, async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const chatroomIdNum = parseInt(chatroomId, 10);
    
    if (isNaN(chatroomIdNum)) {
      return res.status(400).json({ error: 'Invalid chatroom ID' });
    }
    
    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomIdNum, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const count = await Message.getUnreadCount(chatroomIdNum, req.user.id);
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;