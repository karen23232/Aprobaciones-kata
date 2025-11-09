const pool = require('../config/database');

class RequestType {
  
  static async getAll() {
    try {
      const query = `
        SELECT * FROM Tipos_Solicitud 
        WHERE activo = true 
        ORDER BY nombre
      `;
      
      const result = await pool.query(query);
      return result.rows;
      
    } catch (error) {
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const query = 'SELECT * FROM Tipos_Solicitud WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RequestType;