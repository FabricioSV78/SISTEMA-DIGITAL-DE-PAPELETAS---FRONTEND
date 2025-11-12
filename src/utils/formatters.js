// Funciones de formateo
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES');
};

export const formatearHora = (hora) => {
  if (!hora) return '';
  return hora;
};

export const calcularDuracion = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return '';
  
  try {
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [finH, finM] = horaFin.split(':').map(Number);
    
    const inicioMinutos = inicioH * 60 + inicioM;
    const finMinutos = finH * 60 + finM;
    
    const diferencia = finMinutos - inicioMinutos;
    
    if (diferencia <= 0) return '';
    
    const horas = Math.floor(diferencia / 60);
    const minutos = diferencia % 60;
    
    return `${horas}h ${minutos}m`;
  } catch (error) {
    return '';
  }
};
