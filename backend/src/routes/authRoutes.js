const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  getUsersByRole,
  getManagers,
  getTechLeads
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middlewares/auth');

// ==================== RUTAS PÚBLICAS ====================
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

// ==================== RUTAS PROTEGIDAS ====================
router.get('/profile', protect, getProfile);

// ==================== RUTAS PARA OBTENER USUARIOS POR ROL ====================
// 🎯 NUEVAS: Para filtrar usuarios por rol
router.get('/users/role/:rol', protect, getUsersByRole);
router.get('/users/managers', protect, getManagers);
router.get('/users/tech-leads', protect, getTechLeads);

module.exports = router;