import api from './api';

// Base URL para endpoints de empleados
const EMPLOYEE_BASE_URL = '/employees';

/**
 * Servicio para gestionar colaboradores (empleados)
 */
const employeeService = {
  /**
   * Obtener todos los colaboradores con filtros y paginación
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Datos de empleados
   */
  getAllEmployees: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = queryString ? `${EMPLOYEE_BASE_URL}?${queryString}` : EMPLOYEE_BASE_URL;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener un colaborador por ID
   * @param {number} id - ID del empleado
   * @returns {Promise} Datos del empleado
   */
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`${EMPLOYEE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Crear un nuevo colaborador
   * @param {Object} employeeData - Datos del empleado
   * @returns {Promise} Empleado creado
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post(EMPLOYEE_BASE_URL, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar un colaborador existente
   * @param {number} id - ID del empleado
   * @param {Object} employeeData - Datos actualizados
   * @returns {Promise} Empleado actualizado
   */
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`${EMPLOYEE_BASE_URL}/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar un colaborador
   * @param {number} id - ID del empleado
   * @returns {Promise} Confirmación de eliminación
   */
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`${EMPLOYEE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Marcar onboarding general como completado
   * @param {number} id - ID del empleado
   * @returns {Promise} Empleado actualizado
   */
  completeGeneralOnboarding: async (id) => {
    try {
      const response = await api.patch(`${EMPLOYEE_BASE_URL}/${id}/complete-general`);
      return response.data;
    } catch (error) {
      console.error('Error al completar onboarding general:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Marcar onboarding técnico como completado
   * @param {number} id - ID del empleado
   * @returns {Promise} Empleado actualizado
   */
  completeTechnicalOnboarding: async (id) => {
    try {
      const response = await api.patch(`${EMPLOYEE_BASE_URL}/${id}/complete-technical`);
      return response.data;
    } catch (error) {
      console.error('Error al completar onboarding técnico:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener estadísticas del dashboard
   * @returns {Promise} Estadísticas
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get(`${EMPLOYEE_BASE_URL}/stats/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener calendario de onboardings técnicos
   * @param {Object} params - Parámetros (year, month)
   * @returns {Promise} Calendario
   */
  getTechnicalOnboardingCalendar: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.year) queryParams.append('year', params.year);
      if (params.month) queryParams.append('month', params.month);

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${EMPLOYEE_BASE_URL}/calendar/technical?${queryString}` 
        : `${EMPLOYEE_BASE_URL}/calendar/technical`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener calendario:', error);
      throw error.response?.data || error;
    }
  }
};

export default employeeService;