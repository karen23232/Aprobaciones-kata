const pool = require('../config/database');

class Notification {
  
  // Crear una notificación
  static async create({ usuario_id, solicitud_id, tipo, mensaje }) {
    try {
      const query = `
        INSERT INTO Notificaciones (usuario_id, solicitud_id, tipo, mensaje, leida)
        VALUES ($1, $2, $3, $4, false)
        RETURNING *
      `;
      
      const result = await pool.query(query, [usuario_id, solicitud_id, tipo, mensaje]);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }
  
  static async getByUser(userId, limit = 10) {
    try {
      const query = `
        SELECT 
          n.*,
          s.codigo_unico,
          s.titulo as solicitud_titulo,
          s.estado as solicitud_estado
        FROM Notificaciones n
        LEFT JOIN Solicitudes s ON n.solicitud_id = s.id
        WHERE n.usuario_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async markAsRead(id, userId) {
    try {
      const query = `
        UPDATE Notificaciones 
        SET leida = true 
        WHERE id = $1 AND usuario_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [id, userId]);
      return result.rows[0];
      
    } catch (error) {
      throw error;
    }
  }
  
  static async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE Notificaciones 
        SET leida = true 
        WHERE usuario_id = $1 AND leida = false
      `;
      
      await pool.query(query, [userId]);
      return { success: true };
      
    } catch (error) {
      throw error;
    }
  }
  
  static async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM Notificaciones 
        WHERE usuario_id = $1 AND leida = false
      `;
      
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;