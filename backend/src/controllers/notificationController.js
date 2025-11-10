const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ CORREGIDO
    const { limit } = req.query;
    
    const notifications = await Notification.getByUser(userId, parseInt(limit) || 10);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
    
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ✅ CORREGIDO
    
    await Notification.markAsRead(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída'
    });
    
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación'
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ CORREGIDO
    
    await Notification.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
    
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones'
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ CORREGIDO
    
    const count = await Notification.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      data: { count }
    });
    
  } catch (error) {
    console.error('Error al obtener contador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contador'
    });
  }
};