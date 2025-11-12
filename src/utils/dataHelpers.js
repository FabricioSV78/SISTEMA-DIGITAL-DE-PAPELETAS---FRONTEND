// Funciones auxiliares para manejo de datos
export const filtrarPapeletas = (papeletas, filtros) => {
  if (!papeletas) return [];
  
  return papeletas.filter(papeleta => {
    const cumpleDNI = !filtros.dni || papeleta.dni.includes(filtros.dni);
    const cumpleFecha = !filtros.fecha || papeleta.fecha === filtros.fecha;
    const cumpleMotivo = !filtros.motivo || papeleta.motivo === filtros.motivo;
    
    return cumpleDNI && cumpleFecha && cumpleMotivo;
  });
};

export const ordenarPapeletas = (papeletas, criterio = 'fecha') => {
  if (!papeletas) return [];
  
  return [...papeletas].sort((a, b) => {
    switch (criterio) {
      case 'fecha':
        return new Date(b.fecha) - new Date(a.fecha);
      case 'nombre':
        return a.nombreCompleto.localeCompare(b.nombreCompleto);
      case 'area':
        return a.area.localeCompare(b.area);
      default:
        return 0;
    }
  });
};