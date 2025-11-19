import { API_ENDPOINTS, getFullUrl, getAuthHeaders } from '../config/api';
import { STORAGE_KEYS, MENSAJES_ERROR, VALIDACIONES } from '../config/constants';

/**
 * Servicio de administración para manejar las llamadas a la API
 */
class AdminService {
  /**
   * Crear nuevo usuario
   * @param {Object} userData - Datos del usuario a crear
   * @param {string} userData.nombre_completo - Nombre completo del usuario
   * @param {string} userData.usuario - Nombre de usuario
   * @param {string} userData.dni - DNI del usuario
   * @param {string} userData.rol - Rol del usuario ("administrador" o "rrhh")
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async crearUsuario(userData) {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
      }

      const response = await fetch(getFullUrl(API_ENDPOINTS.ADMIN.CREAR_USUARIO), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          nombre_completo: userData.nombre_completo,
          usuario: userData.usuario,
          dni: userData.dni,
          rol: userData.rol
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'El usuario ya existe');
      }

      return data;

    } catch (error) {
      console.error('Error en crearUsuario:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de usuarios desde la API
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async obtenerUsuarios() {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
      }

      const response = await fetch(getFullUrl(API_ENDPOINTS.ADMIN.OBTENER_USUARIOS), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener usuarios');
      }

      const usuarios = await response.json();
      return usuarios;

    } catch (error) {
      console.error('Error en obtenerUsuarios:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario existente
   * @param {number} usuarioId - ID del usuario a actualizar
   * @param {Object} userData - Datos del usuario a actualizar
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async actualizarUsuario(usuarioId, userData) {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
      }

      // Preparar datos para enviar (solo campos que no estén vacíos)
      const updateData = {};
      
      if (userData.nombre_completo?.trim()) {
        updateData.nombre_completo = userData.nombre_completo.trim();
      }
      
      if (userData.usuario?.trim()) {
        updateData.usuario = userData.usuario.trim();
      }
      
      if (userData.dni?.trim()) {
        updateData.dni = userData.dni.trim();
      }
      
      if (userData.rol?.trim()) {
        updateData.rol = userData.rol.toLowerCase();
      }

      const response = await fetch(getFullUrl(API_ENDPOINTS.ADMIN.ACTUALIZAR_USUARIO(usuarioId)), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        if (response.status === 400) {
          throw new Error(data.detail || 'Error de validación en los datos');
        }
        throw new Error(data.message || data.detail || 'Error al actualizar usuario');
      }

      return data;

    } catch (error) {
      console.error('Error en actualizarUsuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario existente
   * @param {number} usuarioId - ID del usuario a eliminar
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async eliminarUsuario(usuarioId) {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
      }

      const response = await fetch(getFullUrl(API_ENDPOINTS.ADMIN.ELIMINAR_USUARIO(usuarioId)), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        if (response.status === 400) {
          throw new Error(data.detail || 'No se puede eliminar el último administrador del sistema');
        }
        throw new Error(data.message || data.detail || 'Error al eliminar usuario');
      }

      return data;

    } catch (error) {
      console.error('Error en eliminarUsuario:', error);
      throw error;
    }
  }

  /**
   * Validar datos del usuario antes de enviar
   * @param {Object} userData - Datos a validar
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validarDatosUsuario(userData) {
    const errors = [];

    if (!userData.nombre_completo || userData.nombre_completo.trim().length < VALIDACIONES.NOMBRE_LENGTH_MIN) {
      errors.push(`El nombre completo debe tener al menos ${VALIDACIONES.NOMBRE_LENGTH_MIN} caracteres`);
    }

    if (!userData.usuario || userData.usuario.trim().length < VALIDACIONES.USUARIO_LENGTH_MIN) {
      errors.push(`El usuario debe tener al menos ${VALIDACIONES.USUARIO_LENGTH_MIN} caracteres`);
    }

    if (!userData.dni || !/^\d{8}$/.test(userData.dni)) {
      errors.push(MENSAJES_ERROR.DNI_INVALIDO);
    }

    if (!userData.rol || !['administrador', 'rrhh', 'rrhh-vista'].includes(userData.rol)) {
      errors.push('Debe seleccionar un rol válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar y formatear DNI (solo números, máximo 8 dígitos)
   * @param {string} dni - DNI a validar
   * @returns {string} - DNI limpio (solo números)
   */
  validarFormatoDNI(dni) {
    // Remover todo lo que no sea número
    const dniLimpio = dni.replace(/\D/g, '');
    // Limitar a máximo según constante
    return dniLimpio.substring(0, VALIDACIONES.DNI_LENGTH);
  }

  /**
   * Mapear rol del backend al formato de display
   * @param {string} rol - Rol del backend
   * @returns {string} - Nombre del rol para mostrar
   */
  mapRoleToDisplay(rol) {
    const roleNames = {
      'administrador': 'Administrador TI',
      'rrhh': 'RRHH',
      'rrhh-vista': 'RRHH Vista'
    };
    return roleNames[rol] || rol;
  }
}

// Exportar instancia única del servicio
const adminService = new AdminService();
export default adminService;
