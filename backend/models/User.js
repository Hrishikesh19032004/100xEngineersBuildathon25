// // models/User.js
// const { pool } = require('../config/database');
// const bcrypt = require('bcryptjs');

// class User {
//   static async create({ email, password, username, role, profile = {} }) {
//     const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
    
//     const query = `
//       INSERT INTO users (email, password, username, role, profile, created_at, updated_at)
//       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
//       RETURNING id, email, username, role, profile, created_at
//     `;
    
//     const values = [email, hashedPassword, username, role, JSON.stringify(profile)];
//     const result = await pool.query(query, values);
//     return result.rows[0];
//   }

//   static async findByEmail(email) {
//     const query = 'SELECT * FROM users WHERE email = $1';
//     const result = await pool.query(query, [email]);
//     return result.rows[0];
//   }

//   static async findById(id) {
//     const query = 'SELECT id, email, username, role, profile, created_at FROM users WHERE id = $1';
//     const result = await pool.query(query, [id]);
//     return result.rows[0];
//   }

//   static async findByRole(role) {
//     const query = 'SELECT id, email, username, role, profile, created_at FROM users WHERE role = $1';
//     const result = await pool.query(query, [role]);
//     return result.rows;
//   }

//   static async updateProfile(id, profile) {
//     const query = `
//       UPDATE users 
//       SET profile = $1, updated_at = NOW() 
//       WHERE id = $2 
//       RETURNING id, email, username, role, profile, updated_at
//     `;
//     const result = await pool.query(query, [JSON.stringify(profile), id]);
//     return result.rows[0];
//   }

//   static async verifyPassword(plainPassword, hashedPassword) {
//     return await bcrypt.compare(plainPassword, hashedPassword);
//   }
// }

// module.exports = User;
// Enhanced models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, username, role, profile = {} }) {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
    
    const query = `
      INSERT INTO users (email, password, username, role, profile, profile_completed, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, username, role, profile, profile_completed, created_at
    `;
    
    // For creators, set profile_completed to false initially
    const profileCompleted = role === 'creator' ? false : true;
    const values = [email, hashedPassword, username, role, JSON.stringify(profile), profileCompleted];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, username, role, profile, profile_completed, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByRole(role) {
    const query = 'SELECT id, email, username, role, profile, profile_completed, created_at FROM users WHERE role = $1 AND (role != \'creator\' OR profile_completed = true)';
    const result = await pool.query(query, [role]);
    return result.rows;
  }

  static async updateProfile(id, profile) {
    const query = `
      UPDATE users 
      SET profile = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, email, username, role, profile, profile_completed, updated_at
    `;
    const result = await pool.query(query, [JSON.stringify(profile), id]);
    return result.rows[0];
  }

  static async completeCreatorProfile(id, profileData) {
    const query = `
      UPDATE users 
      SET profile = $1, profile_completed = true, updated_at = NOW() 
      WHERE id = $2 AND role = 'creator'
      RETURNING id, email, username, role, profile, profile_completed, updated_at
    `;
    const result = await pool.query(query, [JSON.stringify(profileData), id]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async isProfileCompleted(id) {
    const query = 'SELECT profile_completed FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0]?.profile_completed || false;
  }
}

module.exports = User;