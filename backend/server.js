// File: server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const router = express.Router();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
// In your server.js or equivalent
const analyticsRouter = require('./analytics');
app.use('/api/analytics', analyticsRouter);
// PostgreSQL configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Create tables if not exists
const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS creators (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        channel_name VARCHAR(255) NOT NULL,
        platforms JSONB DEFAULT '[]',
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        youtube_subscribers INT DEFAULT 0,
        video_views_last_30_days INT DEFAULT 0,
        country VARCHAR(100),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile_completed BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
        creator_id INT REFERENCES creators(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (business_id, creator_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) CHECK (sender_type IN ('business', 'creator')),
        content TEXT,
        quotation JSONB,
        position VARCHAR(10) DEFAULT 'left' CHECK (position IN ('left', 'right')),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add position column if not exists (for existing databases)
    await client.query(`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS position VARCHAR(10) DEFAULT 'left' 
      CHECK (position IN ('left', 'right'))
    `);
    
    // Update existing messages with correct position
    await client.query(`
      UPDATE messages m
      SET position = 
        CASE 
          WHEN m.sender_type = 'business' THEN 'right'
          ELSE 'left'
        END
      WHERE position IS NULL OR position = 'left'
    `);
    
    console.log('Tables created/verified and position column added');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
  }
};

createTables();

const authenticateAny = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    let result = await pool.query('SELECT * FROM businesses WHERE id = $1', [decoded.id]);
    if (result.rows.length) {
      req.user = result.rows[0];
      req.userType = 'business';
      return next();
    }

    result = await pool.query('SELECT * FROM creators WHERE id = $1', [decoded.id]);
    if (result.rows.length) {
      req.user = result.rows[0];
      req.userType = 'creator';
      return next();
    }

    res.status(401).json({ error: 'User not found' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authentication middleware
const authenticate = (userType) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const table = userType === 'business' ? 'businesses' : 'creators';
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [decoded.id]);
    
    if (!rows.length) return res.status(401).json({ error: 'User not found' });
    req.user = rows[0];
    req.userType = userType;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'aryavjain1708@gmail.com', // Static sender email
    pass: 'whwk kfyv dzjz mwuu' // Your Gmail App Password
  }
});

