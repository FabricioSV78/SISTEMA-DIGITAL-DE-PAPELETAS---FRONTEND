import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar filtros de papeletas
 */
export const useFiltrosPapeletas = (papeletas, elementosPorPagina = 10) => {
  const [filtros, setFiltros] = useState({
    dni: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: ''
  });

  const [papeletasFiltradas, setPapeletasFiltradas] = useState(papeletas);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  /**
   * Calcular paginación
   */
  const calcularPaginacion = useCallback((datos) => {
    const total = Math.ceil(datos.length / elementosPorPagina);
    setTotalPaginas(total || 1);
  }, [elementosPorPagina]);

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = useCallback(() => {
    let resultado = [...papeletas];

    if (filtros.dni) {
      resultado = resultado.filter(p => 
        p.dni.includes(filtros.dni)
      );
    }

    // Filtrado por rango de fechas (inclusivo)
    if (filtros.fechaInicio) {
      const inicio = new Date(filtros.fechaInicio);
      resultado = resultado.filter(p => {
        const pFecha = new Date(p.fecha);
        return pFecha >= inicio;
      });
    }

    if (filtros.fechaFin) {
      const fin = new Date(filtros.fechaFin);
      resultado = resultado.filter(p => {
        const pFecha = new Date(p.fecha);
        return pFecha <= fin;
      });
    }

    if (filtros.motivo) {
      resultado = resultado.filter(p => 
        p.motivo === filtros.motivo
      );
    }

    setPapeletasFiltradas(resultado);
    calcularPaginacion(resultado);
  }, [filtros, papeletas, calcularPaginacion]);

  /**
   * Efecto para aplicar filtros cuando cambien
   */
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  /**
   * Resetear a la primera página cuando cambien los filtros
   */
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  /**
   * Manejar cambios en filtros
   */
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      dni: '',
      fechaInicio: '',
      fechaFin: '',
      motivo: ''
    });
  };

  /**
   * Obtener datos de la página actual
   */
  const obtenerDatosPaginaActual = (datos) => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return datos.slice(inicio, fin);
  };

  /**
   * Navegación de paginación
   */
  const irAPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  return {
    filtros,
    papeletasFiltradas,
    paginaActual,
    totalPaginas,
    handleFiltroChange,
    limpiarFiltros,
    obtenerDatosPaginaActual,
    irAPagina,
    paginaAnterior,
    paginaSiguiente
  };
};
