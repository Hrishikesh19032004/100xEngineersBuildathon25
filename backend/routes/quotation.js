const express = require('express');
const { Message, MESSAGE_TYPES } = require('../models/Message');
const Chatroom = require('../models/Chatroom');
const { auth, authorize } = require('../middleware/auth');
const { validateQuotation } = require('../middleware/validation');
const { pool } = require('../config/database');

const router = express.Router();

// Send quotation
router.post('/send', auth, authorize('business'), validateQuotation, async (req, res) => {
  try {
    const { chatroomId, deliverables, price, deadline, notes } = req.body;

    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const quotationData = {
      deliverables,
      price,
      deadline,
      notes,
      status: 'pending',
    };

    const message = await Message.create({
      chatroomId,
      senderId: req.user.id,
      content: 'New quotation received',
      messageType: MESSAGE_TYPES.QUOTATION,
      metadata: quotationData,
    });

    // Update chatroom last activity
    await Chatroom.updateLastActivity(chatroomId);

    res.status(201).json({
      message: 'Quotation sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Quotation send error:', error);
    res.status(500).json({ error: 'Failed to send quotation' });
  }
});

// Respond to quotation
router.post('/respond', auth, authorize('creator'), async (req, res) => {
  try {
    const { messageId, response, counterPrice, notes } = req.body;

    // Get original message
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage || originalMessage.message_type !== MESSAGE_TYPES.QUOTATION) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Check access permission
    const hasAccess = await Chatroom.hasAccess(originalMessage.chatroom_id, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const responseData = {
      originalQuotationId: messageId,
      response, // 'accepted', 'rejected', 'counter'
      counterPrice: response === 'counter' ? counterPrice : null,
      notes,
    };

    const message = await Message.create({
      chatroomId: originalMessage.chatroom_id,
      senderId: req.user.id,
      content: 'Quotation response',
      messageType: MESSAGE_TYPES.QUOTATION_RESPONSE,
      metadata: responseData,
    });

    // Update original quotation status if accepted/rejected
    if (response !== 'counter') {
      await pool.query(
        `UPDATE messages SET metadata = jsonb_set(metadata, '{status}', $1) WHERE id = $2`,
        [JSON.stringify(response), messageId]
      );
    }

    // Update chatroom last activity
    await Chatroom.updateLastActivity(originalMessage.chatroom_id);

    res.status(201).json({
      message: 'Quotation response sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Quotation response error:', error);
    res.status(500).json({ error: 'Failed to respond to quotation' });
  }
});

// Get quotations for chatroom
router.get('/chatroom/:chatroomId', auth, async (req, res) => {
  try {
    const { chatroomId } = req.params;

    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE chatroom_id = $1 
       AND message_type IN ($2, $3)
       ORDER BY created_at DESC`,
      [chatroomId, MESSAGE_TYPES.QUOTATION, MESSAGE_TYPES.QUOTATION_RESPONSE]
    );

    res.json({ quotations: result.rows });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Failed to get quotations' });
  }
});

module.exports = router;
