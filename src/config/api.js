/**
 * Configuración de la API
 * Centraliza la configuración de endpoints y URLs de la API
 */

// URL base de la API - usa variable de entorno o fallback a localhost
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify'
  },
  
  // Administración
  ADMIN: {
    CREAR_USUARIO: '/api/admin/crear-usuarios',
    OBTENER_USUARIOS: '/api/admin/usuarios',
    ACTUALIZAR_USUARIO: (id) => `/api/admin/modificar-usuarios/${id}`,
    ELIMINAR_USUARIO: (id) => `/api/admin/eliminar-usuarios/${id}`
  },
  
  // RRHH - Papeletas
  RRHH: {
    CREAR_PAPELETA: '/api/rrhh/crear-papeletas',
    OBTENER_PAPELETAS: '/api/rrhh/papeletas',
    OBTENER_PAPELETA: (id) => `/api/rrhh/papeletas/${id}`,
    ACTUALIZAR_PAPELETA: (id) => `/api/rrhh/actualizar/papeletas/${id}`,
    BUSCAR_EMPLEADO: (dni) => `/api/rrhh/empleado/${dni}`,
    ESTADISTICAS: '/api/rrhh/estadisticas'
  }
};

/**
 * Obtener URL completa del endpoint
 * @param {string} endpoint - Endpoint de la API
 * @returns {string} URL completa
 */
export const getFullUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Configuración de headers por defecto
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

/**
 * Obtener headers con autenticación
 * @param {string} token - Token de autenticación
 * @returns {Object} Headers con token
 */
export const getAuthHeaders = (token) => {
  return {
    ...DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Timeouts para peticiones
 */
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 segundos
  UPLOAD: 60000,  // 60 segundos para uploads
  DOWNLOAD: 90000 // 90 segundos para downloads
};
