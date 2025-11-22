const { Pool } = require('pg');
require('dotenv').config();

// Normalizamos la URL por si Railway la envía como "postgresql://"
const rawConnectionString = process.env.DATABASE_URL;
const normalizedConnectionString = rawConnectionString.replace('postgresql://', 'postgres://');

const pool = new Pool({
  connectionString: normalizedConnectionString,
  ssl: {
    rejectUnauthorized: false, // Requerido por Railway
  },
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
