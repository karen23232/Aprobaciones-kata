const Request = require('../models/Request');
const RequestType = require('../models/RequestType');
const User = require('../models/User');
const { ROLES } = require('../models/User');
const Notification = require('../models/Notification');

// ==================== CREAR SOLICITUD ====================
exports.createRequest = async (req, res) => {
  try {
    const { titulo, descripcion, tipo_solicitud_id, responsable_id } = req.body;
    const solicitante_id = req.user.id;
    
    console.log('🔵 Creando solicitud:', { solicitante_id, responsable_id, titulo });
    
    // Validar que el responsable exista y sea gestor (Admin o HR)
    const responsable = await User.findById(responsable_id);
    if (!responsable) {
      return res.status(404).json({
        success: false,
        message: 'Responsable no encontrado'
      });
    }
    
    // ✅ CORRECCIÓN: Usar roles en español
    if (![ROLES.ADMIN, ROLES.HR].includes(responsable.rol)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario seleccionado no es un gestor válido'
      });
    }
    
    // Validar tipo de solicitud
    const tipo = await RequestType.getById(tipo_solicitud_id);
    if (!tipo) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de solicitud no encontrado'
      });
    }
    
    const solicitud = await Request.create({
      titulo,
      descripcion,
      tipo_solicitud_id,
      solicitante_id,
      responsable_id
    });
    
    console.log('✅ Solicitud creada:', solicitud.id);
    
    // 🔔 Crear notificaciones
    try {
      const solicitante = await User.findById(solicitante_id);
      
      // Notificación para el responsable
      await Notification.create({
        usuario_id: responsable_id,
        solicitud_id: solicitud.id,
        tipo: 'pendiente',
        mensaje: `${solicitante.nombre} ha creado una nueva solicitud: "${titulo}" que requiere tu aprobación`
      });
      
      // Notificación para el solicitante
      await Notification.create({
        usuario_id: solicitante_id,
        solicitud_id: solicitud.id,
        tipo: 'pendiente',
        mensaje: `Tu solicitud "${titulo}" ha sido enviada y está pendiente de aprobación`
      });
      
      // Notificar a todos los administradores
      const managers = await User.getManagers();
      
      for (const manager of managers) {
        if (manager.id !== responsable_id) {
          await Notification.create({
            usuario_id: manager.id,
            solicitud_id: solicitud.id,
            tipo: 'pendiente',
            mensaje: `Nueva solicitud creada por ${solicitante.nombre}: "${titulo}" - Asignada a ${responsable.nombre}`
          });
        }
      }
      
    } catch (notifError) {
      console.error('⚠️ Error al crear notificaciones:', notifError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: solicitud
    });
    
  } catch (error) {
    console.error('❌ Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud'
    });
  }
};

// ==================== OBTENER SOLICITUDES ====================
exports.getRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const { estado, limit, offset } = req.query;
    
    console.log('🔍 Obteniendo solicitudes para:', { userId, rol: user.rol });
    
    const result = await Request.getAll({
      userId,
      rol: user.rol,
      estado,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes'
    });
  }
};

// ==================== OBTENER SOLICITUD POR ID ====================
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const solicitud = await Request.getById(id);
    
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    // Verificar permisos
    const canView = user.rol === ROLES.ADMIN || 
                    solicitud.solicitante_id === userId || 
                    solicitud.responsable_id === userId;
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta solicitud'
      });
    }
    
    // Obtener historial
    const historial = await Request.getHistory(id);
    
    res.status(200).json({
      success: true,
      data: {
        solicitud,
        historial
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud'
    });
  }
};

