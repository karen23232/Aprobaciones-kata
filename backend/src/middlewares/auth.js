const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../models/User');

// ==================== PROTEGER RUTAS (AUTENTICACIÓN) ====================
exports.protect = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener datos completos del usuario
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }
    
    // Guardar usuario completo en req
    req.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo
    };
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Error de autenticación'
    });
  }
};

// ==================== AUTORIZAR POR ROLES ====================
// 🎯 NUEVO: Middleware para verificar roles específicos
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// ==================== VERIFICAR SI ES ADMINISTRADOR ====================
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Administrador'
    });
  }
  next();
};

// ==================== VERIFICAR SI ES HR O ADMIN ====================
exports.isHROrAdmin = (req, res, next) => {
  if (!req.user || ![ROLES.ADMIN, ROLES.HR].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Administrador o Recursos Humanos'
    });
  }
  next();
};

// ==================== VERIFICAR SI ES TECH LEAD O ADMIN ====================
exports.isTechLeadOrAdmin = (req, res, next) => {
  if (!req.user || ![ROLES.ADMIN, ROLES.TECH_LEAD].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Administrador o Líder Técnico'
    });
  }
  next();
};

// ==================== VERIFICAR SI PUEDE GESTIONAR COLABORADORES ====================
// 🎯 Para crear/editar colaboradores (Admin + HR)
exports.canManageEmployees = (req, res, next) => {
  if (!req.user || ![ROLES.ADMIN, ROLES.HR].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para gestionar colaboradores'
    });
  }
  next();
};

// ==================== VERIFICAR SI PUEDE GESTIONAR CALENDARIO TÉCNICO ====================
// 🎯 Para editar calendario de onboardings técnicos (Admin + Tech Lead)
exports.canManageTechnicalCalendar = (req, res, next) => {
  if (!req.user || ![ROLES.ADMIN, ROLES.TECH_LEAD].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para gestionar el calendario técnico'
    });
  }
  next();
};

// ==================== VERIFICAR SI PUEDE MARCAR ONBOARDING DE BIENVENIDA ====================
// 🎯 Solo Admin y HR pueden marcar onboarding de bienvenida
exports.canMarkWelcomeOnboarding = (req, res, next) => {
  if (!req.user || ![ROLES.ADMIN, ROLES.HR].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para marcar onboarding de bienvenida'
    });
  }
  next();
};

// ==================== VERIFICAR SI PUEDE MARCAR ONBOARDING TÉCNICO ====================
// 🎯 Admin y Tech Lead pueden marcar onboarding técnico
exports.canMarkTechnicalOnboarding = (req, res, next) => {
  if (!req.user || ![ROLES.ADMIN, ROLES.TECH_LEAD].includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para marcar onboarding técnico'
    });
  }
  next();
};