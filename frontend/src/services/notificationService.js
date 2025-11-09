import api from './api';

const notificationService = {
  // Obtener notificaciones
  getAll: async (limit = 10) => {
    try {
      const response = await api.get(`/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener contador de no leídas
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Marcar como leída
  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },
};

export default notificationService;