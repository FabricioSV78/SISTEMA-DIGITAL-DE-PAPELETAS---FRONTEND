// Servicio de administración para manejar las llamadas a la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sistema-digital-de-papeletas-backend-production.up.railway.app';

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
      // Obtener token de autenticación
      const token = sessionStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/crear-usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = sessionStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/usuarios`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      const token = sessionStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      }

      // Preparar datos para enviar (solo campos que no estén vacíos)
      const updateData = {};
      
      if (userData.nombre_completo && userData.nombre_completo.trim()) {
        updateData.nombre_completo = userData.nombre_completo.trim();
      }
      
      if (userData.usuario && userData.usuario.trim()) {
        updateData.usuario = userData.usuario.trim();
      }
      
      if (userData.dni && userData.dni.trim()) {
        updateData.dni = userData.dni.trim();
      }
      
      if (userData.rol && userData.rol.trim()) {
        updateData.rol = userData.rol.toLowerCase();
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/modificar-usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = sessionStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/eliminar-usuarios/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

    if (!userData.nombre_completo || userData.nombre_completo.trim().length < 3) {
      errors.push('El nombre completo debe tener al menos 3 caracteres');
    }

    if (!userData.usuario || userData.usuario.trim().length < 3) {
      errors.push('El usuario debe tener al menos 3 caracteres');
    }

    if (!userData.dni || !/^\d{8}$/.test(userData.dni)) {
      errors.push('El DNI debe tener exactamente 8 dígitos numéricos');
    }

    if (!userData.rol || !['administrador', 'rrhh'].includes(userData.rol)) {
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
    // Limitar a máximo 8 dígitos
    return dniLimpio.substring(0, 8);
  }

  /**
   * Mapear rol del backend al formato de display
   * @param {string} rol - Rol del backend
   * @returns {string} - Nombre del rol para mostrar
   */
  mapRoleToDisplay(rol) {
    const roleNames = {
      'administrador': 'Administrador TI',
      'rrhh': 'RRHH'
    };
    return roleNames[rol] || rol;
  }
}

// Exportar instancia única del servicio
const adminService = new AdminService();
export default adminService;
