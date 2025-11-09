require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('---');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa!');
    console.log('⏰ Hora del servidor:', result.rows[0].now);
    console.log('---');
    
    // Verificar tabla
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuarios_ri'
      );
    `);
    console.log('📋 ¿Tabla usuarios_ri existe?', tableCheck.rows[0].exists ? '✅ SÍ' : '❌ NO');
    
    // Contar registros
    if (tableCheck.rows[0].exists) {
      const countResult = await pool.query('SELECT COUNT(*) FROM usuarios_ri');
      console.log('👥 Usuarios registrados:', countResult.rows[0].count);
    }
    
    await pool.end();
    console.log('---');
    console.log('✅ Test completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    await pool.end();
    process.exit(1);
  }
}

testConnection();