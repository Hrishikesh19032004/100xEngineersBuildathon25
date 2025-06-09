// models/Chatroom.js
const { pool } = require('../config/database');

class Chatroom {
  static async create(businessId, creatorId) {
    // Check if chatroom already exists
    const existingQuery = `
      SELECT * FROM chatrooms 
      WHERE business_id = $1 AND creator_id = $2
    `;
    const existing = await pool.query(existingQuery, [businessId, creatorId]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const query = `
      INSERT INTO chatrooms (business_id, creator_id, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [businessId, creatorId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             b.username as business_username, b.email as business_email,
             cr.username as creator_username, cr.email as creator_email
      FROM chatrooms c
      JOIN users b ON c.business_id = b.id
      JOIN users cr ON c.creator_id = cr.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByBusinessId(businessId) {
    const query = `
      SELECT c.*, 
             cr.username as creator_username, cr.email as creator_email, cr.profile as creator_profile
      FROM chatrooms c
      JOIN users cr ON c.creator_id = cr.id
      WHERE c.business_id = $1
      ORDER BY c.updated_at DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  }

  static async findByCreatorId(creatorId) {
    const query = `
      SELECT c.*, 
             b.username as business_username, b.email as business_email, b.profile as business_profile
      FROM chatrooms c
      JOIN users b ON c.business_id = b.id
      WHERE c.creator_id = $1
      ORDER BY c.updated_at DESC
    `;
    const result = await pool.query(query, [creatorId]);
    return result.rows;
  }

  static async updateLastActivity(id) {
    const query = 'UPDATE chatrooms SET updated_at = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async hasAccess(chatroomId, userId) {
    const query = `
      SELECT 1 FROM chatrooms 
      WHERE id = $1 AND (business_id = $2 OR creator_id = $2)
    `;
    const result = await pool.query(query, [chatroomId, userId]);
    return result.rows.length > 0;
  }
}

module.exports = Chatroom;
