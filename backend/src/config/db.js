const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[pg_pool_error]', err.message);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[db] Client connected');
  }
});

// Helper: query with automatic client release
const query = (text, params) => pool.query(text, params);

// Helper: get a client for transactions
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
