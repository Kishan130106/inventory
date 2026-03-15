// db/pool.js - PostgreSQL connection pool
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                  // max connections in pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
  release();
  console.log('✅ PostgreSQL connected to database:', process.env.DB_NAME);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('🔌 PostgreSQL pool closed');
  process.exit(0);
});

module.exports = pool;
