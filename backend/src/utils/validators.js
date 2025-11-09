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

// ... código anterior ...

// Validación para crear solicitud
const createRequestValidator = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  
  body('tipo_solicitud_id')
    .isInt({ min: 1 })
    .withMessage('Tipo de solicitud inválido'),
  
  body('responsable_id')
    .isInt({ min: 1 })
    .withMessage('Responsable inválido'),
];

// Validación para actualizar estado
const updateStatusValidator = [
  body('estado')
    .isIn(['aprobado', 'rechazado'])
    .withMessage('Estado inválido'),
  
  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El comentario no puede exceder 1000 caracteres'),
];

module.exports = {
  registerValidator,
  loginValidator,
  handleValidationErrors,
  createRequestValidator,
  updateStatusValidator,
};