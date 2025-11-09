import api from './api';

const requestService = {
  // Obtener tipos de solicitud
  getTypes: async () => {
    try {
      const response = await api.get('/requests/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener aprobadores
  getApprovers: async () => {
    try {
      const response = await api.get('/requests/approvers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener estadísticas
  getStats: async () => {
    try {
      const response = await api.get('/requests/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener solicitudes
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await api.get(`/requests?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Obtener solicitud por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Crear solicitud
  create: async (data) => {
    try {
      const response = await api.post('/requests', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // 🆕 Actualizar solicitud (editar)
  update: async (id, data) => {
    try {
      const response = await api.put(`/requests/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  // Actualizar estado (aprobar/rechazar)
  updateStatus: async (id, data) => {
    try {
      const response = await api.patch(`/requests/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },
};

export default requestService;