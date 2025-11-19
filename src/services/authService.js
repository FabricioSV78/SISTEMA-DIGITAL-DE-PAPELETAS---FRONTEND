import { API_ENDPOINTS, getFullUrl } from '../config/api';
import { STORAGE_KEYS, MENSAJES_ERROR, ROLES } from '../config/constants';

/**
 * Servicio de autenticación para manejar las llamadas a la API
 */
class AuthService {
  /**
   * Realizar login con el backend
   * @param {string} usuario - Nombre de usuario
   * @param {string} dni - DNI del usuario
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async login(usuario, dni) {
    try {
      const response = await fetch(getFullUrl(API_ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, dni })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || MENSAJES_ERROR.ERROR_SERVIDOR);
      }

      if (data.success) {
        this.saveUserSession(data);
        return data;
      } else {
        throw new Error(data.message || MENSAJES_ERROR.CREDENCIALES_INCORRECTAS);
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Guardar sesión del usuario
   * @param {Object} loginResponse - Respuesta del login
   */
  saveUserSession(loginResponse) {
    const { user_data, token } = loginResponse;
    
    // Guardar en sessionStorage usando constantes
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user_data));
    sessionStorage.setItem(STORAGE_KEYS.ROLE, user_data.rol);
    
    // Opcional: También en localStorage para persistencia
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user_data));
  }

  /**
   * Obtener usuario actual de la sesión
   * @returns {Object|null} - Datos del usuario o null
   */
  getCurrentUser() {
    try {
      const userData = sessionStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  /**
   * Obtener token de autenticación
   * @returns {string|null} - Token o null
   */
  getToken() {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} - True si está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Cerrar sesión del usuario
   */
  logout() {
    // Limpiar sessionStorage usando constantes
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.ROLE);
    
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Mapear rol del backend al formato del frontend
   * @param {string} backendRole - Rol del backend 
   * @returns {string} - Rol formateado para el frontend
   */
  mapRole(backendRole) {
    const roleMap = {
      [ROLES.ADMINISTRADOR]: 'Administrador',
      [ROLES.RRHH]: 'RRHH',
      [ROLES.RRHH_VISTA]: 'RRHH',
    };
    
    return roleMap[backendRole.toLowerCase()] || backendRole;
  }

  /**
   * Verificar si el usuario tiene permisos para registrar papeletas
   * @returns {boolean} - True si puede registrar
   */
  canRegisterPapeletas() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Solo el rol RRHH (completo) puede registrar
    return user.rol.toLowerCase() === ROLES.RRHH;
  }

  /**
   * Verificar si el usuario es de solo lectura
   * @returns {boolean} - True si es solo lectura
   */
  isReadOnlyUser() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.rol.toLowerCase() === ROLES.RRHH_VISTA;
  }
}

// Exportar instancia única del servicio
const authService = new AuthService();
export default authService;
