const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

// Todas las rutas están protegidas
router.use(protect);

// Obtener notificaciones
router.get('/', notificationController.getNotifications);

// Obtener contador de no leídas
router.get('/unread/count', notificationController.getUnreadCount);

// Marcar como leída
router.patch('/:id/read', notificationController.markAsRead);

// Marcar todas como leídas
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;