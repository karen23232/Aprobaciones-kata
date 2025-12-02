require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { setupCronJobs } = require('./utils/cronJobs');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const alertRoutes = require('./routes/Alertroutes');

const app = express();

// ==================== CONFIGURACIÓN CORS ====================
// Obtener los orígenes permitidos desde las variables de entorno
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173'
    ];

console.log('🔐 CORS configurado para los siguientes orígenes:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (Postman, apps móviles, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ Origen rechazado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Manejar preflight requests explícitamente
app.options('*', cors(corsOptions));

// ==================== MIDDLEWARES ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de peticiones en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
  });
}

// ==================== RUTAS ====================
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/alerts', alertRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Sistema de Gestión de Onboarding',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      alerts: '/api/alerts',
      health: '/api/health'
    }
  });
});

// Ruta para verificar el estado de la API
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado por política CORS',
      origin: req.headers.origin
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Sincronizar modelos con la base de datos
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos');
    }

    // Configurar cron jobs para alertas automáticas
    const cronJobs = setupCronJobs();
    console.log('✅ Tareas programadas configuradas');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 Servidor corriendo en puerto', PORT);
      console.log('🌍 Entorno:', process.env.NODE_ENV || 'development');
      console.log('📅 Fecha de inicio:', new Date().toLocaleString('es-CO'));
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM recibido. Cerrando servidor...');
      server.close(async () => {
        console.log('✅ Servidor cerrado');
        await sequelize.close();
        console.log('✅ Conexión a BD cerrada');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

module.exports = app;