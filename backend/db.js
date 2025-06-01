const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const port = 5003;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'contractdb',
  password: 'aryav',
  port: 5432,
});

// Function to create table if it doesn't exist
async function createTableIfNotExists() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      brand_name VARCHAR(255) NOT NULL,
      influencer_name VARCHAR(255) NOT NULL,
      product VARCHAR(255) NOT NULL,
      rate NUMERIC(10,2) NOT NULL,
      timeline VARCHAR(255) NOT NULL,
      contract_hash VARCHAR(64) NOT NULL,
      contract_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
      brand_signature TEXT,
      influencer_signature TEXT,
      brand_signed_at TIMESTAMP,
      influencer_signed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    );`);
    console.log('Table created or already exists');
  } catch (err) {
    console.error('Error creating table:', err);
    throw err;
  }
}

// Connect to database and create table
pool.connect()
  .then(() => {
    console.log('Connected to Postgres');
    return createTableIfNotExists();
  })
  .catch(err => {
    console.error('Postgres connection or table creation error:', err);
    process.exit(1);
  });

app.post('/api/contracts', async (req, res) => {
  const { brandName, influencerName, product, rate, timeline } = req.body;

  const rateNum = parseFloat(rate);
  if (isNaN(rateNum)) {
    return res.status(400).json({ error: 'Invalid rate, must be a number' });
  }

  try {
    const contractString = `${brandName}-${influencerName}-${product}-${rateNum}-${timeline}`;
    const contractHash = crypto.createHash('sha256').update(contractString).digest('hex');

    const result = await pool.query(
      `INSERT INTO contracts 
        (brand_name, influencer_name, product, rate, timeline, contract_hash, contract_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [brandName, influencerName, product, rateNum, timeline, contractHash, 'pending']
    );

    res.status(201).json({
      message: 'Contract created successfully!',
      contract: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving contract:', error);
    res.status(500).json({ error: 'Failed to save contract' });
  }
});

app.get('/api/contracts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ contract: result.rows[0] });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

app.post('/api/contracts/:id/sign-brand', async (req, res) => {
  const { id } = req.params;
  const { signature } = req.body;

  if (!signature) {
    return res.status(400).json({ error: 'Signature data is required' });
  }

  try {
    const contractResult = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const contract = contractResult.rows[0];
    const newStatus = contract.influencer_signature ? 'fully_signed' : 'partially_signed';

    const result = await pool.query(
      `UPDATE contracts 
       SET brand_signature = $1, brand_signed_at = CURRENT_TIMESTAMP, contract_status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [signature, newStatus, id]
    );

    res.json({
      message: 'Brand signature added successfully!',
      contract: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding brand signature:', error);
    res.status(500).json({ error: 'Failed to add signature' });
  }
});

app.post('/api/contracts/:id/sign-influencer', async (req, res) => {
  const { id } = req.params;
  const { signature } = req.body;

  if (!signature) {
    return res.status(400).json({ error: 'Signature data is required' });
  }

  try {
    const contractResult = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const contract = contractResult.rows[0];
    const newStatus = contract.brand_signature ? 'fully_signed' : 'partially_signed';

    const result = await pool.query(
      `UPDATE contracts 
       SET influencer_signature = $1, influencer_signed_at = CURRENT_TIMESTAMP, contract_status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [signature, newStatus, id]
    );

    res.json({
      message: 'Influencer signature added successfully!',
      contract: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding influencer signature:', error);
    res.status(500).json({ error: 'Failed to add signature' });
  }
});

app.get('/api/contracts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC');
    res.json({ contracts: result.rows });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});