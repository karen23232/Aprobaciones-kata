const { Sequelize } = require('sequelize');

// Obtener la URL de la base de datos desde las variables de entorno
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en las variables de entorno');
  process.exit(1);
}

console.log('📊 Configurando conexión a la base de datos...');
console.log('🔗 Database Host:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'hidden');

// Crear la instancia de Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  
  // Configuración SSL requerida para Railway
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Importante para Railway
    }
  },
  
  // Pool de conexiones
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Logging (desactivar en producción para mejor rendimiento)
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Timezone
  timezone: '-05:00', // Colombia
  
  // Otras opciones
  define: {
    timestamps: true,
    underscored: false
  }
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    console.error('💡 Verifica que DATABASE_URL esté correctamente configurada');
    return false;
  }
};

// Probar conexión al iniciar
testConnection();

module.exports = sequelize;