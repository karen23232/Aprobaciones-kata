const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, handleValidationErrors } = require('../utils/validators');
const { protect } = require('../middlewares/auth');

// ========== RUTAS PÚBLICAS ==========

// Autenticación básica
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

// Recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

router.get('/verify-reset-token/:token', authController.verifyResetToken);

// ========== RUTAS PROTEGIDAS ==========

router.get('/profile', protect, authController.getProfile);

module.exports = router;