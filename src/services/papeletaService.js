import { API_ENDPOINTS, getFullUrl, getAuthHeaders } from '../config/api';
import { STORAGE_KEYS, MENSAJES_ERROR } from '../config/constants';

/**
 * Servicio de papeletas para manejar las llamadas a la API
 */
class PapeletaService {
  
  /**
   * Obtener token de autorización
   */
  getAuthToken() {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Obtener headers con autenticación
   */
  getHeaders() {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
    }
    
    return getAuthHeaders(token);
  }

  // Formatea un array de errores de validación (Pydantic u otros) a un mensaje amigable
  formatValidationErrors(errorsArray) {
    if (!Array.isArray(errorsArray) || errorsArray.length === 0) return 'Hay errores de validación en los datos.';

    const fieldNamesMap = {
      nombre: 'Nombre',
      nombreCompleto: 'Nombre completo',
      dni: 'DNI',
      codigo: 'Código',
      area: 'Área',
      fundamentacion: 'Fundamentación',
      fecha: 'Fecha',
      horaSalida: 'Hora de salida',
      horaRetorno: 'Hora de retorno'
    };

    const parts = errorsArray.map(err => {
      // intentar extraer campo
      const field = err.field || (Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : null) || err.name || null;
      // intentar extraer mensaje
      let msg = err.message || err.msg || err.detail || err.message_text || JSON.stringify(err);

      const prettyField = fieldNamesMap[field] || (field ? String(field) : null) || 'Este campo';

      // Detectar mensajes de 'required' (obligatorio)
      if (/required|is required|must not be null|missing/i.test(String(msg))) {
        return `El campo ${prettyField} es obligatorio`;
      }

      // Detectar restricción de longitud y devolver un mensaje más simple
      const m = String(msg).match(/should have at least (\d+) characters/i);
      if (m) {
        return `Falta completar ${prettyField}`;
      }

      // Si el mensaje contiene 'length' o 'too short' también mapear a 'falta completar'
      if (/length|too short|min.*char/i.test(String(msg))) {
        return `Falta completar ${prettyField}`;
      }

      // Por defecto, devolver una versión legible
      return `${prettyField}: ${String(msg)}`;
    });

    // Unir en una sola frase legible
    return `Por favor corrija los siguientes errores: ${parts.join('; ')}`;
  }

  // Crear nueva papeleta
  async crearPapeleta(papeletaData) {
    try {
      // Validar datos antes de enviar
      const validacion = this.validarDatosPapeleta(papeletaData);
      if (!validacion.esValido) {
        throw new Error(validacion.mensaje);
      }

      // Preparar datos en el formato esperado por el backend
      const datosParaBackend = {
        nombre: papeletaData.nombreCompleto,
        dni: papeletaData.dni,
        codigo: papeletaData.codigo,
        area: papeletaData.area,
        cargo: papeletaData.cargo || '',
        motivo: papeletaData.motivo || '',
        oficina_entidad: papeletaData.oficinaVisitar || '',
        fundamentacion: papeletaData.fundamentacion || '',
        fecha: papeletaData.fecha,
        hora_salida: this.formatearHora(papeletaData.horaSalida),
        hora_retorno: papeletaData.horaRetorno ? this.formatearHora(papeletaData.horaRetorno) : null,
        regimen: papeletaData.regimenLaboral || ''
      };

      const response = await fetch(getFullUrl(API_ENDPOINTS.RRHH.CREAR_PAPELETA), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(datosParaBackend)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: MENSAJES_ERROR.ERROR_SERVIDOR }));

