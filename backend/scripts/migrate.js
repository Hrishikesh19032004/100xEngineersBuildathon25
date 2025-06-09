import { pool } from '../config/database.js'; // Ensure database.js is using ES module
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createContractsTable = async (client) => {
  console.log('Creating contracts table...');

  const tableExists = await client.query(`
    SELECT EXISTS(
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'contracts'
    )
  `);

  if (!tableExists.rows[0].exists) {
    await client.query(`
      CREATE TABLE contracts (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product VARCHAR(255) NOT NULL,
        rate NUMERIC(10,2) NOT NULL,
        timeline VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        brand_signature TEXT,
        creator_signature TEXT,
        brand_signed_at TIMESTAMP,
        creator_signed_at TIMESTAMP,
        contract_hash VARCHAR(64) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Created contracts table');
  } else {
    console.log('Contracts table already exists. Skipping creation.');
  }

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_contracts_brand ON contracts(brand_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_contracts_creator ON contracts(creator_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)
  `);
};

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Starting database migration...');

    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('business', 'creator')),
        profile JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Checking and adding profile_completed column...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'profile_completed'
        ) THEN
          ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT true;
          UPDATE users SET profile_completed = false WHERE role = 'creator';
        END IF;
      END $$;
    `);

    console.log('Creating chatrooms table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chatrooms (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Adding unique constraint to chatrooms...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'chatrooms_business_id_creator_id_key' 
            AND table_name = 'chatrooms'
        ) THEN
          ALTER TABLE chatrooms ADD CONSTRAINT chatrooms_business_id_creator_id_key 
          UNIQUE(business_id, creator_id);
        END IF;
      END $$;
    `);

    console.log('Creating messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chatroom_id INTEGER REFERENCES chatrooms(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Checking and adding metadata column to messages table...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'messages' AND column_name = 'metadata'
        ) THEN
          ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}';
        END IF;
      END $$;
    `);

    // ✅ Call contract table creation
    await createContractsTable(client);

    console.log('Creating indexes...');
    const indexes = [
      { name: 'idx_users_email', table: 'users', column: 'email' },
      { name: 'idx_users_role', table: 'users', column: 'role' },
      { name: 'idx_users_profile_completed', table: 'users', column: 'profile_completed' },
      { name: 'idx_chatrooms_business', table: 'chatrooms', column: 'business_id' },
      { name: 'idx_chatrooms_creator', table: 'chatrooms', column: 'creator_id' },
      { name: 'idx_messages_chatroom', table: 'messages', column: 'chatroom_id' },
      { name: 'idx_messages_sender', table: 'messages', column: 'sender_id' },
      { name: 'idx_messages_created', table: 'messages', column: 'created_at' }
    ];

    for (const index of indexes) {
      await client.query(`
        CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table}(${index.column})
      `);
    }

    console.log('Verifying tables and columns...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'chatrooms', 'messages', 'contracts')
    `);

    const existingTables = tableCheck.rows.map(row => row.table_name);
    const requiredTables = ['users', 'chatrooms', 'messages', 'contracts'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }

    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_completed'
    `);

    if (columnCheck.rows.length === 0) {
      throw new Error('profile_completed column was not created successfully');
    }

    await client.query('COMMIT');
    console.log('✅ Migration completed');
    console.log(`✅ Verified tables: ${existingTables.join(', ')}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

const checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const main = async () => {
  console.log('🚀 Starting migration...');
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    await createTables();
    console.log('🎉 Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error during migration:', error.message);
    process.exit(1);
  }
};

main();
