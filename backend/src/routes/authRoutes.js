const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, handleValidationErrors } = require('../utils/validators');
const { protect } = require('../middlewares/auth');

// Rutas públicas
router.post(
  '/register',
  registerValidator,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  loginValidator,
  handleValidationErrors,
  authController.login
);

// Rutas protegidas
router.get('/profile', protect, authController.getProfile);

module.exports = router;