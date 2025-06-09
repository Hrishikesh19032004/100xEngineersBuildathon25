// // models/Contract.js
// const { pool } = require('../config/database');
// const crypto = require('crypto');

// class Contract {
//   static async create({ brandId, creatorId, product, rate, timeline }) {
//     const query = `
//       INSERT INTO contracts 
//         (brand_id, creator_id, product, rate, timeline, status, contract_hash)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *
//     `;

//     const contractString = `${brandId}-${creatorId}-${product}-${rate}-${timeline}`;
//     const contractHash = crypto.createHash('sha256').update(contractString).digest('hex');

//     const values = [brandId, creatorId, product, rate, timeline, 'pending', contractHash];
//     const result = await pool.query(query, values);
//     return result.rows[0];
//   }

//   static async findById(id) {
//     const query = 'SELECT * FROM contracts WHERE id = $1';
//     const result = await pool.query(query, [id]);
//     return result.rows[0];
//   }

//   static async findByChatroomId(chatroomId) {
//     const query = `
//       SELECT c.*
//       FROM contracts c
//       JOIN chatrooms cr ON c.brand_id = cr.business_id AND c.creator_id = cr.creator_id
//       WHERE cr.id = $1
//     `;
//     const result = await pool.query(query, [chatroomId]);
//     return result.rows;
//   }

//   static async signContract(id, userId, signature) {
//     const query = `
//       UPDATE contracts
//       SET 
//         ${userId.role === 'business' ? 'brand_signature' : 'creator_signature'} = $1,
//         ${userId.role === 'business' ? 'brand_signed_at' : 'creator_signed_at'} = NOW(),
//         status = CASE 
//           WHEN ${userId.role === 'business' ? 'creator_signature IS NOT NULL' : 'brand_signature IS NOT NULL'} 
//             THEN 'fully_signed'
//           ELSE 'partially_signed'
//         END,
//         updated_at = NOW()
//       WHERE id = $2 AND status != 'fully_signed'
//       RETURNING *
//     `;
//     const values = [signature, id];
//     const result = await pool.query(query, values);
//     return result.rows[0];
//   }

//   static async getContractStatus(id) {
//     const query = 'SELECT status FROM contracts WHERE id = $1';
//     const result = await pool.query(query, [id]);
//     return result.rows[0]?.status;
//   }
// }

// module.exports = Contract;
const { pool } = require('../config/database');
const crypto = require('crypto');

class Contract {
  static async create({ brandId, creatorId, product, rate, timeline }) {
    const query = `
      INSERT INTO contracts 
        (brand_id, creator_id, product, rate, timeline, status, contract_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const contractString = `${brandId}-${creatorId}-${product}-${rate}-${timeline}`;
    const contractHash = crypto.createHash('sha256').update(contractString).digest('hex');

    const values = [brandId, creatorId, product, rate, timeline, 'pending', contractHash];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM contracts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByChatroomId(chatroomId) {
    const query = `
      SELECT c.*
      FROM contracts c
      JOIN chatrooms cr ON c.brand_id = cr.business_id AND c.creator_id = cr.creator_id
      WHERE cr.id = $1
    `;
    const result = await pool.query(query, [chatroomId]);
    return result.rows;
  }

  static async signContract(id, userId, signature) {
    const query = `
      UPDATE contracts
      SET 
        ${userId.role === 'business' ? 'brand_signature' : 'creator_signature'} = $1,
        ${userId.role === 'business' ? 'brand_signed_at' : 'creator_signed_at'} = NOW(),
        status = CASE 
          WHEN ${userId.role === 'business' ? 'creator_signature IS NOT NULL' : 'brand_signature IS NOT NULL'} 
            THEN 'fully_signed'
          ELSE 'partially_signed'
        END,
        updated_at = NOW()
      WHERE id = $2 AND status != 'fully_signed'
      RETURNING *
    `;
    const values = [signature, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getContractStatus(id) {
    const query = 'SELECT status FROM contracts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0]?.status;
  }
}

module.exports = Contract;