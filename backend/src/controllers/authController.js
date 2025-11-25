const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../services/emailService');

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ==================== REGISTRO ====================
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'usuario'
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar usuario'
    });
  }
};

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al iniciar sesión'
    });
  }
};

// ==================== OBTENER PERFIL ====================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: user.activo
      }
    });

  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener perfil'
    });
  }
};

// ==================== FORGOT PASSWORD (ACTUALIZADO CON GMAIL) ====================
const forgotPassword = async (req, res) => {
  try {
    const { email, method } = req.body;

    // Validar email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email es inválido'
      });
    }

    // Generar token de recuperación
    const result = await User.createPasswordResetToken(email);

    if (!result) {
      // ❌ EMAIL NO EXISTE - Mensaje claro
      return res.status(404).json({
        success: false,
        message: '❌ Este email no está registrado. Por favor, regístrate primero para continuar.'
      });
    }

    const { user, resetToken } = result;

    // 🎯 MOSTRAR TOKEN EN CONSOLA DEL SERVIDOR (para desarrollo)
    console.log('\n' + '='.repeat(60));
    console.log('🔐 TOKEN DE RECUPERACIÓN DE CONTRASEÑA');
    console.log('='.repeat(60));
    console.log(`Usuario: ${user.nombre} (${user.email})`);
    console.log(`Token: ${resetToken}`);
    console.log(`Expira en: 1 hora`);
    console.log(`Método: ${method || 'email'}`);
    console.log('='.repeat(60) + '\n');

    // ✅ DIFERENCIAR POR MÉTODO
    if (method === 'token') {
      // MÉTODO TOKEN: Devolver token inmediatamente (solo desarrollo)
      return res.status(200).json({
        success: true,
        message: 'Token generado exitosamente',
        devToken: resetToken,
        userEmail: user.email,
        method: 'token'
      });
    } else {
      // MÉTODO EMAIL: Enviar correo real a través de Gmail
      try {
        await sendPasswordResetEmail(user.email, user.nombre, resetToken);
        
        return res.status(200).json({
          success: true,
          message: `✅ Se han enviado las instrucciones de recuperación al correo ${user.email}`,
          userEmail: user.email,
          method: 'email'
        });
      } catch (emailError) {
        console.error('❌ Error al enviar email:', emailError);
        
        // Si falla el envío de email, devolver el token como fallback
        return res.status(200).json({
          success: true,
          message: '⚠️ No se pudo enviar el email. Usa el token mostrado en la consola del servidor.',
          devToken: resetToken,
          userEmail: user.email,
          method: 'email',
          emailError: emailError.message
        });
      }
    }

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar la solicitud'
    });
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validaciones
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar usuario por token
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Actualizar contraseña
    await User.updatePassword(user.id, newPassword);

    console.log(`✅ Contraseña actualizada para: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al restablecer la contraseña'
    });
  }
};

// ==================== VERIFY RESET TOKEN ====================
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token es requerido'
      });
    }

    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en verifyResetToken:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al verificar el token'
    });
  }
};

// ==================== EXPORTAR TODOS LOS MÉTODOS ====================
module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyResetToken
};