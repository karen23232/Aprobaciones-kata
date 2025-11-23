const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 👉 Importamos la base de datos
const pool = require('./config/database');

// 👉 Importamos las rutas
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ⭐ Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',          // para desarrollo local
  process.env.CORS_ORIGIN          // para producción (Vercel)
].filter(Boolean);                  // quita los undefined/null

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 👉 Test DB route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      time: result.rows[0].now
    });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({
      success: false,
      message: 'Error conectando a la base de datos'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📝 Environment: ${process.env.NODE_ENV}
    🌐 CORS enabled for: ${process.env.CORS_ORIGIN}
  `);
});
