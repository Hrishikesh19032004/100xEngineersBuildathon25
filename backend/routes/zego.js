// routes/zego.js
const express = require('express');
const crypto = require('crypto');
const Chatroom = require('../models/Chatroom');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate ZegoCloud token for chat
router.post('/token', auth, async (req, res) => {
  try {
    const { chatroomId } = req.body;
    
    if (!chatroomId) {
      return res.status(400).json({ error: 'Chatroom ID is required' });
    }

    // Check access permission
    const hasAccess = await Chatroom.hasAccess(chatroomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this chatroom' });
    }

    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;
    const userId = req.user.id.toString();
    const effectiveTimeInSeconds = 3600; // 1 hour
    const payloadObject = {
      iss: appId,
      exp: Math.floor(Date.now() / 1000) + effectiveTimeInSeconds,
    };

    // Create header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // Create payload
    const payload = {
      ...payloadObject,
      user_id: userId,
      room_id: `chatroom_${chatroomId}`
    };

    // Generate JWT token
    const token = generateZegoToken(header, payload, serverSecret);

    res.json({
      token,
      appId,
      userId,
      roomId: `chatroom_${chatroomId}`,
      userName: req.user.username,
      expiresIn: effectiveTimeInSeconds
    });
  } catch (error) {
    console.error('Zego token generation error:', error);
    res.status(500).json({ error: 'Failed to generate chat token' });
  }
});

// Helper function to generate ZegoCloud token
function generateZegoToken(header, payload, secret) {
  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerBase64}.${payloadBase64}`)
    .digest('base64url');
  
  return `${headerBase64}.${payloadBase64}.${signature}`;
}

module.exports = router;