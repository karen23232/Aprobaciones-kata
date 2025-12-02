const express = require('express');
const router = express.Router();
const {
  triggerAlertCheck,
  sendManualAlertToEmployee,
  resetEmployeeAlert,
  getPendingAlerts,
  getAlertHistory
} = require('../controllers/alertController');

// Middleware de autenticación
const { protect } = require('../middlewares/auth');

// Aplicar autenticación a todas las rutas
router.use(protect);

// Obtener alertas pendientes
router.get('/pending', getPendingAlerts);

// Obtener historial de alertas
router.get('/history', getAlertHistory);

// Verificar y enviar alertas automáticamente (para cron o trigger manual)
router.post('/check-and-send', triggerAlertCheck);

// Enviar alerta manual para un empleado específico
router.post('/send/:employeeId', sendManualAlertToEmployee);

// Resetear estado de alerta de un empleado
router.post('/reset/:employeeId', resetEmployeeAlert);

module.exports = router;