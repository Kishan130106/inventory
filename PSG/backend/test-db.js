/**
 * PSG - Database Connection Test
 * Run: node test-db.js
 * This tells you exactly what is wrong with the DB connection.
 */

require('dotenv').config();
const { Client } = require('pg');

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 8000,
};

console.log('\n🔍 PSG Database Connection Test');
console.log('================================');
console.log('Host    :', config.host);
console.log('Port    :', config.port);
console.log('Database:', config.database);
console.log('User    :', config.user);
console.log('Password: [hidden]');
console.log('================================\n');

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('✅ SUCCESS — Connected to PostgreSQL!\n');
    return client.query('SELECT version(), current_database(), current_user, NOW() as time');
  })
  .then(result => {
    const row = result.rows[0];
    console.log('PostgreSQL Version :', row.version.split(' ').slice(0, 2).join(' '));
    console.log('Database           :', row.current_database);
    console.log('User               :', row.current_user);
    console.log('Server Time        :', row.time);
    console.log('\n✅ Database is ready. You can start the server now.\n');
    client.end();
  })
  .catch(err => {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error code   :', err.code);
    console.error('Error message:', err.message);
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🔧 HOW TO FIX — Follow these steps on the');
    console.error('   PostgreSQL PC (192.168.1.20):');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (err.code === 'ECONNREFUSED') {
      console.error('Problem: PostgreSQL is not accepting remote connections.\n');
      console.error('STEP 1 — Find postgresql.conf');
      console.error('  Usually at: C:\\Program Files\\PostgreSQL\\<version>\\data\\postgresql.conf');
      console.error('  Change:  #listen_addresses = \'localhost\'');
      console.error('  To:       listen_addresses = \'*\'');
      console.error('  (Remove the # at the start)\n');
      console.error('STEP 2 — Find pg_hba.conf (same folder)');
      console.error('  Add this line at the bottom:');
      console.error('  host    all    all    0.0.0.0/0    md5\n');
      console.error('STEP 3 — Restart PostgreSQL service');
      console.error('  Open Services → PostgreSQL → Restart\n');
      console.error('STEP 4 — Allow port 5432 in Windows Firewall');
      console.error('  Windows Defender Firewall → Advanced Settings');
      console.error('  → Inbound Rules → New Rule → Port → TCP 5432 → Allow\n');
    } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      console.error('Problem: Connection timed out. The other PC is not reachable.\n');
      console.error('STEP 1 — Check both PCs are on the same WiFi/network');
      console.error('STEP 2 — Ping the DB PC from this PC:');
      console.error('  Open CMD → ping 192.168.1.20');
      console.error('  If it fails, the PCs are not on the same network.\n');
      console.error('STEP 3 — Check Windows Firewall on DB PC allows port 5432');
      console.error('STEP 4 — Verify the IP is correct — run ipconfig on DB PC\n');
    } else if (err.code === '3D000') {
      console.error('Problem: Database "PSG" does not exist.\n');
      console.error('STEP 1 — Open pgAdmin on the DB PC');
      console.error('  Right-click Databases → Create → Database');
      console.error('  Name: PSG\n');
      console.error('STEP 2 — Then run backend/config/init.sql in Query Tool\n');
    } else if (err.code === '28P01' || err.code === '28000') {
      console.error('Problem: Wrong username or password.\n');
      console.error('STEP 1 — Verify in .env:');
      console.error('  DB_USER=postgres');
      console.error('  DB_PASSWORD=shubham1011\n');
      console.error('STEP 2 — In pgAdmin, right-click postgres user → Properties');
      console.error('  → Definition → Check/reset the password\n');
    } else {
      console.error('Check the error message above and verify:');
      console.error('  1. PostgreSQL is installed and running on 192.168.1.20');
      console.error('  2. The IP address is correct (run ipconfig on DB PC)');
      console.error('  3. Your .env file has the right credentials\n');
    }

    process.exit(1);
  });
