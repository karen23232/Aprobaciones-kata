const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  completeGeneralOnboarding,
  completeTechnicalOnboarding,
  getDashboardStats,
  getTechnicalOnboardingCalendar
} = require('../controllers/employeeController');

// Middleware de autenticación (ajusta según tu implementación)
const { protect } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// Rutas especiales (deben ir antes de las rutas con :id)
router.get('/stats/dashboard', getDashboardStats);
router.get('/calendar/technical', getTechnicalOnboardingCalendar);

// Rutas CRUD
router.route('/')
  .get(getAllEmployees)
  .post(createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

// Rutas para marcar onboardings como completados
router.patch('/:id/complete-general', completeGeneralOnboarding);
router.patch('/:id/complete-technical', completeTechnicalOnboarding);

module.exports = router;