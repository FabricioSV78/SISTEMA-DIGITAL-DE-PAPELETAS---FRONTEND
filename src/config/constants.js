/**
 * Constantes de la aplicación
 * Centraliza valores constantes utilizados en toda la aplicación
 */

// Roles de usuario
export const ROLES = {
  ADMINISTRADOR: 'administrador',
  ADMIN: 'admin',
  RRHH: 'rrhh',
  RRHH_VISTA: 'rrhh-vista'
};

// Motivos de papeletas
export const MOTIVOS_PAPELETA = [
  'Comisión de servicios',
  'Atención médica',
  'Capacitación',
  'Asuntos particulares'
];

// Lista de áreas (centralizada para reutilizar en formularios/autocomplete)
export const AREAS = [
  'Alcaldía',
  'Gerencia Municipal',
  'Secretaría General',
  'Asesoría Jurídica',
  'Oficina General de Administración y Finanzas',
  'Oficina de Tesorería',
  'Oficina de Tecnologías de La Información',
  'Oficina de Recursos Humanos',
  'Oficina de Abastecimiento y Control Patrimonial',
  'Oficina de Planeamiento y Presupuesto',
  'Gerencia de Administración Tributaria',
  'Gerencia Desarrollo Económico y Ambiental',
  'Gerencia de Infraestructura',
  'Gerencia de Desarrollo Territorial y Transporte',
  'Gerencia de Desarrollo Social y Humano'
];

// Regímenes laborales
export const REGIMENES_LABORALES = [
  'Decreto Legislativo N° 276',
  'Decreto Legislativo N° 728',
  'Decreto Legislativo N° 1057 - CAS',
  'Locación de Servicios'
];

// Tipos de mensaje/alerta
export const TIPOS_MENSAJE = {
  SUCCESS: 'success',
  ERROR: 'danger',
  WARNING: 'warning',
  INFO: 'info'
};

// Paginación
export const PAGINACION = {
  ELEMENTOS_POR_PAGINA: 10,
  ELEMENTOS_POR_PAGINA_OPCIONES: [5, 10, 20, 50]
};

// Validaciones
export const VALIDACIONES = {
  DNI_LENGTH: 8,
  CODIGO_LENGTH_MIN: 3,
  NOMBRE_LENGTH_MIN: 3,
  USUARIO_LENGTH_MIN: 3
};

// Rutas de navegación
export const RUTAS = {
  LOGIN: '/login',
  ADMIN: '/admin',
  RRHH: '/rrhh',
  REGISTRO: '/registro'
};

// Mensajes de error comunes
export const MENSAJES_ERROR = {
  SESION_EXPIRADA: 'No hay sesión activa. Por favor, inicie sesión nuevamente.',
  ERROR_SERVIDOR: 'Error en el servidor. Intente nuevamente.',
  ERROR_RED: 'Error de conexión. Verifique su conexión a internet.',
  CAMPOS_REQUERIDOS: 'Por favor complete todos los campos requeridos.',
  DNI_INVALIDO: 'El DNI debe tener 8 dígitos numéricos.',
  CREDENCIALES_INCORRECTAS: 'Usuario o DNI incorrectos.'
};

// Mensajes de éxito comunes
export const MENSAJES_EXITO = {
  REGISTRO_EXITOSO: 'Registro exitoso.',
  ACTUALIZACION_EXITOSA: 'Actualización exitosa.',
  ELIMINACION_EXITOSA: 'Eliminación exitosa.',
  LOGIN_EXITOSO: 'Inicio de sesión exitoso.'
};

// Formato de fecha y hora
export const FORMATO_FECHA = {
  FECHA_DISPLAY: 'DD/MM/YYYY',
  FECHA_INPUT: 'YYYY-MM-DD',
  HORA_INPUT: 'HH:mm',
  HORA_COMPLETA: 'HH:mm:ss'
};

// Claves de localStorage/sessionStorage
export const STORAGE_KEYS = {
  TOKEN: 'userToken',
  USER: 'currentUser',
  ROLE: 'userRole'
};
