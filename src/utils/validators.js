// Funciones de validación
export const validarDNI = (dni) => {
  return /^\d{8}$/.test(dni);
};

export const validarHora = (hora) => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora);
};

export const validarFormulario = (form) => {
  const errores = [];
  
  if (!form.nombreCompleto?.trim()) {
    errores.push('El nombre completo es requerido');
  }
  
  if (!validarDNI(form.dni)) {
    errores.push('El DNI debe tener 8 dígitos');
  }
  
  if (!form.area?.trim()) {
    errores.push('El área es requerida');
  }
  
  if (!form.motivo?.trim()) {
    errores.push('El motivo es requerido');
  }
  
  if (!form.fecha) {
    errores.push('La fecha es requerida');
  }
  
  if (!validarHora(form.horaSalida)) {
    errores.push('La hora de salida es requerida y debe ser válida');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
};