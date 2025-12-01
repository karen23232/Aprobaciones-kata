const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// 🎯 DEFINICIÓN DE ROLES DEL SISTEMA
const ROLES = {
  ADMIN: 'Administrador',
  HR: 'Recursos Humanos',
  TECH_LEAD: 'Líder Técnico',
  EMPLOYEE: 'Colaborador'
};

// 🎯 ROLES VÁLIDOS (para validación)
const VALID_ROLES = Object.values(ROLES);

class User {
  
  // ==================== NORMALIZAR EMAIL ====================
  static normalizeEmail(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
  }
  
  // ==================== VALIDAR ROL ====================
  static validateRole(rol) {
    if (!rol) return ROLES.EMPLOYEE; // Rol por defecto
    
    // Verificar si el rol es válido
    if (VALID_ROLES.includes(rol)) {
      return rol;
    }
    
    // Si no es válido, retornar rol por defecto
    console.warn(`⚠️ Rol inválido recibido: ${rol}. Asignando rol por defecto.`);
    return ROLES.EMPLOYEE;
  }
  
  // ==================== CREAR USUARIO ====================
  static async create(userData) {
    try {
      const { nombre, email, password, rol } = userData;

      // Validar rol antes de crear usuario
      const validatedRole = this.validateRole(rol);

      // Hashear contraseña
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const query = `
        INSERT INTO Usuarios_RI (nombre, email, password, rol)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nombre, email, rol, created_at
      `;

      const result = await pool.query(query, [
        nombre,
        this.normalizeEmail(email),
        hashedPassword,
        validatedRole
      ]);

      console.log(`✅ Usuario creado: ${result.rows[0].email} - Rol: ${result.rows[0].rol}`);
      return result.rows[0];

    } catch (error) {
      console.error('Error en User.create:', error);
      
      // Error de email duplicado
      if (error.code === '23505') {
        throw new Error('El email ya está registrado');
      }
      
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // ==================== BUSCAR POR EMAIL ====================
  static async findByEmail(email) {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      
      const query = `
        SELECT id, email, nombre, password, rol, activo
        FROM Usuarios_RI 
        WHERE LOWER(TRIM(email)) = $1
      `;

      const result = await pool.query(query, [normalizedEmail]);
      return result.rows[0] || null;
      
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  // ==================== BUSCAR POR ID ====================
  static async findById(userId) {
    try {
      const query = `
        SELECT id, email, nombre, rol, activo, created_at
        FROM Usuarios_RI 
        WHERE id = $1
      `;

      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
      
    } catch (error) {
      console.error('Error en findById:', error);
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  // ==================== COMPARAR CONTRASEÑA ====================
  static async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error en comparePassword:', error);
      throw new Error('Error al verificar contraseña');
    }
  }

  // ==================== GENERAR TOKEN DE RECUPERACIÓN ====================
  static async createPasswordResetToken(email) {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      
      const user = await this.findByEmail(normalizedEmail);
      
      if (!user) {
        console.log(`⚠️ Intento de recuperación para email no registrado: ${normalizedEmail}`);
        return null;
      }

      // Generar token aleatorio seguro (64 caracteres)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash del token para guardarlo en BD (seguridad)
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Token expira en 1 hora
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const query = `
        UPDATE Usuarios_RI 
        SET reset_password_token = $1, 
            reset_password_expires = $2
        WHERE LOWER(TRIM(email)) = $3
        RETURNING id, email, nombre
      `;

      const result = await pool.query(query, [hashedToken, expiresAt, normalizedEmail]);

      if (result.rows.length === 0) {
        throw new Error('No se pudo actualizar el token de recuperación');
      }

      console.log(`✅ Token de recuperación generado para: ${normalizedEmail}`);

      return {
        user: result.rows[0],
        resetToken // Retornamos el token sin hashear (este se envía al usuario)
      };
      
    } catch (error) {
      console.error('Error en createPasswordResetToken:', error);
      throw new Error(`Error al generar token de recuperación: ${error.message}`);
    }
  }

  // ==================== VERIFICAR TOKEN Y OBTENER USUARIO ====================
  static async findByResetToken(token) {
    try {
      if (!token) {
        return null;
      }

      // Hash del token recibido
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const query = `
        SELECT id, email, nombre, rol 
        FROM Usuarios_RI 
        WHERE reset_password_token = $1 
          AND reset_password_expires > NOW()
      `;

      const result = await pool.query(query, [hashedToken]);
      
      if (result.rows.length === 0) {
        console.log('⚠️ Token inválido o expirado');
        return null;
      }

      console.log(`✅ Token válido encontrado para: ${result.rows[0].email}`);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error en findByResetToken:', error);
      throw new Error(`Error al verificar token: ${error.message}`);
    }
  }

  // ==================== ACTUALIZAR CONTRASEÑA ====================
  static async updatePassword(userId, newPassword) {
    try {
      if (!userId || !newPassword) {
        throw new Error('User ID y contraseña son requeridos');
      }

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const query = `
        UPDATE Usuarios_RI 
        SET password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE id = $2
        RETURNING id, email, nombre
      `;

      const result = await pool.query(query, [hashedPassword, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      console.log(`✅ Contraseña actualizada para usuario: ${result.rows[0].email}`);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error en updatePassword:', error);
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  // ==================== OBTENER USUARIOS POR ROL ====================
  // 🎯 ACTUALIZADO: Ahora funciona con los nuevos roles
  static async getUsersByRole(roles) {
    try {
      // Si se pasa un string, convertirlo a array
      const roleArray = Array.isArray(roles) ? roles : [roles];
      
      // Validar que los roles sean válidos
      const validatedRoles = roleArray.filter(rol => VALID_ROLES.includes(rol));
      
      if (validatedRoles.length === 0) {
        throw new Error('No se proporcionaron roles válidos');
      }

      const query = `
        SELECT id, nombre, email, rol
        FROM Usuarios_RI 
        WHERE rol = ANY($1)
          AND activo = true
        ORDER BY nombre ASC
      `;

      const result = await pool.query(query, [validatedRoles]);
      
      console.log(`✅ Obtenidos ${result.rows.length} usuarios con roles: ${validatedRoles.join(', ')}`);
      return result.rows;
      
    } catch (error) {
      console.error('Error en getUsersByRole:', error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // ==================== OBTENER ADMINS Y HR (GESTORES) ====================
  // 🎯 NUEVO: Para obtener usuarios que pueden gestionar colaboradores
  static async getManagers() {
    try {
      return await this.getUsersByRole([ROLES.ADMIN, ROLES.HR]);
    } catch (error) {
      console.error('Error en getManagers:', error);
      throw new Error(`Error al obtener gestores: ${error.message}`);
    }
  }

  // ==================== OBTENER LÍDERES TÉCNICOS ====================
  // 🎯 NUEVO: Para asignación de onboardings técnicos
  static async getTechLeads() {
    try {
      return await this.getUsersByRole([ROLES.TECH_LEAD, ROLES.ADMIN]);
    } catch (error) {
      console.error('Error en getTechLeads:', error);
      throw new Error(`Error al obtener líderes técnicos: ${error.message}`);
    }
  }

  // ==================== VERIFICAR PERMISOS ====================
  // 🎯 NUEVO: Para verificar si un usuario tiene permisos
  static hasPermission(userRole, requiredRoles) {
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    return requiredRoles.includes(userRole);
  }

  // ==================== LIMPIAR TOKENS EXPIRADOS ====================
  static async cleanExpiredTokens() {
    try {
      const query = `
        UPDATE Usuarios_RI 
        SET reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE reset_password_expires < NOW()
          AND reset_password_token IS NOT NULL
      `;

      const result = await pool.query(query);
      
      if (result.rowCount > 0) {
        console.log(`🧹 Limpiados ${result.rowCount} tokens expirados`);
      }
      
      return result.rowCount;
      
    } catch (error) {
      console.error('Error en cleanExpiredTokens:', error);
      throw new Error(`Error al limpiar tokens: ${error.message}`);
    }
  }
}

// Exportar clase y constantes
module.exports = User;
module.exports.ROLES = ROLES;
module.exports.VALID_ROLES = VALID_ROLES;