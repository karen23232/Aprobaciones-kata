const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { createRequestValidator, updateStatusValidator, handleValidationErrors } = require('../utils/validators');
const { protect } = require('../middlewares/auth');

// Todas las rutas están protegidas
router.use(protect);

// Obtener tipos de solicitud
router.get('/types', requestController.getRequestTypes);

// Obtener aprobadores
router.get('/approvers', requestController.getApprovers);

// Obtener estadísticas
router.get('/stats', requestController.getStats);

// Obtener solicitudes
router.get('/', requestController.getRequests);

// Crear solicitud
router.post(
  '/',
  createRequestValidator,
  handleValidationErrors,
  requestController.createRequest
);

// Obtener solicitud por ID
router.get('/:id', requestController.getRequestById);

// 🆕 Actualizar solicitud (editar) - NUEVO
router.put('/:id', requestController.updateRequest);

// Actualizar estado de solicitud (aprobar/rechazar)
router.patch(
  '/:id/status',
  updateStatusValidator,
  handleValidationErrors,
  requestController.updateRequestStatus
);

module.exports = router;