require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { setupCronJobs } = require('./utils/cronJobs');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const alertRoutes = require('./routes/Alertroutes');
// Si mantienes notificaciones del sistema anterior:
// const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/alerts', alertRoutes);
// app.use('/api/notifications', notificationRoutes); // Si lo mantienes

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Sistema de Gestión de Onboarding',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      alerts: '/api/alerts'
    }
  });
});

// Ruta para verificar el estado de la API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: sequelize.authenticate() ? 'Connected' : 'Disconnected'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
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
    // NOTA: En producción usa migraciones en lugar de sync()
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true }); // alter modifica las tablas existentes
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