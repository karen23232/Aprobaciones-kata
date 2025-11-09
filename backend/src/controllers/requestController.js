const Request = require('../models/Request');
const RequestType = require('../models/RequestType');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Crear solicitud
exports.createRequest = async (req, res) => {
  try {
    const { titulo, descripcion, tipo_solicitud_id, responsable_id } = req.body;
    const solicitante_id = req.userId;
    
    // Validar que el responsable exista y sea aprobador
    const responsable = await User.findById(responsable_id);
    if (!responsable) {
      return res.status(404).json({
        success: false,
        message: 'Responsable no encontrado'
      });
    }
    
    if (!['aprobador', 'admin'].includes(responsable.rol)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario seleccionado no es un aprobador'
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
    
    // 🔔 CREAR NOTIFICACIONES PARA AMBOS USUARIOS
    try {
      const solicitante = await User.findById(solicitante_id);
      
      // Notificación para el RESPONSABLE (para que apruebe)
      await Notification.create({
        usuario_id: responsable_id,
        solicitud_id: solicitud.id,
        tipo: 'pendiente',
        mensaje: `${solicitante.nombre} ha creado una nueva solicitud: "${titulo}" que requiere tu aprobación`
      });
      
      // Notificación para el SOLICITANTE (confirmación de envío)
      await Notification.create({
        usuario_id: solicitante_id,
        solicitud_id: solicitud.id,
        tipo: 'pendiente',
        mensaje: `Tu solicitud "${titulo}" ha sido enviada y está pendiente de aprobación`
      });
    } catch (notifError) {
      console.error('Error al crear notificaciones:', notifError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: solicitud
    });
    
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud'
    });
  }
};

// Obtener solicitudes
exports.getRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    const { estado, limit, offset } = req.query;
    
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
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes'
    });
  }
};

// Obtener solicitud por ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const user = await User.findById(userId);
    
    const solicitud = await Request.getById(id);
    
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    // Verificar permisos
    const canView = user.rol === 'admin' || 
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
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud'
    });
  }
};

// 📝 NUEVO: Actualizar solicitud (editar)
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo_solicitud_id, responsable_id } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    
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
      if (!responsable || !['aprobador', 'admin'].includes(responsable.rol)) {
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
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar solicitud'
    });
  }
};

// Actualizar estado de solicitud
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentario } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    
    const solicitud = await Request.getById(id);
    
    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    // Verificar permisos
    const canUpdate = user.rol === 'admin' || solicitud.responsable_id === userId;
    
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
    
    // 🔔 CREAR NOTIFICACIÓN PARA EL SOLICITANTE
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
      
      await Notification.create({
        usuario_id: solicitud.solicitante_id,
        solicitud_id: solicitud.id,
        tipo: tipo,
        mensaje: mensaje
      });
    } catch (notifError) {
      console.error('Error al crear notificación:', notifError);
    }
    
    res.status(200).json({
      success: true,
      message: `Solicitud ${estado} exitosamente`,
      data: updated
    });
    
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar solicitud'
    });
  }
};

// Obtener estadísticas
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    const stats = await Request.getStats(userId, user.rol);
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

// Obtener tipos de solicitud
exports.getRequestTypes = async (req, res) => {
  try {
    const types = await RequestType.getAll();
    
    res.status(200).json({
      success: true,
      data: types
    });
    
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de solicitud'
    });
  }
};

// Obtener aprobadores
exports.getApprovers = async (req, res) => {
  try {
    const approvers = await User.getApprovers();
    
    res.status(200).json({
      success: true,
      data: approvers
    });
    
  } catch (error) {
    console.error('Error al obtener aprobadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener aprobadores'
    });
  }
};