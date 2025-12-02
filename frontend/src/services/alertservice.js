import api from './api';

// Base URL para endpoints de alertas
const ALERT_BASE_URL = '/alerts';

/**
 * Servicio para gestionar alertas de onboarding
 */
const alertService = {
  /**
   * Obtener alertas pendientes de envío
   * @returns {Promise} Lista de empleados que necesitan alerta
   */
  getPendingAlerts: async () => {
    try {
      const response = await api.get(`${ALERT_BASE_URL}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener alertas pendientes:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener historial de alertas enviadas
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise} Historial de alertas
   */
  getAlertHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${ALERT_BASE_URL}/history?${queryString}` 
        : `${ALERT_BASE_URL}/history`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de alertas:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Ejecutar verificación y envío automático de alertas
   * @returns {Promise} Resultado del proceso
   */
  triggerAlertCheck: async () => {
    try {
      const response = await api.post(`${ALERT_BASE_URL}/check-and-send`);
      return response.data;
    } catch (error) {
      console.error('Error al ejecutar verificación de alertas:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Enviar alerta manual a un empleado específico
   * @param {number} employeeId - ID del empleado
   * @param {string} recipientEmail - Email del destinatario (opcional)
   * @returns {Promise} Confirmación de envío
   */
  sendManualAlert: async (employeeId, recipientEmail = null) => {
    try {
      const data = recipientEmail ? { recipientEmail } : {};
      const response = await api.post(`${ALERT_BASE_URL}/send/${employeeId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al enviar alerta manual:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Resetear el estado de alerta de un empleado
   * @param {number} employeeId - ID del empleado
   * @returns {Promise} Confirmación
   */
  resetAlert: async (employeeId) => {
    try {
      const response = await api.post(`${ALERT_BASE_URL}/reset/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error al resetear alerta:', error);
      throw error.response?.data || error;
    }
  }
};

export default alertService;