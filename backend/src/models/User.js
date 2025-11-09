const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  
  // Crear usuario
  static async create({ email, password, nombre, rol = 'solicitante' }) {
    try {
      // Hashear contraseña
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const query = `
        INSERT INTO Usuarios_RI (email, password, nombre, rol)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, nombre, rol, created_at
      `;
      
      const values = [email, hashedPassword, nombre, rol];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  }
  
  // Buscar por email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM Usuarios_RI WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // Buscar por ID
  static async findById(id) {
    try {
      const query = 'SELECT id, email, nombre, rol, created_at FROM Usuarios_RI WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // Comparar contraseñas
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  // ... código anterior ...

  // Obtener usuarios aprobadores
  static async getApprovers() {
    try {
      const query = `
        SELECT id, email, nombre, rol 
        FROM Usuarios_RI 
        WHERE rol IN ('aprobador', 'admin')
        ORDER BY nombre
      `;
      
      const result = await pool.query(query);
      return result.rows;
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;


