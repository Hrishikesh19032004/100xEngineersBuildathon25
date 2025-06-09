const { pool } = require('../config/database');

const MESSAGE_TYPES = {
  TEXT: 'text',
  QUOTATION: 'quotation',
  QUOTATION_RESPONSE: 'quotation_response',
};

class Message {
  static async create({ chatroomId, senderId, content, messageType = 'text', metadata = {} }) {
    const query = `
      INSERT INTO messages (chatroom_id, sender_id, content, message_type, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [chatroomId, senderId, content, messageType, JSON.stringify(metadata)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `SELECT * FROM messages WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByChatroomId(chatroomId, limit = 50, offset = 0) {
    const query = `
      SELECT m.*, u.username as sender_username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chatroom_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [chatroomId, limit, offset]);
    return result.rows.reverse(); // chronological order
  }

  static async markAsRead(chatroomId, userId) {
    const query = `
      UPDATE messages 
      SET read_at = NOW() 
      WHERE chatroom_id = $1 AND sender_id != $2 AND read_at IS NULL
    `;
    await pool.query(query, [chatroomId, userId]);
  }

  static async getUnreadCount(chatroomId, userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM messages 
      WHERE chatroom_id = $1 AND sender_id != $2 AND read_at IS NULL
    `;
    const result = await pool.query(query, [chatroomId, userId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = { Message, MESSAGE_TYPES };
