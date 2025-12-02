import axios from 'axios';

// 🎯 URL del Backend en Railway
const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://aprobaciones-kata-production.up.railway.app/api';

console.log('🔗 Conectando a API:', API_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Petición:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ Error en response:', {
      status,
      message: error.message,
      url
    });
    
    // Token expirado o inválido
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Error de CORS o red
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('🚫 Error de red. Verifica:');
      console.error('1. El backend está corriendo en Railway');
      console.error('2. La URL del backend es correcta');
      console.error('3. CORS está configurado correctamente');
      error.message = 'No se puede conectar con el servidor. Por favor, intenta más tarde.';
    }
    
    // Error 502 Bad Gateway
    if (status === 502) {
      error.message = 'El servidor no está disponible. Por favor, intenta más tarde.';
    }
    
    return Promise.reject(error);
  }
);

export default api;