// ==================== ACTUALIZAR SOLICITUD ====================
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo_solicitud_id, responsable_id } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const solicitud = await Request.getById(id);
    
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    // Solo el solicitante puede editar su solicitud
    if (solicitud.solicitante_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta solicitud'
      });
    }
    
    // Solo se pueden editar solicitudes pendientes
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden editar solicitudes pendientes'
      });
    }
    
    // Validar responsable si se cambió
    if (responsable_id && responsable_id !== solicitud.responsable_id) {
      const responsable = await User.findById(responsable_id);
      // ✅ CORRECCIÓN: Usar roles en español
      if (!responsable || ![ROLES.ADMIN, ROLES.HR].includes(responsable.rol)) {
        return res.status(400).json({
          success: false,
          message: 'El responsable seleccionado no es válido'
        });
      }
    }
    
    // Validar tipo si se cambió
    if (tipo_solicitud_id && tipo_solicitud_id !== solicitud.tipo_solicitud_id) {
      const tipo = await RequestType.getById(tipo_solicitud_id);
      if (!tipo) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de solicitud no encontrado'
        });
      }
    }
    
    const updated = await Request.update(id, {
      titulo: titulo || solicitud.titulo,
      descripcion: descripcion || solicitud.descripcion,
      tipo_solicitud_id: tipo_solicitud_id || solicitud.tipo_solicitud_id,
      responsable_id: responsable_id || solicitud.responsable_id,
      usuario_id: userId
    });
    
    res.status(200).json({
      success: true,
      message: 'Solicitud actualizada exitosamente',
      data: updated
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar solicitud'
    });
  }
};

// ==================== ACTUALIZAR ESTADO ====================
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentario } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const solicitud = await Request.getById(id);
    
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    // ✅ CORRECCIÓN: Usar roles en español
    const canUpdate = [ROLES.ADMIN, ROLES.HR].includes(user.rol) || 
                      solicitud.responsable_id === userId;
    
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta solicitud'
      });
    }
    
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden actualizar solicitudes pendientes'
      });
    }
    
    if (!['aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }
    
    const updated = await Request.updateStatus({
      id,
      estado,
      comentario: comentario || '',
      usuario_id: userId
    });
    
    // 🔔 Crear notificaciones
    try {
      let mensaje = '';
      let tipo = estado;
      
      if (estado === 'aprobado') {
        mensaje = `Tu solicitud "${solicitud.titulo}" ha sido aprobada ✅`;
        if (comentario) {
          mensaje += `. Comentario: ${comentario}`;
        }
      } else if (estado === 'rechazado') {
        mensaje = `Tu solicitud "${solicitud.titulo}" ha sido rechazada ❌`;
        if (comentario) {
          mensaje += `. Motivo: ${comentario}`;
        }
      }
      
      // Notificar al solicitante
      await Notification.create({
        usuario_id: solicitud.solicitante_id,
        solicitud_id: solicitud.id,
        tipo: tipo,
        mensaje: mensaje
      });
      
      // Notificar a administradores
      const managers = await User.getManagers();
      
      for (const manager of managers) {
        if (manager.id !== userId) {
          await Notification.create({
            usuario_id: manager.id,
            solicitud_id: solicitud.id,
            tipo: tipo,
            mensaje: `La solicitud "${solicitud.titulo}" ha sido ${estado} por ${user.nombre}`
          });
        }
      }
      
    } catch (notifError) {
      console.error('⚠️ Error al crear notificación:', notifError);
    }
    
    res.status(200).json({
      success: true,
      message: `Solicitud ${estado} exitosamente`,
      data: updated
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar solicitud'
    });
  }
};

// ==================== OBTENER ESTADÍSTICAS ====================
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    console.log('📊 Obteniendo stats para:', { userId, rol: user.rol });
    
    const stats = await Request.getStats(userId, user.rol);
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

// ==================== OBTENER TIPOS DE SOLICITUD ====================
exports.getRequestTypes = async (req, res) => {
  try {
    const types = await RequestType.getAll();
    
    res.status(200).json({
      success: true,
      data: types
    });
    
  } catch (error) {
    console.error('❌ Error al obtener tipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de solicitud'
    });
  }
};

// ==================== OBTENER GESTORES (APROBADORES) ====================
// ✅ CORRECCIÓN: Ahora usa getManagers() que retorna Admin + HR
exports.getApprovers = async (req, res) => {
  try {
    console.log('👥 Obteniendo gestores (Admin + HR)');
    
    const managers = await User.getManagers();
    
    res.status(200).json({
      success: true,
      data: managers
    });
    
  } catch (error) {
    console.error('❌ Error al obtener gestores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gestores'
    });
  }
};