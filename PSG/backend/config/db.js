const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,  // 10 seconds for remote DB
  query_timeout: 30000,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL at', process.env.DB_HOST + ':' + (process.env.DB_PORT || 5432));
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ DB connection test passed'))
  .catch(err => {
    console.error('❌ DB connection FAILED:', err.message);
    console.error('   Host:', process.env.DB_HOST);
    console.error('   Port:', process.env.DB_PORT || 5432);
    console.error('   DB:  ', process.env.DB_NAME);
    console.error('   User:', process.env.DB_USER);
    console.error('\n🔧 Fix checklist:');
    console.error('   1. PostgreSQL is running on 192.168.1.20');
    console.error('   2. listen_addresses = \'*\' in postgresql.conf');
    console.error('   3. pg_hba.conf allows remote connections');
    console.error('   4. Windows Firewall allows port 5432');
    console.error('   5. Both PCs are on same network/WiFi\n');
  });

module.exports = pool;
