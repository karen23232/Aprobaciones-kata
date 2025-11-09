const pool = require('../config/database');

class Request {
  
  // Generar código único
  static generateUniqueCode() {
    const prefix = 'REQ';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
  
  // Crear solicitud
  static async create({ titulo, descripcion, tipo_solicitud_id, solicitante_id, responsable_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const codigo_unico = this.generateUniqueCode();
      
      const requestQuery = `
        INSERT INTO Solicitudes (codigo_unico, titulo, descripcion, tipo_solicitud_id, solicitante_id, responsable_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const requestResult = await client.query(requestQuery, [
        codigo_unico, titulo, descripcion, tipo_solicitud_id, solicitante_id, responsable_id
      ]);
      
      const solicitud = requestResult.rows[0];
      
      // Crear historial
      const historialQuery = `
        INSERT INTO Historial_Solicitudes (solicitud_id, usuario_id, accion, estado_nuevo, comentario)
        VALUES ($1, $2, $3, $4, $5)
      `;
      
      await client.query(historialQuery, [
        solicitud.id, solicitante_id, 'crear', 'pendiente', 'Solicitud creada'
      ]);
      
      // Crear notificación para el responsable
      const notificacionQuery = `
        INSERT INTO Notificaciones (usuario_id, solicitud_id, tipo, mensaje)
        VALUES ($1, $2, $3, $4)
      `;
      
      await client.query(notificacionQuery, [
        responsable_id,
        solicitud.id,
        'nueva_solicitud',
        `Nueva solicitud: ${titulo}`
      ]);
      
      await client.query('COMMIT');
      return solicitud;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Obtener solicitudes con filtros
  static async getAll({ userId, rol, estado, limit = 50, offset = 0 }) {
    try {
      let query = `
        SELECT 
          s.*,
          ts.nombre as tipo_nombre,
          u_sol.nombre as solicitante_nombre,
          u_sol.email as solicitante_email,
          u_res.nombre as responsable_nombre,
          u_res.email as responsable_email
        FROM Solicitudes s
        LEFT JOIN Tipos_Solicitud ts ON s.tipo_solicitud_id = ts.id
        LEFT JOIN Usuarios_RI u_sol ON s.solicitante_id = u_sol.id
        LEFT JOIN Usuarios_RI u_res ON s.responsable_id = u_res.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      // Filtrar según el rol
      if (rol === 'solicitante') {
        query += ` AND s.solicitante_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      } else if (rol === 'aprobador') {
        query += ` AND s.responsable_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }
      // Si es admin, ve todas
      
      // Filtrar por estado
      if (estado) {
        query += ` AND s.estado = $${paramIndex}`;
        params.push(estado);
        paramIndex++;
      }
      
      query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Contar total
      let countQuery = `SELECT COUNT(*) FROM Solicitudes s WHERE 1=1`;
      const countParams = [];
      let countIndex = 1;
      
      if (rol === 'solicitante') {
        countQuery += ` AND s.solicitante_id = $${countIndex}`;
        countParams.push(userId);
        countIndex++;
      } else if (rol === 'aprobador') {
        countQuery += ` AND s.responsable_id = $${countIndex}`;
        countParams.push(userId);
        countIndex++;
      }
      
      if (estado) {
        countQuery += ` AND s.estado = $${countIndex}`;
        countParams.push(estado);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      
      return {
        solicitudes: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  // Obtener solicitud por ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          s.*,
          ts.nombre as tipo_nombre,
          ts.descripcion as tipo_descripcion,
          u_sol.nombre as solicitante_nombre,
          u_sol.email as solicitante_email,
          u_sol.rol as solicitante_rol,
          u_res.nombre as responsable_nombre,
          u_res.email as responsable_email,
          u_res.rol as responsable_rol
        FROM Solicitudes s
        LEFT JOIN Tipos_Solicitud ts ON s.tipo_solicitud_id = ts.id
        LEFT JOIN Usuarios_RI u_sol ON s.solicitante_id = u_sol.id
        LEFT JOIN Usuarios_RI u_res ON s.responsable_id = u_res.id
        WHERE s.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
      
    } catch (error) {
      throw error;
    }
  }
  
  // Actualizar estado (aprobar/rechazar)
  static async updateStatus({ id, estado, comentario, usuario_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Obtener estado anterior
      const solicitudAnterior = await client.query(
        'SELECT estado, solicitante_id FROM Solicitudes WHERE id = $1',
        [id]
      );
      
      if (!solicitudAnterior.rows[0]) {
        throw new Error('Solicitud no encontrada');
      }
      
      const estadoAnterior = solicitudAnterior.rows[0].estado;
      const solicitanteId = solicitudAnterior.rows[0].solicitante_id;
      
      // Actualizar solicitud
      const updateQuery = `
        UPDATE Solicitudes 
        SET estado = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [estado, id]);
      
      // Registrar en historial
      const historialQuery = `
        INSERT INTO Historial_Solicitudes 
        (solicitud_id, usuario_id, accion, estado_anterior, estado_nuevo, comentario)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await client.query(historialQuery, [
        id, usuario_id, estado, estadoAnterior, estado, comentario
      ]);
      
      // Crear notificación para el solicitante
      const mensaje = estado === 'aprobado' 
        ? '✅ Tu solicitud ha sido aprobada'
        : '❌ Tu solicitud ha sido rechazada';
      
      const notificacionQuery = `
        INSERT INTO Notificaciones (usuario_id, solicitud_id, tipo, mensaje)
        VALUES ($1, $2, $3, $4)
      `;
      
      await client.query(notificacionQuery, [
        solicitanteId,
        id,
        estado,
        mensaje
      ]);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  // Agregar este método a la clase Request en backend/src/models/Request.js

// Actualizar solicitud (editar)
// Agregar este método dentro de la clase Request en backend/src/models/Request.js
// Colócalo después del método create() y antes de getAll()

// Actualizar solicitud (editar)
static async update(id, { titulo, descripcion, tipo_solicitud_id, responsable_id, usuario_id }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Actualizar solicitud
    const updateQuery = `
      UPDATE Solicitudes 
      SET titulo = $1, 
          descripcion = $2, 
          tipo_solicitud_id = $3, 
          responsable_id = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [
      titulo, descripcion, tipo_solicitud_id, responsable_id, id
    ]);
    
    // Registrar en historial
    const historialQuery = `
      INSERT INTO Historial_Solicitudes 
      (solicitud_id, usuario_id, accion, estado_anterior, estado_nuevo, comentario)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await client.query(historialQuery, [
      id, usuario_id, 'editar', 'pendiente', 'pendiente', 'Solicitud editada'
    ]);
    
    await client.query('COMMIT');
    return result.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
  
  // Obtener historial de una solicitud
  static async getHistory(solicitudId) {
    try {
      const query = `
        SELECT 
          h.*,
          u.nombre as usuario_nombre,
          u.email as usuario_email
        FROM Historial_Solicitudes h
        LEFT JOIN Usuarios_RI u ON h.usuario_id = u.id
        WHERE h.solicitud_id = $1
        ORDER BY h.created_at DESC
      `;
      
      const result = await pool.query(query, [solicitudId]);
      return result.rows;
      
    } catch (error) {
      throw error;
    }
  }
  
  // Obtener estadísticas
  static async getStats(userId, rol) {
    try {
      let query;
      let params = [];
      
      if (rol === 'admin') {
        query = `
          SELECT 
            COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'aprobado') as aprobadas,
            COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazadas,
            COUNT(*) as total
          FROM Solicitudes
        `;
      } else if (rol === 'aprobador') {
        query = `
          SELECT 
            COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'aprobado') as aprobadas,
            COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazadas,
            COUNT(*) as total
          FROM Solicitudes
          WHERE responsable_id = $1
        `;
        params = [userId];
      } else {
        query = `
          SELECT 
            COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'aprobado') as aprobadas,
            COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazadas,
            COUNT(*) as total
          FROM Solicitudes
          WHERE solicitante_id = $1
        `;
        params = [userId];
      }
      
      const result = await pool.query(query, params);
      return result.rows[0];
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Request;