const { body, validationResult } = require('express-validator');

// Validación para registro
const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener: mayúscula, minúscula, número y carácter especial'),
  
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
  
  body('rol')
    .optional()
    .trim()
    .isIn(['solicitante', 'aprobador', 'admin'])
    .withMessage('Rol inválido'),
];

// Validación para login
const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = {
  registerValidator,
  loginValidator,
  handleValidationErrors,
};