// Email sending endpoint
app.post('/send-confirmation-email', async (req, res) => {
  try {
    const { subject, body } = req.body;
    
    // Create email options with static addresses
    let mailOptions = {
      from: 'aryavjain1708@gmail.com', // Static sender email
      to: 'aryavjain170804@gmail.com', // Static recipient email
      subject: subject,
      text: body
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent:', info.response);
    res.status(200).json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

module.exports = router;
// Routes
// Business Registration
app.post('/api/business/register', async (req, res) => {
  const { business_name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO businesses (business_name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id',
      [business_name, email, phone, hashedPassword]
    );
    
    const token = jwt.sign({ id: rows[0].id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Creator Registration
app.post('/api/creator/register', async (req, res) => {
  const { name, channel_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO creators (name, channel_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, channel_name, email, hashedPassword]
    );
    
    const token = jwt.sign({ id: rows[0].id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Business Login
app.post('/api/business/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { rows } = await pool.query('SELECT * FROM businesses WHERE email = $1', [email]);
  if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });
  
  const validPassword = await bcrypt.compare(password, rows[0].password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ id: rows[0].id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Creator Login
app.post('/api/creator/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { rows } = await pool.query('SELECT * FROM creators WHERE email = $1', [email]);
  if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });
  
  const validPassword = await bcrypt.compare(password, rows[0].password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ id: rows[0].id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ 
    token,
    profileCompleted: rows[0].profile_completed
  });
});

// Creator Profile Completion (First-time login)
app.post('/api/creator/profile', authenticate('creator'), async (req, res) => {
  const { youtube_subscribers, video_views_last_30_days, country, category, platforms } = req.body;
  
  try {
    await pool.query(
      `UPDATE creators 
       SET youtube_subscribers = $1, 
           video_views_last_30_days = $2, 
           country = $3, 
           category = $4,
           platforms = $5,
           profile_completed = true
       WHERE id = $6`,
      [youtube_subscribers, video_views_last_30_days, country, category, JSON.stringify(platforms || []), req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Get Creators List (Ranked by subscribers)
app.get('/api/creators', authenticate('business'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, channel_name, platforms, youtube_subscribers, 
              video_views_last_30_days, country, category
       FROM creators 
       WHERE profile_completed = true
       ORDER BY youtube_subscribers DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// Start Chat Session
app.post('/api/chat/start', authenticate('business'), async (req, res) => {
  const { creator_id } = req.body;
  
  try {
    const { rows } = await pool.query(
      `INSERT INTO chat_sessions (business_id, creator_id) 
       VALUES ($1, $2) 
       ON CONFLICT (business_id, creator_id) DO UPDATE SET created_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [req.user.id, creator_id]
    );
    res.json({ session_id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Send Message
app.post('/api/chat/message', authenticateAny, async (req, res) => {
  const { session_id, content, quotation } = req.body;
  const sender_type = req.user.business_name ? 'business' : 'creator';
  const position = req.userType === 'business' ? 'right' : 'left';
  
  try {
    await pool.query(
      `INSERT INTO messages (session_id, sender_type, content, quotation, position)
       VALUES ($1, $2, $3, $4, $5)`,
      [session_id, sender_type, content, JSON.stringify(quotation || null), position]
    );
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get Business Chat Sessions
app.get('/api/business/chats', authenticate('business'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cs.id AS session_id, c.id AS creator_id, c.name, c.channel_name,
             (SELECT content FROM messages WHERE session_id = cs.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
             (SELECT position FROM messages WHERE session_id = cs.id ORDER BY sent_at DESC LIMIT 1) AS last_position
       FROM chat_sessions cs
       JOIN creators c ON cs.creator_id = c.id
       WHERE cs.business_id = $1
       ORDER BY (SELECT MAX(sent_at) FROM messages WHERE session_id = cs.id) DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get Creator Chat Sessions
app.get('/api/creator/chats', authenticate('creator'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cs.id AS session_id, b.id AS business_id, b.business_name AS name,
             (SELECT content FROM messages WHERE session_id = cs.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
             (SELECT position FROM messages WHERE session_id = cs.id ORDER BY sent_at DESC LIMIT 1) AS last_position
       FROM chat_sessions cs
       JOIN businesses b ON cs.business_id = b.id
       WHERE cs.creator_id = $1
       ORDER BY (SELECT MAX(sent_at) FROM messages WHERE session_id = cs.id) DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get Chat Messages
app.get('/api/chat/:session_id/messages', authenticateAny, async (req, res) => {
  const { session_id } = req.params;
  
  try {
    const { rows } = await pool.query(
      `SELECT m.*, 
              CASE 
                WHEN m.sender_type = 'business' THEN b.business_name 
                ELSE c.name 
              END AS sender_name,
              m.position
       FROM messages m
       LEFT JOIN businesses b ON m.sender_type = 'business' 
         AND b.id = (SELECT business_id FROM chat_sessions WHERE id = m.session_id)
       LEFT JOIN creators c ON m.sender_type = 'creator' 
         AND c.id = (SELECT creator_id FROM chat_sessions WHERE id = m.session_id)
       WHERE m.session_id = $1
       ORDER BY m.sent_at ASC`,
      [session_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get chat recipient info
app.get('/api/chat/:session_id/recipient', authenticateAny, async (req, res) => {
  const { session_id } = req.params;
  
  try {
    const { rows: sessionRows } = await pool.query(
      'SELECT business_id, creator_id FROM chat_sessions WHERE id = $1',
      [session_id]
    );
    
    if (!sessionRows.length) return res.status(404).json({ error: 'Session not found' });
    
    const session = sessionRows[0];
    const response = {
      userType: req.userType
    };
    
    if (req.userType === 'business') {
      const { rows } = await pool.query(
        'SELECT id, name, channel_name FROM creators WHERE id = $1',
        [session.creator_id]
      );
      Object.assign(response, rows[0] || {});
    } else {
      const { rows } = await pool.query(
        'SELECT id, business_name AS name FROM businesses WHERE id = $1',
        [session.business_id]
      );
      Object.assign(response, rows[0] || {});
    }
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching recipient info:', err);
    res.status(500).json({ error: 'Failed to fetch recipient info' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
