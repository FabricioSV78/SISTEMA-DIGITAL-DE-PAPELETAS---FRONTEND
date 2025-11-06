// Servicio de autenticación para manejar las llamadas a la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  /**
   * Realizar login con el backend
   * @param {string} usuario - Nombre de usuario
   * @param {string} dni - DNI del usuario
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async login(usuario, dni) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario,
          dni
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el servidor');
      }

      // Si el login es exitoso, guardar token y datos del usuario
      if (data.success) {
        this.saveUserSession(data);
        return data;
      } else {
        throw new Error(data.message || 'Credenciales incorrectas');
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
    
    // Guardar en sessionStorage
    sessionStorage.setItem('userToken', token);
    sessionStorage.setItem('currentUser', JSON.stringify(user_data));
    sessionStorage.setItem('userRole', user_data.rol);
    
    // Opcional: También en localStorage para persistencia
    localStorage.setItem('currentUser', JSON.stringify(user_data));
  }

  /**
   * Obtener usuario actual de la sesión
   * @returns {Object|null} - Datos del usuario o null
   */
  getCurrentUser() {
    try {
      const userData = sessionStorage.getItem('currentUser');
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
    return sessionStorage.getItem('userToken');
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
    // Limpiar sessionStorage
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('userRole');
    
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
  }


  /**
   * Mapear rol del backend al formato del frontend
   * @param {string} backendRole - Rol del backend 
   * @returns {string} - Rol formateado para el frontend
   */
  mapRole(backendRole) {
    const roleMap = {
      'administrador': 'Administrador',
      'rrhh': 'RRHH',
    };
    
    return roleMap[backendRole.toLowerCase()] || backendRole;
  }
}

// Exportar instancia única del servicio
const authService = new AuthService();
export default authService;
