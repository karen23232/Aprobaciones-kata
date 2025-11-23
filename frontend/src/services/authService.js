import api from './api';

const authService = {
  // Solicitar recuperación de contraseña
  forgotPassword: async (email, method = 'email') => {
    try {
      const response = await api.post('/auth/forgot-password', { 
        email,
        method  // 👈 IMPORTANTE: Enviar el método
      });
      return response.data;
    } catch (error) {
      // ✅ CORRECCIÓN: Asegurar que siempre haya un mensaje de error
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al solicitar recuperación de contraseña';
      
      throw new Error(errorMessage);
    }
  },

  // Restablecer contraseña con token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al restablecer la contraseña';
      
      throw new Error(errorMessage);
    }
  },

  // Verificar si un token es válido
  verifyResetToken: async (token) => {
    try {
      const response = await api.get(`/auth/verify-reset-token/${token}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Token inválido o expirado';
      
      throw new Error(errorMessage);
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error de conexión';
      
      throw new Error(errorMessage);
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error de conexión';
      
      throw new Error(errorMessage);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener perfil
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error de conexión';
      
      throw new Error(errorMessage);
    }
  },
};

export default authService;