        // 401 - sesión
        if (response.status === 401) {
          // Token inválido o expirado
          sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.USER);
          throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
        }

        // 422 - validación (Pydantic) -> buscar error por campo
        if (response.status === 422) {
          const errorsArray = errorData.errors || errorData.details || null;
          if (Array.isArray(errorsArray)) {
            // Si hay un error en el campo 'codigo', devolverlo como fieldError
            const codigoErr = errorsArray.find(er => er.field === 'codigo' || (er.loc && Array.isArray(er.loc) && er.loc.includes('codigo')) );
            if (codigoErr) {
              return { exito: false, mensaje: codigoErr.message || 'Código inválido', fieldError: { field: 'codigo', message: codigoErr.message || 'Código inválido' } };
            }
            // Si no, formatear y devolver un mensaje amigable para el usuario
            const friendly = this.formatValidationErrors(errorsArray);
            return { exito: false, mensaje: friendly };
          }

          const validationErrors = errorData.errors || errorData.details || errorData.message;
          return { exito: false, mensaje: `Error de validación: ${JSON.stringify(validationErrors)}` };
        }

        // 409 - conflicto (p. ej. código duplicado) -> backend devuelve { error: { field, code, message } }
        if (response.status === 409 && errorData) {
          const errObj = errorData.error || errorData;
          if (errObj && (errObj.field === 'codigo' || String(errObj.message || '').toLowerCase().includes('codigo') || String(errObj.code || '').toLowerCase().includes('duplicate'))) {
            const friendly = 'papeleta ya registrada';
            return { exito: false, mensaje: friendly, fieldError: { field: 'codigo', message: friendly } };
          }
          return { exito: false, mensaje: errObj.message || JSON.stringify(errObj) };
        }

        // Manejo de código duplicado antiguo (400 with detail)
        if (response.status === 400 && errorData && errorData.detail) {
          if (String(errorData.detail).toLowerCase().includes('codigo')) {
            const friendly = 'papeletas ya registrada';
            return { exito: false, mensaje: friendly, fieldError: { field: 'codigo', message: friendly } };
          }
          return { exito: false, mensaje: errorData.detail };
        }

        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const resultado = await response.json();
      return {
        exito: true,
        mensaje: resultado.message || 'Papeleta registrada correctamente',
        datos: resultado
      };

    } catch (error) {
      console.error('Error al crear papeleta:', error);
      return {
        exito: false,
        mensaje: error.message || 'Error al registrar la papeleta'
      };
    }
  }

  // Formatear hora para el backend (formato HH:mm:ss.sssZ sin fecha)
  formatearHora(hora) {
    if (!hora) {
      // Si no hay hora, usar la hora actual
      return this.generarHoraActual();
    }
    
    // Si ya está en formato completo con Z, extraer solo la parte de la hora
    if (hora.includes('T') && hora.includes('Z')) {
      return hora.split('T')[1]; // Obtener solo la parte después de T
    }
    
    // Si es solo hora (HH:mm), agregar segundos y milisegundos con Z
    return `${hora}:00.000Z`;
  }

  // Validar datos de la papeleta
  validarDatosPapeleta(datos) {
    // Campos obligatorios
    const camposObligatorios = [
      { campo: 'nombreCompleto', nombre: 'Nombre completo' },
      { campo: 'dni', nombre: 'DNI' },
      { campo: 'codigo', nombre: 'Código' },
      { campo: 'area', nombre: 'Área' },
      { campo: 'fecha', nombre: 'Fecha' },
      { campo: 'horaSalida', nombre: 'Hora de salida' }
    ];

    for (const { campo, nombre } of camposObligatorios) {
      if (!datos[campo] || datos[campo].toString().trim() === '') {
        return {
          esValido: false,
          mensaje: `El campo "${nombre}" es obligatorio`
        };
      }
    }

    // Validar formato de DNI
    const validacionDNI = this.validarFormatoDNI(datos.dni);
    if (!validacionDNI.esValido) {
      return validacionDNI;
    }

    // Validar formato de fecha
    if (datos.fecha && !this.validarFecha(datos.fecha)) {
      return {
        esValido: false,
        mensaje: 'El formato de fecha no es válido'
      };
    }

    return {
      esValido: true,
      mensaje: 'Datos válidos'
    };
  }

  // Validar formato de DNI
  validarFormatoDNI(dni) {
    if (!dni) {
      return { esValido: false, mensaje: 'DNI es requerido' };
    }

    // Eliminar espacios
    const dniLimpio = dni.toString().trim();

    // Validar que solo contenga números
    if (!/^\d+$/.test(dniLimpio)) {
      return { esValido: false, mensaje: 'DNI debe contener solo números' };
    }

    // Validar longitud (debe ser exactamente 8 dígitos)
    if (dniLimpio.length !== 8) {
      return { esValido: false, mensaje: 'DNI debe tener exactamente 8 dígitos' };
    }

    return { esValido: true };
  }

  // Validar formato de fecha
  validarFecha(fecha) {
    if (!fecha) return false;
    const fechaObj = new Date(fecha);
    return fechaObj instanceof Date && !isNaN(fechaObj);
  }

  // Limpiar número de DNI (solo números)
  limpiarDNI(dni) {
    return dni.replace(/[^0-9]/g, '');
  }

  // Generar hora actual en formato del backend
  generarHoraActual() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    const milisegundos = String(ahora.getMilliseconds()).padStart(3, '0');
    
    return `${horas}:${minutos}:${segundos}.${milisegundos}Z`;
  }

  // Actualizar papeleta existente
  async actualizarPapeleta(papeletaId, papeletaData) {
    try {
      // Validar datos antes de enviar
      const validacion = this.validarDatosPapeleta(papeletaData);
      if (!validacion.esValido) {
        throw new Error(validacion.mensaje);
      }

      // Preparar datos en el formato esperado por el backend
      const datosParaBackend = {
        nombre: papeletaData.nombreCompleto,
        dni: papeletaData.dni,
        codigo: papeletaData.codigo,
        area: papeletaData.area,
        cargo: papeletaData.cargo || '',
        motivo: papeletaData.motivo || '',
        oficina_entidad: papeletaData.oficinaVisitar || '',
        fundamentacion: papeletaData.fundamentacion || '',
        fecha: papeletaData.fecha,
        hora_salida: this.formatearHora(papeletaData.horaSalida),
        hora_retorno: papeletaData.horaRetorno ? this.formatearHora(papeletaData.horaRetorno) : null,
        regimen: papeletaData.regimenLaboral || ''
      };

      const response = await fetch(getFullUrl(API_ENDPOINTS.RRHH.ACTUALIZAR_PAPELETA(papeletaId)), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(datosParaBackend)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: MENSAJES_ERROR.ERROR_SERVIDOR }));

        if (response.status === 401) {
          sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.USER);
          throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
        }

        // 422 - validación (Pydantic)
        if (response.status === 422) {
          const errorsArray = errorData.errors || errorData.details || null;
          if (Array.isArray(errorsArray)) {
            const codigoErr = errorsArray.find(er => er.field === 'codigo' || (er.loc && Array.isArray(er.loc) && er.loc.includes('codigo')) );
            if (codigoErr) {
              return { exito: false, mensaje: codigoErr.message || 'Código inválido', fieldError: { field: 'codigo', message: codigoErr.message || 'Código inválido' } };
            }
            const friendly = this.formatValidationErrors(errorsArray);
            return { exito: false, mensaje: friendly };
          }
          const validationErrors = errorData.errors || errorData.details || errorData.message;
          return { exito: false, mensaje: `Error de validación: ${JSON.stringify(validationErrors)}` };
        }

        // 409 - conflicto (p. ej. código duplicado)
        if (response.status === 409 && errorData) {
          const errObj = errorData.error || errorData;
          if (errObj && (errObj.field === 'codigo' || String(errObj.message || '').toLowerCase().includes('codigo') || String(errObj.code || '').toLowerCase().includes('duplicate'))) {
            const friendly = 'papeleta ya registrada';
            return { exito: false, mensaje: friendly, fieldError: { field: 'codigo', message: friendly } };
          }
          return { exito: false, mensaje: errObj.message || JSON.stringify(errObj) };
        }

        // 400 legacy
        if (response.status === 400 && errorData && errorData.detail) {
          if (String(errorData.detail).toLowerCase().includes('codigo')) {
            const friendly = 'papeleta ya registrada';
            return { exito: false, mensaje: friendly, fieldError: { field: 'codigo', message: friendly } };
          }
          return { exito: false, mensaje: errorData.detail };
        }

        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const resultado = await response.json();
      return {
        exito: true,
        mensaje: resultado.message || 'Papeleta actualizada correctamente',
        datos: resultado
      };

    } catch (error) {
      console.error('Error al actualizar papeleta:', error);
      return {
        exito: false,
        mensaje: error.message || 'Error al actualizar la papeleta'
      };
    }
  }

  // Obtener todas las papeletas desde el backend
  async obtenerPapeletas() {
    try {
      const response = await fetch(getFullUrl(API_ENDPOINTS.RRHH.OBTENER_PAPELETAS), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error del servidor' }));
        
        if (response.status === 401) {
          // Token inválido o expirado
          sessionStorage.removeItem('userToken');
          sessionStorage.removeItem('userData');
          throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }
        
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const papeletas = await response.json();
      
      // Transformar los datos del backend al formato del frontend
      const papeletasTransformadas = papeletas.map(papeleta => ({
        id: papeleta.id,
        codigo: papeleta.codigo,
        trabajador: papeleta.nombre,
        dni: papeleta.dni,
        area: papeleta.area,
        fecha: papeleta.fecha,
        motivo: papeleta.motivo,
        oficinaVisitar: papeleta.oficina_entidad,
        cargo: papeleta.cargo,
        fundamentacion: papeleta.fundamentacion,
        horaSalida: this.formatearHoraParaMostrar(papeleta.hora_salida),
        horaRetorno: papeleta.hora_retorno ? this.formatearHoraParaMostrar(papeleta.hora_retorno) : null,
        regimenLaboral: papeleta.regimen,
        fechaCreacion: papeleta.fecha_creacion
      }));

      // Ordenar por fecha de creación (más reciente primero)
      papeletasTransformadas.sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion);
        const fechaB = new Date(b.fechaCreacion);
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });

      return papeletasTransformadas;

    } catch (error) {
      console.error('Error al obtener papeletas:', error);
      throw error;
    }
  }

  // Formatear hora del backend para mostrar (quitar la Z y mostrar solo HH:mm)
  formatearHoraParaMostrar(hora) {
    if (!hora) return null;
    
    // Si tiene formato completo con Z, extraer solo HH:mm
    if (typeof hora === 'string' && hora.includes('Z')) {
      const horaLimpia = hora.replace('Z', '');
      return horaLimpia.substring(0, 5); // Obtener solo HH:mm
    }
    
    // Si ya es formato HH:mm:ss, obtener solo HH:mm
    if (typeof hora === 'string' && hora.includes(':')) {
      return hora.substring(0, 5);
    }
    
    return hora;
  }

  // Obtener detalles de una papeleta específica por ID
  async obtenerPapeletaPorId(papeletaId) {
    try {
      const response = await fetch(getFullUrl(API_ENDPOINTS.RRHH.OBTENER_PAPELETA(papeletaId)), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: MENSAJES_ERROR.ERROR_SERVIDOR }));
        
        if (response.status === 401) {
          // Token inválido o expirado
          sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.USER);
          throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
        }
        
        if (response.status === 404) {
          throw new Error('No se encontró la papeleta solicitada.');
        }
        
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const papeleta = await response.json();
      
      // Transformar los datos del backend al formato del frontend para mostrar
      return {
        id: papeleta.id,
        codigo: papeleta.codigo,
        trabajador: papeleta.nombre,
        dni: papeleta.dni,
        area: papeleta.area,
        cargo: papeleta.cargo || 'No especificado',
        motivo: papeleta.motivo || 'No especificado',
        oficinaVisitar: papeleta.oficina_entidad || 'No especificado',
        fundamentacion: papeleta.fundamentacion || 'No especificado',
        fecha: papeleta.fecha,
        horaSalida: this.formatearHoraParaMostrar(papeleta.hora_salida),
        horaRetorno: papeleta.hora_retorno ? this.formatearHoraParaMostrar(papeleta.hora_retorno) : 'Sin retorno',
        regimenLaboral: papeleta.regimen || 'No especificado',
        fechaCreacion: this.formatearFechaCreacion(papeleta.fecha_creacion)
      };

    } catch (error) {
      console.error('Error al obtener papeleta por ID:', error);
      throw error;
    }
  }

  // Formatear fecha de creación para mostrar
  formatearFechaCreacion(fechaCreacion) {
    if (!fechaCreacion) return 'No disponible';
    
    try {
      const fecha = new Date(fechaCreacion);
      return fecha.toLocaleString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return fechaCreacion;
    }
  }

  // Buscar empleado por DNI para autocompletar datos
  async buscarEmpleadoPorDNI(dni) {
    try {
      // Validar que el DNI tenga el formato correcto antes de hacer la consulta
      const validacionDNI = this.validarFormatoDNI(dni);
      if (!validacionDNI.esValido) {
        return {
          encontrado: false,
          mensaje: validacionDNI.mensaje,
          datos: null
        };
      }

      const response = await fetch(getFullUrl(API_ENDPOINTS.RRHH.BUSCAR_EMPLEADO(dni)), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: MENSAJES_ERROR.ERROR_SERVIDOR }));
        
        if (response.status === 401) {
          // Token inválido o expirado
          sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.USER);
          throw new Error(MENSAJES_ERROR.SESION_EXPIRADA);
        }
        
        if (response.status === 404) {
          return {
            encontrado: false,
            mensaje: 'No se encontró ningún empleado con este DNI',
            datos: null
          };
        }
        
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const resultado = await response.json();
      
      if (resultado.found && resultado.data) {
        return {
          encontrado: true,
          mensaje: 'Empleado encontrado',
          datos: {
            nombreCompleto: resultado.data.nombre,
            area: resultado.data.area,
            cargo: resultado.data.cargo,
            regimenLaboral: resultado.data.regimen,
            dni: resultado.data.dni
          }
        };
      } else {
        return {
          encontrado: false,
          mensaje: resultado.message || 'No se encontró el empleado',
          datos: null
        };
      }

    } catch (error) {
      console.error('Error al buscar empleado por DNI:', error);
      return {
        encontrado: false,
        mensaje: error.message || 'Error al buscar el empleado',
        datos: null
      };
    }
  }


}

// Exportar instancia única del servicio
const papeletaService = new PapeletaService();
export default papeletaService;