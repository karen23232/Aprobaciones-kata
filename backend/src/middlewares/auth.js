const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
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
    
    // Agregar userId al request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};