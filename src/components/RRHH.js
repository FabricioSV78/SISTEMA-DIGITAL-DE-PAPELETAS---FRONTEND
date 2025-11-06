import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import papeletaService from '../services/papeletaService';

const RRHH = () => {
  // Estados para las estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalPapeletas: 120,
    papeletasHoy: 0,
    areaMasSolicitada: 'N/A',
    papeletasSinRetorno: 0
  });

  // Estados para los filtros de búsqueda
  const [filtros, setFiltros] = useState({
    dni: '',
    fecha: '',
    area: ''
  });

  // Manejar checkbox "Sin retorno" - Versión React del script original
  const handleSinRetornoChange = (e) => {
    const checked = e.target.checked;
    setSinRetorno(checked);
    
    // Si está marcado "Sin retorno", limpiar la hora de retorno
    if (checked) {
      setPapeletaForm(prev => ({
        ...prev,
        horaRetorno: ''
      }));
    }
  };


  // Estados para el formulario de nueva papeleta
  const [papeletaForm, setPapeletaForm] = useState({
    nombreCompleto: '',
    dni: '',
    codigo: '',
    area: '',
    cargo: '',
    regimenLaboral: '',
    oficinaVisitar: '',
    motivo: '',
    fundamentacion: '',
    fecha: '',
    horaSalida: '',
    horaRetorno: ''
  });

  // Estados para los checkboxes "Sin retorno"
  const [sinRetorno, setSinRetorno] = useState(false);

  // Estados para la gestión de carga y mensajes
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estado para las papeletas
  const [papeletas, setPapeletas] = useState([]);
  const [cargandoPapeletas, setCargandoPapeletas] = useState(true);
  const [errorPapeletas, setErrorPapeletas] = useState('');



  // Estado para papeletas filtradas
  const [papeletasFiltradas, setPapeletasFiltradas] = useState(papeletas);

  // Estados para el modal de detalles de papeleta
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [papeletaDetalle, setPapeletaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(10); // Número de papeletas por página
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Estados para la búsqueda de empleado por DNI
  const [buscandoEmpleado, setBuscandoEmpleado] = useState(false);
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(null);
  const [mensajeEmpleado, setMensajeEmpleado] = useState('');

  // Estados para selectores de tiempo personalizados
  const [mostrarSelectorSalida, setMostrarSelectorSalida] = useState(false);
  const [mostrarSelectorRetorno, setMostrarSelectorRetorno] = useState(false);

  // Función para calcular estadísticas dinámicas
  const calcularEstadisticas = (papeletas) => {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Papeletas de hoy
    const papeletasHoy = papeletas.filter(p => p.fecha === hoy).length;
    
    // Área más solicitada
    const conteoAreas = {};
    papeletas.forEach(p => {
      if (p.area) {
        conteoAreas[p.area] = (conteoAreas[p.area] || 0) + 1;
      }
    });
    
    let areaMasSolicitada = 'N/A';
    let maxConteo = 0;
    Object.entries(conteoAreas).forEach(([area, conteo]) => {
      if (conteo > maxConteo) {
        maxConteo = conteo;
        areaMasSolicitada = area;
      }
    });
    
    // Papeletas sin retorno
    const papeletasSinRetorno = papeletas.filter(p => !p.horaRetorno).length;
    
    return {
      totalPapeletas: papeletas.length,
      papeletasHoy,
      areaMasSolicitada,
      papeletasSinRetorno
    };
  };

  // Función para cargar papeletas desde la API
  const cargarPapeletas = async () => {
    setCargandoPapeletas(true);
    setErrorPapeletas('');
    
    try {
      const papeletasData = await papeletaService.obtenerPapeletas();
      setPapeletas(papeletasData);
      // Calcular y actualizar estadísticas dinámicamente
      const nuevasEstadisticas = calcularEstadisticas(papeletasData);
      setEstadisticas(nuevasEstadisticas);
    } catch (error) {
      console.error('Error al cargar papeletas:', error);
      setErrorPapeletas('Error al cargar papeletas: ' + error.message);
    } finally {
      setCargandoPapeletas(false);
    }
  };

  // Cargar papeletas al montar el componente
  useEffect(() => {
    cargarPapeletas();
  }, []);

  // Cerrar selectores al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.position-relative')) {
        setMostrarSelectorSalida(false);
        setMostrarSelectorRetorno(false);
      }
    };

    if (mostrarSelectorSalida || mostrarSelectorRetorno) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mostrarSelectorSalida, mostrarSelectorRetorno]);

  // Actualizar papeletas filtradas cuando cambien los filtros o papeletas
  useEffect(() => {
    let resultado = papeletas;

    // Filtrar por DNI
    if (filtros.dni) {
      resultado = resultado.filter(p => 
        p.dni.includes(filtros.dni)
      );
    }

    // Filtrar por fecha
    if (filtros.fecha) {
      resultado = resultado.filter(p => 
        p.fecha === filtros.fecha
      );
    }

    // Filtrar por área
    if (filtros.area) {
      resultado = resultado.filter(p => 
        p.area === filtros.area
      );
    }

    setPapeletasFiltradas(resultado);
    
    // Calcular paginación con los datos filtrados
    calcularPaginacion(resultado);
  }, [filtros, papeletas, elementosPorPagina]);

  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario de papeleta
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el campo DNI, limpiar y validar
    if (name === 'dni') {
      const dniLimpio = papeletaService.limpiarDNI(value);
      // Limitar a 8 dígitos
      const dniFinal = dniLimpio.substring(0, 8);
      
      setPapeletaForm(prev => ({
        ...prev,
        [name]: dniFinal
      }));

      // Buscar empleado automáticamente cuando el DNI tenga 8 dígitos
      if (dniFinal.length === 8) {
        buscarEmpleadoPorDNI(dniFinal);
      } else {
        // Limpiar datos de empleado si el DNI no es válido
        setEmpleadoEncontrado(null);
        setMensajeEmpleado('');
      }
    } else {
      // Si se modifica cualquier otro campo y había un empleado encontrado, marcarlo como modificado
      if (empleadoEncontrado && (name === 'nombreCompleto' || name === 'area' || name === 'cargo' || name === 'regimenLaboral')) {
        limpiarDatosEmpleado();
      }
      
      setPapeletaForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar teclas presionadas en el DNI (prevenir caracteres no numéricos)
  const handleDniKeyPress = (e) => {
    // Permitir teclas especiales (backspace, delete, tab, escape, enter, home, end, arrows)
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Asegurar que sea un número (0-9)
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  // Buscar papeletas (actualizar desde el servidor)
  const handleBuscar = () => {
    cargarPapeletas();
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      dni: '',
      fecha: '',
      area: '',
      estado: ''
    });
  };

  // Ver papeleta - Cargar detalles desde el backend
  const handleVer = async (papeletaId) => {
    console.log('Ver papeleta ID:', papeletaId);
    
    // Inicializar estados del modal
    setMostrarModalDetalle(true);
    setCargandoDetalle(true);
    setErrorDetalle('');
    setPapeletaDetalle(null);
    
    try {
      // Cargar detalles desde el backend
      const detalles = await papeletaService.obtenerPapeletaPorId(papeletaId);
      setPapeletaDetalle(detalles);
    } catch (error) {
      console.error('Error al cargar detalles de la papeleta:', error);
      setErrorDetalle(error.message || 'Error al cargar los detalles de la papeleta');
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Cerrar modal de detalles
  const handleCerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    setPapeletaDetalle(null);
    setErrorDetalle('');
  };

  // Funciones de paginación
  const calcularPaginacion = (datos) => {
    const total = Math.ceil(datos.length / elementosPorPagina);
    setTotalPaginas(total);
    
    // Si la página actual es mayor que el total, resetear a la primera página
    if (paginaActual > total && total > 0) {
      setPaginaActual(1);
    }
  };

  const obtenerDatosPaginaActual = (datos) => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return datos.slice(inicio, fin);
  };

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

  // Buscar empleado por DNI y autocompletar datos
  const buscarEmpleadoPorDNI = async (dni) => {
    // Solo buscar si el DNI tiene exactamente 8 dígitos
    if (dni.length !== 8) {
      setEmpleadoEncontrado(null);
      setMensajeEmpleado('');
      return;
    }

    setBuscandoEmpleado(true);
    setMensajeEmpleado('');
    
    try {
      const resultado = await papeletaService.buscarEmpleadoPorDNI(dni);
      
      if (resultado.encontrado && resultado.datos) {
        setEmpleadoEncontrado(resultado.datos);
        setMensajeEmpleado('✓ Empleado encontrado');
        
        // Autocompletar los campos del formulario
        setPapeletaForm(prev => ({
          ...prev,
          nombreCompleto: resultado.datos.nombreCompleto || '',
          area: resultado.datos.area || '',
          cargo: resultado.datos.cargo || '',
          regimenLaboral: resultado.datos.regimenLaboral || ''
        }));
      } else {
        setEmpleadoEncontrado(null);
        setMensajeEmpleado(''); // No mostrar mensaje cuando no se encuentra
        
        // Limpiar solo los campos que se autocompletarían, mantener el DNI
        setPapeletaForm(prev => ({
          ...prev,
          nombreCompleto: '',
          area: '',
          cargo: '',
          regimenLaboral: ''
        }));
      }
    } catch (error) {
      console.error('Error al buscar empleado:', error);
      setEmpleadoEncontrado(null);
      setMensajeEmpleado('Error al buscar el empleado');
    } finally {
      setBuscandoEmpleado(false);
    }
  };

  // Limpiar datos de empleado cuando se modifica manualmente
  const limpiarDatosEmpleado = () => {
    setEmpleadoEncontrado(null);
    setMensajeEmpleado('');
  };

  // Funciones para los selectores de tiempo personalizados
  const seleccionarHora = (tipo, hora, minutos) => {
    const horaFormateada = `${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    setPapeletaForm(prev => ({
      ...prev,
      [tipo]: horaFormateada
    }));
    
    if (tipo === 'horaSalida') {
      setMostrarSelectorSalida(false);
    } else {
      setMostrarSelectorRetorno(false);
    }
  };

  const ComponenteSelectorTiempo = ({ tipo, mostrar, onCerrar, valorActual }) => {
    if (!mostrar) return null;
    
    const [horaActual, minutosActuales] = valorActual ? valorActual.split(':').map(Number) : [new Date().getHours(), new Date().getMinutes()];
    
    const horas = Array.from({ length: 24 }, (_, i) => i);
    const minutos = [0, 15, 30, 45];
    
    return (
      <div className="position-absolute bg-white border rounded shadow-lg p-3 mt-1" style={{ zIndex: 1050, minWidth: '280px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-semibold">
            <i className="bi bi-clock me-2 text-primary"></i>
            Seleccionar {tipo === 'horaSalida' ? 'hora de salida' : 'hora de retorno'}
          </h6>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onCerrar}
            aria-label="Close"
          ></button>
        </div>
        
        {/* Hora actual y botones rápidos */}
        <div className="mb-3">
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() => {
                const ahora = new Date();
                seleccionarHora(tipo, ahora.getHours(), ahora.getMinutes());
              }}
            >
              <i className="bi bi-clock-fill me-1"></i>
              Ahora ({new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })})
            </button>
          </div>
          
          {/* Horarios preestablecidos */}
          <div className="d-flex gap-1 flex-wrap">
            {tipo === 'horaSalida' ? 
              ['08:00', '08:30', '09:00', '14:00', '15:00'].map(hora => {
                const [h, m] = hora.split(':').map(Number);
                return (
                  <button
                    key={hora}
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => seleccionarHora(tipo, h, m)}
                  >
                    {hora}
                  </button>
                );
              }) :
              ['12:00', '13:00', '17:00', '17:30', '18:00'].map(hora => {
                const [h, m] = hora.split(':').map(Number);
                return (
                  <button
                    key={hora}
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => seleccionarHora(tipo, h, m)}
                  >
                    {hora}
                  </button>
                );
              })
            }
          </div>
        </div>
        
        {/* Selector manual */}
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-semibold">Hora</label>
            <select 
              className="form-select form-select-sm"
              value={horaActual || 0}
              onChange={(e) => seleccionarHora(tipo, parseInt(e.target.value), minutosActuales || 0)}
            >
              {horas.map(h => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label small fw-semibold">Minutos</label>
            <select 
              className="form-select form-select-sm"
              value={minutosActuales || 0}
              onChange={(e) => seleccionarHora(tipo, horaActual || 0, parseInt(e.target.value))}
            >
              {minutos.map(m => (
                <option key={m} value={m}>
                  :{String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
       
      </div>
    );
  };

  // Registrar nueva papeleta
  const handleSubmitPapeleta = async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    setMensaje({ tipo: '', texto: '' });
    
    // Iniciar carga
    setCargando(true);

    try {
      // Enviar datos al backend
      const resultado = await papeletaService.crearPapeleta(papeletaForm);
      
      if (resultado.exito) {
        // Mostrar mensaje de éxito
        setMensaje({
          tipo: 'success',
          texto: resultado.mensaje
        });

        // Limpiar formulario completamente
        setPapeletaForm({
          nombreCompleto: '',
          dni: '',
          codigo: '',
          area: '',
          cargo: '',
          regimenLaboral: '',
          oficinaVisitar: '',
          motivo: '',
          fundamentacion: '',
          fecha: '',
          horaSalida: '',
          horaRetorno: ''
        });

        // Limpiar todos los estados relacionados con el formulario
        setSinRetorno(false);
        setEmpleadoEncontrado(null);
        setMensajeEmpleado('');
        setBuscandoEmpleado(false);

        // Recargar la lista de papeletas desde el servidor
        await cargarPapeletas();

      } else {
        // Mostrar mensaje de error
        setMensaje({
          tipo: 'danger',
          texto: resultado.mensaje
        });
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setMensaje({
        tipo: 'danger',
        texto: 'Error inesperado al registrar la papeleta'
      });
    } finally {
      setCargando(false);
    }
  };

  // Limpiar formulario
  const handleLimpiarForm = () => {
    setPapeletaForm({
      nombreCompleto: '',
      dni: '',
      codigo: '',
      area: '',
      cargo: '',
      regimenLaboral: '',
      oficinaVisitar: '',
      motivo: '',
      fundamentacion: '',
      fecha: '',
      horaSalida: '',
      horaRetorno: ''
    });
    setSinRetorno(false);
    setMensaje({ tipo: '', texto: '' });
    // Limpiar también los estados del empleado
    setEmpleadoEncontrado(null);
    setMensajeEmpleado('');
    setBuscandoEmpleado(false);
  };

  return (
    <>
      {/* Estilos CSS específicos del componente */}
      <style jsx>{`
        /* Mejoras adicionales para móviles */
        @media (max-width: 576px) {
          .container {
            padding-left: 15px;
            padding-right: 15px;
          }
          
          .card-body {
            padding: 1rem 0.75rem;
          }
          
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .btn-sm {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }
          
          h3 {
            font-size: 1.5rem;
          }
          
          /* Métricas responsivas en móvil */
          .card .fs-1 {
            font-size: 2rem !important;
          }
          
          .card h2 {
            font-size: 1.75rem;
          }
        }
        
        /* Asegurar que las tablas no se desborden */
        .table-responsive {
          overflow-x: auto;
        }
        
        /* Mejorar legibilidad en tarjetas pequeñas */
        @media (max-width: 768px) {
          .card-body h6 {
            font-size: 0.8rem;
          }
          
          .card-body h3 {
            font-size: 1.5rem;
          }
          
          /* Ajustar iconos en tablets */
          .card .fs-1 {
            font-size: 2.5rem !important;
          }
        }
        
        /* Estilos para las tarjetas de métricas */
        .card.h-100 {
          min-height: 140px;
          transition: transform 0.2s ease-in-out;
        }
        
        .card.h-100:hover {
          transform: translateY(-2px);
        }
        
        /* Asegurar que los iconos tengan buen contraste */
        .card .bi {
          opacity: 0.9;
        }
      `}</style>

      <div className="bg-light min-vh-100">
        {/* Navbar reutilizable */}
        <Navbar userRole="Recursos Humanos" />

        <div className="container mt-4">
          <h3 className="text-primary fw-bold mb-3">Módulo de Registro y Control - RRHH</h3>

          {/* Estadísticas */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center shadow-sm border-0 bg-primary text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center py-3">
                  <div className="mb-2">
                    <i className="bi bi-clipboard-data fs-1"></i>
                  </div>
                  <h6 className="fw-semibold mb-2">Total de Papeletas</h6>
                  <h2 className="fw-bold mb-0">
                    {cargandoPapeletas ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    ) : (
                      estadisticas.totalPapeletas
                    )}
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center shadow-sm border-0 bg-success text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center py-3">
                  <div className="mb-2">
                    <i className="bi bi-calendar-check fs-1"></i>
                  </div>
                  <h6 className="fw-semibold mb-2">Papeletas de Hoy</h6>
                  <h2 className="fw-bold mb-0">
                    {cargandoPapeletas ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    ) : (
                      estadisticas.papeletasHoy
                    )}
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center shadow-sm border-0 bg-warning text-dark h-100">
                <div className="card-body d-flex flex-column justify-content-center py-3">
                  <div className="mb-2">
                    <i className="bi bi-clock-history fs-1"></i>
                  </div>
                  <h6 className="fw-semibold mb-2">Sin Retorno</h6>
                  <h2 className="fw-bold mb-0">
                    {cargandoPapeletas ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    ) : (
                      estadisticas.papeletasSinRetorno
                    )}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center shadow-sm border-0 bg-info text-white h-100">
                <div className="card-body d-flex flex-column justify-content-center py-3">
                  <div className="mb-2">
                    <i className="bi bi-building fs-1"></i>
                  </div>
                  <h6 className="fw-semibold mb-2">Área Más Solicitada</h6>
                  <h6 className="fw-bold mb-0" style={{fontSize: '1.1rem', lineHeight: '1.2'}}>
                    {cargandoPapeletas ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    ) : (
                      <span className="text-truncate d-block" title={estadisticas.areaMasSolicitada}>
                        {estadisticas.areaMasSolicitada}
                      </span>
                    )}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          {/* Registro de nueva papeleta */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Registro de nueva papeleta</h5>

              <form onSubmit={handleSubmitPapeleta}>
                <div className="row g-3">
                  
                  <div className="col-6 col-md-3">
                    <label className="form-label fw-semibold">DNI</label>
                    <div className="position-relative">
                      <input 
                        type="text" 
                        className={`form-control ${papeletaForm.dni ? (papeletaService.validarFormatoDNI(papeletaForm.dni).esValido ? 'is-valid' : 'is-invalid') : ''}`}
                        name="dni"
                        value={papeletaForm.dni}
                        onChange={handleFormChange}
                        onKeyDown={handleDniKeyPress}
                        placeholder="Ingrese el DNI"
                        maxLength="8"
                        pattern="\d{8}"
                        title="DNI debe tener exactamente 8 dígitos numéricos"
                        required
                      />
                      {buscandoEmpleado && (
                        <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Buscando...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {papeletaForm.dni && !papeletaService.validarFormatoDNI(papeletaForm.dni).esValido && (
                      <div className="invalid-feedback">
                        {papeletaService.validarFormatoDNI(papeletaForm.dni).mensaje}
                      </div>
                    )}
                    {papeletaForm.dni && papeletaService.validarFormatoDNI(papeletaForm.dni).esValido && !buscandoEmpleado && (
                      <div className="valid-feedback">
                        DNI válido
                      </div>
                    )}
                    {mensajeEmpleado && (
                      <div className={`small mt-1 ${empleadoEncontrado ? 'text-success' : 'text-muted'}`}>
                        <i className={`bi ${empleadoEncontrado ? 'bi-check-circle-fill' : 'bi-info-circle'} me-1`}></i>
                        {mensajeEmpleado}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">
                      Nombre completo
                      {empleadoEncontrado && (
                        <span className="badge bg-success ms-2 small">
                          <i className="bi bi-robot me-1"></i>
                          Autocompletado
                        </span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${empleadoEncontrado ? 'border-success' : ''}`}
                      name="nombreCompleto"
                      value={papeletaForm.nombreCompleto}
                      onChange={handleFormChange}
                      placeholder="Ingrese el nombre completo"
                      required
                    />
                  </div>
                  

                  <div className="col-6 col-md-3">
                    <label className="form-label fw-semibold">Código</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="codigo"
                      value={papeletaForm.codigo}
                      onChange={handleFormChange}
                      placeholder="Ingrese el código"
                      maxLength="8"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold">
                      Área
                      {empleadoEncontrado && (
                        <span className="badge bg-success ms-2 small">
                          <i className="bi bi-robot me-1"></i>
                          Autocompletado
                        </span>
                      )}
                    </label>
                    <select 
                      className={`form-select ${empleadoEncontrado ? 'border-success' : ''}`}
                      name="area"
                      value={papeletaForm.area}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Seleccionar área</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Logística">Logística</option>
                      <option value="Contabilidad">Contabilidad</option>
                      <option value="Desarrollo Urbano">Desarrollo Urbano</option>
                      <option value="Gerencia Municipal">Gerencia Municipal</option>
                      <option value="Secretaría General">Secretaría General</option>
                      <option value="Trámite Documentario">Trámite Documentario</option>
                      <option value="Planeamiento y Presupuesto">Planeamiento y Presupuesto</option>
                      <option value="Servicios Públicos">Servicios Públicos</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold">
                      Cargo
                      {empleadoEncontrado && (
                        <span className="badge bg-success ms-2 small">
                          <i className="bi bi-robot me-1"></i>
                          Autocompletado
                        </span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${empleadoEncontrado ? 'border-success' : ''}`}
                      name="cargo"
                      value={papeletaForm.cargo}
                      onChange={handleFormChange}
                      placeholder="Ej. Asistente Administrativo"
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold">
                      Régimen laboral
                      {empleadoEncontrado && (
                        <span className="badge bg-success ms-2 small">
                          <i className="bi bi-robot me-1"></i>
                          Autocompletado
                        </span>
                      )}
                    </label>
                    <select 
                      className={`form-select ${empleadoEncontrado ? 'border-success' : ''}`}
                      name="regimenLaboral"
                      value={papeletaForm.regimenLaboral}
                      onChange={handleFormChange}
                    >
                      <option value="">Seleccionar régimen</option>
                      <option value="728">728</option>
                      <option value="276">276</option>
                      <option value="1057">1057</option>
                      <option value="30057">30057</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Oficina o entidad a visitar</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="oficinaVisitar"
                      value={papeletaForm.oficinaVisitar}
                      onChange={handleFormChange}
                      placeholder="Ej. Sunat, Reniec, etc."
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Motivo</label>
                    <select 
                      className="form-select"
                      name="motivo"
                      value={papeletaForm.motivo}
                      onChange={handleFormChange}
                    >
                      <option value="">Seleccionar motivo</option>
                      <option value="Comisión de servicios">Comisión de servicios</option>
                      <option value="Atención médica">Atención médica</option>
                      <option value="Capacitación">Capacitación</option>
                      <option value="Asuntos particulares">Asuntos particulares</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Fundamentación</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      name="fundamentacion"
                      value={papeletaForm.fundamentacion}
                      onChange={handleFormChange}
                      placeholder="Describa la justificación de la salida..."
                    ></textarea>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold">Fecha</label>
                    <input 
                      type="date" 
                      className="form-control"
                      name="fecha"
                      value={papeletaForm.fecha}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="col-6 col-md-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-clock me-1 text-success"></i>
                      Hora de salida
                    </label>
                    <div className="position-relative">
                      <div 
                        className="form-control d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer', minHeight: '38px' }}
                        onClick={() => setMostrarSelectorSalida(!mostrarSelectorSalida)}
                      >
                        <span className={papeletaForm.horaSalida ? 'text-dark fw-semibold' : 'text-muted'}>
                          {papeletaForm.horaSalida || 'Seleccionar hora'}
                        </span>
                        <i className="bi bi-clock text-success"></i>
                      </div>
                      
                      {/* Input oculto para compatibilidad con el formulario */}
                      <input 
                        type="hidden"
                        name="horaSalida"
                        value={papeletaForm.horaSalida}
                      />
                      
                      {/* Selector personalizado */}
                      <ComponenteSelectorTiempo
                        tipo="horaSalida"
                        mostrar={mostrarSelectorSalida}
                        onCerrar={() => setMostrarSelectorSalida(false)}
                        valorActual={papeletaForm.horaSalida}
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-clock-history me-1 text-primary"></i>
                      Hora de retorno
                    </label>

                    <div className="input-group">
                      <div className="position-relative flex-grow-1">
                        <div 
                          className={`form-control d-flex justify-content-between align-items-center ${
                            sinRetorno ? 'bg-warning bg-opacity-10 text-muted' : ''
                          }`}
                          style={{ 
                            cursor: sinRetorno ? 'not-allowed' : 'pointer', 
                            minHeight: '38px' 
                          }}
                          onClick={() => !sinRetorno && setMostrarSelectorRetorno(!mostrarSelectorRetorno)}
                        >
                          <span className={
                            sinRetorno ? 'text-muted fst-italic' : 
                            papeletaForm.horaRetorno ? 'text-dark fw-semibold' : 'text-muted'
                          }>
                            {sinRetorno ? 'Sin retorno' : papeletaForm.horaRetorno || 'Seleccionar hora'}
                          </span>
                          <i className={`bi ${sinRetorno ? 'bi-x-circle text-warning' : 'bi-clock text-primary'}`}></i>
                        </div>
                        
                        {/* Input oculto para compatibilidad con el formulario */}
                        <input 
                          type="hidden"
                          name="horaRetorno"
                          value={papeletaForm.horaRetorno}
                        />
                        
                        {/* Selector personalizado */}
                        {!sinRetorno && (
                          <ComponenteSelectorTiempo
                            tipo="horaRetorno"
                            mostrar={mostrarSelectorRetorno}
                            onCerrar={() => setMostrarSelectorRetorno(false)}
                            valorActual={papeletaForm.horaRetorno}
                          />
                        )}
                      </div>
                      
                      {/* Checkbox sin retorno - al costado derecho */}
                      <div className="input-group-text d-none d-sm-flex">
                        <input 
                          className="form-check-input mt-0" 
                          type="checkbox"
                          checked={sinRetorno}
                          onChange={handleSinRetornoChange}
                        /> Sin retorno
                      </div>
                    </div>

                    {/* Checkbox sin retorno para móviles */}
                    <div className="form-check mt-1 d-sm-none">
                      <input 
                        className="form-check-input" 
                        type="checkbox"
                        checked={sinRetorno}
                        onChange={handleSinRetornoChange}
                      />
                      <label className="form-check-label small">Sin retorno</label>
                    </div>

                    {/* Indicador de duración */}
                    {papeletaForm.horaSalida && papeletaForm.horaRetorno && !sinRetorno && (
                      <div className="mt-2 p-2 bg-info bg-opacity-10 border border-info rounded">
                        <small className="text-info fw-semibold">
                          <i className="bi bi-stopwatch me-1"></i>
                          Duración: {(() => {
                            const [salidaH, salidaM] = papeletaForm.horaSalida.split(':').map(Number);
                            const [retornoH, retornoM] = papeletaForm.horaRetorno.split(':').map(Number);
                            const salidaMinutos = salidaH * 60 + salidaM;
                            const retornoMinutos = retornoH * 60 + retornoM;
                            const diferencia = retornoMinutos - salidaMinutos;
                            
                            if (diferencia < 0) return 'Hora inválida';
                            
                            const horas = Math.floor(diferencia / 60);
                            const minutos = diferencia % 60;
                            return `${horas}h ${minutos}m`;
                          })()}
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-end mt-4 gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleLimpiarForm}
                    disabled={cargando}
                  >
                    Limpiar
                  </button>
                  <button type="submit" className="btn btn-success" disabled={cargando}>
                    {cargando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Registrar Papeleta
                      </>
                    )}
                  </button>
                </div>

                {/* Mensaje de estado - Ahora aparece debajo del formulario */}
                {mensaje.texto && (
                  <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show mt-3`} role="alert">
                    <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                    {mensaje.texto}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMensaje({ tipo: '', texto: '' })}
                      aria-label="Close"
                    ></button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Filtros */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold text-primary mb-3">Filtrar y Consultar Papeletas</h5>
              <form className="row g-3">
                <div className="col-12 col-sm-6 col-md-3">
                  <input 
                    type="text" 
                    className="form-control"
                    name="dni"
                    value={filtros.dni}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por DNI"
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <input 
                    type="date" 
                    className="form-control"
                    name="fecha"
                    value={filtros.fecha}
                    onChange={handleFiltroChange}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <select 
                    className="form-select"
                    name="area"
                    value={filtros.area}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Seleccionar área</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Logística">Logística</option>
                    <option value="Contabilidad">Contabilidad</option>
                    <option value="Desarrollo Urbano">Desarrollo Urbano</option>
                    <option value="Gerencia Municipal">Gerencia Municipal</option>
                    <option value="Secretaría General">Secretaría General</option>
                    <option value="Trámite Documentario">Trámite Documentario</option>
                    <option value="Planeamiento y Presupuesto">Planeamiento y Presupuesto</option>
                    <option value="Servicios Públicos">Servicios Públicos</option>
                  </select>
                </div>


                <div className="col-6 col-md-3">
                  <button 
                    type="button" 
                    className="btn btn-primary w-100"
                    onClick={handleBuscar}
                    disabled={cargandoPapeletas}
                  >
                    {cargandoPapeletas ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>
                        Buscar
                      </>
                    )}
                  </button>
                </div>
                <div className="col-6 col-md-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100"
                    onClick={handleLimpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tabla de registros */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold text-primary mb-0">
                  Listado de Papeletas
                </h5>
                <div className="text-muted small">
                  {papeletasFiltradas.length > 0 && (
                    <>
                      Mostrando {Math.min((paginaActual - 1) * elementosPorPagina + 1, papeletasFiltradas.length)} - {Math.min(paginaActual * elementosPorPagina, papeletasFiltradas.length)} de {papeletasFiltradas.length} resultados
                    </>
                  )}
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover text-center align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th style={{minWidth: '120px'}}>Código</th>
                      <th style={{minWidth: '120px'}}>Trabajador</th>
                      <th style={{minWidth: '90px'}}>DNI</th>
                      <th style={{minWidth: '100px'}}>Área</th>
                      <th style={{minWidth: '100px'}}>Fecha</th>
                      <th style={{minWidth: '130px'}}>Motivo</th>
                      <th style={{minWidth: '130px'}}>Oficina</th>
                      <th style={{minWidth: '100px'}}>Horario</th>
                      <th style={{minWidth: '80px'}}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoPapeletas ? (
                      <tr>
                        <td colSpan="9" className="py-4">
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                            Cargando papeletas...
                          </div>
                        </td>
                      </tr>
                    ) : errorPapeletas ? (
                      <tr>
                        <td colSpan="9" className="py-4 text-danger">
                          <div className="d-flex justify-content-center align-items-center flex-column">
                            <i className="bi bi-exclamation-triangle mb-2" style={{fontSize: '1.5rem'}}></i>
                            {errorPapeletas}
                            <button 
                              className="btn btn-sm btn-outline-primary mt-2"
                              onClick={cargarPapeletas}
                            >
                              Reintentar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : papeletasFiltradas.length > 0 ? (
                      obtenerDatosPaginaActual(papeletasFiltradas).map(papeleta => (
                        <tr key={papeleta.id || papeleta.codigo}>
                          <td>{papeleta.codigo}</td>
                          <td>{papeleta.trabajador}</td>
                          <td>{papeleta.dni}</td>
                          <td>{papeleta.area}</td>
                          <td>{papeleta.fecha}</td>
                          <td>{papeleta.motivo}</td>
                          <td>{papeleta.oficinaVisitar}</td>
                          <td>
                            {papeleta.horaSalida && papeleta.horaRetorno ? 
                              `${papeleta.horaSalida} - ${papeleta.horaRetorno}` : 
                              papeleta.horaSalida ? 
                                `${papeleta.horaSalida} - Sin retorno` : 
                                'No especificado'
                            }
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleVer(papeleta.id)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-muted py-4">
                          No se encontraron papeletas con los filtros aplicados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de paginación */}
              {papeletasFiltradas.length > elementosPorPagina && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted small">
                    Página {paginaActual} de {totalPaginas}
                  </div>
                  
                  <nav aria-label="Navegación de páginas">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={paginaAnterior}
                          disabled={paginaActual === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                          Anterior
                        </button>
                      </li>

                      {/* Números de página */}
                      {(() => {
                        const paginas = [];
                        const inicio = Math.max(1, paginaActual - 2);
                        const fin = Math.min(totalPaginas, paginaActual + 2);
                        
                        // Mostrar primera página si no está en el rango
                        if (inicio > 1) {
                          paginas.push(
                            <li key={1} className={`page-item ${paginaActual === 1 ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => irAPagina(1)}>1</button>
                            </li>
                          );
                          if (inicio > 2) {
                            paginas.push(
                              <li key="dots1" className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            );
                          }
                        }
                        
                        // Páginas en el rango actual
                        for (let i = inicio; i <= fin; i++) {
                          paginas.push(
                            <li key={i} className={`page-item ${i === paginaActual ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => irAPagina(i)}>{i}</button>
                            </li>
                          );
                        }
                        
                        // Mostrar última página si no está en el rango
                        if (fin < totalPaginas) {
                          if (fin < totalPaginas - 1) {
                            paginas.push(
                              <li key="dots2" className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            );
                          }
                          paginas.push(
                            <li key={totalPaginas} className={`page-item ${paginaActual === totalPaginas ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => irAPagina(totalPaginas)}>{totalPaginas}</button>
                            </li>
                          );
                        }
                        
                        return paginas;
                      })()}

                      <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={paginaSiguiente}
                          disabled={paginaActual === totalPaginas}
                        >
                          Siguiente
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  <div className="text-muted small">
                    {elementosPorPagina} por página
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Modal de Detalles de Papeleta */}
        {mostrarModalDetalle && (
          <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-file-text me-2"></i>
                    Detalles de la Papeleta
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={handleCerrarModalDetalle}
                    aria-label="Close"
                  ></button>
                </div>
                
                <div className="modal-body">
                  {cargandoDetalle ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                      <div className="spinner-border text-primary me-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <span>Cargando detalles de la papeleta...</span>
                    </div>
                  ) : errorDetalle ? (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>
                        <strong>Error:</strong> {errorDetalle}
                      </div>
                    </div>
                  ) : papeletaDetalle ? (
                    <div>
                      {/* Información del Trabajador */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">
                            <i className="bi bi-person-fill me-2"></i>
                            Información del Trabajador
                          </h6>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold text-muted small">Nombre Completo</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.trabajador}</div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-semibold text-muted small">DNI</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.dni}</div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-semibold text-muted small">Código</label>
                          <div className="p-2 bg-light rounded fw-bold text-primary">{papeletaDetalle.codigo}</div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-semibold text-muted small">Área</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.area}</div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-semibold text-muted small">Cargo</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.cargo}</div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-semibold text-muted small">Régimen Laboral</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.regimenLaboral}</div>
                        </div>
                      </div>

                      {/* Información de la Papeleta */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="text-success fw-bold border-bottom pb-2 mb-3">
                            <i className="bi bi-clipboard-check me-2"></i>
                            Información de la Papeleta
                          </h6>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold text-muted small">Oficina o Entidad a Visitar</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.oficinaVisitar}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold text-muted small">Motivo</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.motivo}</div>
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-semibold text-muted small">Fundamentación</label>
                          <div className="p-2 bg-light rounded" style={{minHeight: '60px'}}>
                            {papeletaDetalle.fundamentacion}
                          </div>
                        </div>
                      </div>

                      {/* Horarios y Fechas */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="text-warning fw-bold border-bottom pb-2 mb-3">
                            <i className="bi bi-calendar-clock me-2"></i>
                            Horarios y Fechas
                          </h6>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-semibold text-muted small">Fecha de la Papeleta</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.fecha}</div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-semibold text-muted small">Hora de Salida</label>
                          <div className="p-2 bg-light rounded">{papeletaDetalle.horaSalida}</div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label fw-semibold text-muted small">Hora de Retorno</label>
                          <div className={`p-2 rounded ${papeletaDetalle.horaRetorno === 'Sin retorno' ? 'bg-warning bg-opacity-25 text-warning-emphasis' : 'bg-light'}`}>
                            {papeletaDetalle.horaRetorno}
                          </div>
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-semibold text-muted small">Fecha de Registro en el Sistema</label>
                          <div className="p-2 bg-light rounded small text-muted">{papeletaDetalle.fechaCreacion}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                
                <div className="modal-footer bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleCerrarModalDetalle}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cerrar
                  </button>
                  {papeletaDetalle && (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-2"></i>
                      Imprimir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-muted py-3 small">
          © 2025 Municipalidad Provincial de San Miguel — Módulo de Registro RRHH - Sistema Digital de Papeletas
        </footer>
      </div>
    </>
  );
};

export default RRHH;