import React, { useState, useEffect, useCallback } from 'react';
import { generarPdfReporte } from '../utils/reportGenerator';
import Navbar from './Navbar';
import papeletaService from '../services/papeletaService';
import authService from '../services/authService';
import { MOTIVOS_PAPELETA, AREAS } from '../config/constants';
import Autocomplete from './Common/Autocomplete';
import { useFormularioPapeleta, useFiltrosPapeletas } from '../hooks';
import PanelEstadisticas from './RRHH/Estadisticas/PanelEstadisticas';
import FiltrosPapeletas from './RRHH/Filtros/FiltrosPapeletas';
import TarjetasEstadisticas from './RRHH/Estadisticas/TarjetasEstadisticas';
import TablaPapeletas from './RRHH/Tabla/TablaPapeletas';
import Paginacion from './RRHH/Paginacion/Paginacion';
import { ModalDetallePapeleta, ModalEditarPapeleta } from './RRHH/Modal';
import SelectorTiempo from './RRHH/SelectorTiempo';

const RRHH = () => {
  // Verificar permisos del usuario
  const canRegister = authService.canRegisterPapeletas();
  const isReadOnly = authService.isReadOnlyUser();

  // Estado para las papeletas
  const [papeletas, setPapeletas] = useState([]);
  const [cargandoPapeletas, setCargandoPapeletas] = useState(true);
  const [errorPapeletas, setErrorPapeletas] = useState('');

  // Estados para las estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalPapeletas: 120,
    papeletasHoy: 0,
    areaMasSolicitada: 'N/A',
    papeletasSinRetorno: 0
  });

  // Estado para mostrar el panel de estadísticas
  const [mostrarPanelEstadisticas, setMostrarPanelEstadisticas] = useState(false);

  // Estados para el modal de detalles de papeleta
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [papeletaDetalle, setPapeletaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  // Estados para el modal de edición de papeleta
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [papeletaEditar, setPapeletaEditar] = useState(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  // Estados para selectores de tiempo personalizados
  const [mostrarSelectorSalida, setMostrarSelectorSalida] = useState(false);
  const [mostrarSelectorRetorno, setMostrarSelectorRetorno] = useState(false);

  // Constante para elementos por página
  const elementosPorPagina = 10;

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

  // Función para mostrar el panel de estadísticas
  const mostrarEstadisticasDetalladas = () => {
    setMostrarPanelEstadisticas(true);
  };

  // Función para cerrar el panel de estadísticas
  const cerrarPanelEstadisticas = () => {
    setMostrarPanelEstadisticas(false);
  };

  // Función para cargar papeletas desde la API
  const cargarPapeletas = useCallback(async () => {
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
  }, []);

  // Custom hooks para manejar formulario y filtros
  const [mensajeRegistro, setMensajeRegistro] = useState({ tipo: '', texto: '' });
  const {
    papeletaForm,
    sinRetorno,
    cargando,
    buscandoEmpleado,
    empleadoEncontrado,
    mensajeEmpleado,
    handleFormChange,
    handleSinRetornoChange,
    seleccionarHora,
    handleSubmit: handleSubmitPapeleta,
    limpiarFormulario: handleLimpiarForm,
    
  } = useFormularioPapeleta(cargarPapeletas, setMensajeRegistro);
  

  const {
    filtros,
    papeletasFiltradas,
    paginaActual,
    totalPaginas,
    handleFiltroChange,
    limpiarFiltros: handleLimpiarFiltros,
    obtenerDatosPaginaActual,
    irAPagina,
    paginaAnterior,
    paginaSiguiente
  } = useFiltrosPapeletas(papeletas, 10);

  // Cargar papeletas al montar el componente
  useEffect(() => {
    cargarPapeletas();
  }, [cargarPapeletas]);

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

  // Generar y descargar reporte PDF usando el módulo reutilizable
  const handleImprimir = async () => {
    try {
      await generarPdfReporte(papeletasFiltradas, filtros, { filename: `reporte-papeletas-${new Date().toISOString().slice(0,10)}.pdf` });
    } catch (err) {
      console.error('Error al generar el reporte imprimible:', err);
      alert('No se pudo generar el reporte imprimible. Ver consola para detalles.');
    }
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

  // Abrir modal de edición desde el modal de detalles
  const handleAbrirEdicion = (papeleta) => {
    setPapeletaEditar(papeleta);
    setMostrarModalEditar(true);
    setMostrarModalDetalle(false);
  };

  // Cerrar modal de edición
  const handleCerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setPapeletaEditar(null);
    setCargandoEdicion(false);
  };

  // Guardar cambios de la papeleta editada
  const handleGuardarEdicion = async (papeletaId, datosActualizados) => {
    setCargandoEdicion(true);

    try {
      const resultado = await papeletaService.actualizarPapeleta(papeletaId, datosActualizados);

      if (resultado.exito) {
        // Cerrar modal de edición
        handleCerrarModalEditar();

        // Recargar papeletas
        await cargarPapeletas();

        // Mostrar mensaje de éxito en el mensaje flotante superior
        setMensajeRegistro({
          tipo: 'success',
          texto: resultado.mensaje || 'Papeleta actualizada correctamente'
        });
        setTimeout(() => {
          setMensajeRegistro({ tipo: '', texto: '' });
        }, 4000);
      } else {
        // Mostrar solo mensaje superior; no mostramos inline por campo
        setMensajeRegistro({
          tipo: 'danger',
          texto: resultado.mensaje || 'Error al actualizar la papeleta'
        });
        return;
      }
    } catch (error) {
      console.error('Error al actualizar papeleta:', error);
      setMensajeRegistro({
        tipo: 'danger',
        texto: error.message || 'Error al actualizar la papeleta'
      });
      // Relanzar el error para que el modal lo capture
      throw error;
    } finally {
      setCargandoEdicion(false);
    }
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
        
        /* Inputs más accesibles en móvil */
        @media (max-width: 576px) {
          .form-control, .form-select {
            font-size: 16px !important; /* Previene zoom en iOS */
            padding: 0.625rem 0.75rem;
          }
          
          .form-label {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
          }
          
          .btn {
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
          }
          
          /* Mejorar espaciado vertical en formularios */
          .row.g-3 {
            row-gap: 1rem !important;
          }
        }
        
        /* Mejorar botones en formularios móviles */
        @media (max-width: 768px) {
          .btn-primary, .btn-secondary {
            min-height: 44px; /* Touch target size recomendado */
          }
          
          .col-12 .btn {
            width: 100%;
          }
        }
        
        /* Scroll horizontal suave para tablas en móvil */
        @media (max-width: 992px) {
          .table-responsive {
            -webkit-overflow-scrolling: touch;
            border-radius: 0.375rem;
          }
          
          .table-responsive table {
            min-width: 800px;
          }
          
          /* Indicador visual de scroll horizontal */
          .table-responsive::after {
            content: '← Desliza →';
            display: block;
            text-align: center;
            font-size: 0.75rem;
            color: #6c757d;
            padding: 0.5rem;
            background: #f8f9fa;
            border-radius: 0 0 0.375rem 0.375rem;
          }
        }
      `}</style>

      <div className="bg-light min-vh-100">
        {/* Navbar reutilizable */}
        <Navbar userRole="Recursos Humanos" />

        {/* Mensaje flotante de éxito/error - Visible siempre en la parte superior */}
        {(mensajeRegistro && mensajeRegistro.texto) && (
          <div 
            className="position-fixed top-0 start-50 translate-middle-x mt-3" 
            style={{ zIndex: 1060, width: '90%', maxWidth: '600px' }}
          >
            <div className={`alert alert-${mensajeRegistro.tipo} alert-dismissible fade show shadow-lg`} role="alert">
              <i className={`bi ${mensajeRegistro.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
              <strong>{mensajeRegistro.tipo === 'success' ? '¡Éxito!' : 'Error:'}</strong> {mensajeRegistro.texto}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setMensajeRegistro({ tipo: '', texto: '' })}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        <div className="container mt-4">
          <h3 className="text-primary fw-bold mb-3">Módulo de Registro y Control - RRHH</h3>

          {/* Estadísticas */}
          <TarjetasEstadisticas 
            estadisticas={estadisticas}
            cargando={cargandoPapeletas}
          />

          {/* Registro de nueva papeleta - Solo para usuarios con permisos */}
          {canRegister && (
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
                    <label className="form-label fw-semibold">Código papeleta</label>
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
                    <Autocomplete
                      name="area"
                      value={papeletaForm.area}
                      onChange={handleFormChange}
                      suggestions={AREAS}
                      placeholder="Escriba para buscar área (ej. recursos)"
                      className={empleadoEncontrado ? 'border-success' : ''}
                      required
                    />
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
                      {MOTIVOS_PAPELETA.map(motivo => (
                        <option key={motivo} value={motivo}>{motivo}</option>
                      ))}
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
                      <SelectorTiempo
                        tipo="horaSalida"
                        mostrar={mostrarSelectorSalida}
                        onCerrar={() => setMostrarSelectorSalida(false)}
                        valorActual={papeletaForm.horaSalida}
                        onSeleccionar={seleccionarHora}
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
                          <SelectorTiempo
                            tipo="horaRetorno"
                            mostrar={mostrarSelectorRetorno}
                            onCerrar={() => setMostrarSelectorRetorno(false)}
                            valorActual={papeletaForm.horaRetorno}
                            onSeleccionar={seleccionarHora}
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
              </form>
            </div>
          </div>
          )}

          {/* Mostrar mensaje informativo para usuarios de solo lectura */}
          {isReadOnly && (
            <div className="alert alert-info mb-4" role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Modo de consulta:</strong> Puedes consultar papeletas y ver estadísticas.
            </div>
          )}

          {/* Filtros */}
          <FiltrosPapeletas 
            filtros={filtros}
            motivosUnicos={MOTIVOS_PAPELETA}
            cargando={cargandoPapeletas}
            onFiltroChange={handleFiltroChange}
            onBuscar={handleBuscar}
            onLimpiar={handleLimpiarFiltros}
            onVerEstadisticas={mostrarEstadisticasDetalladas}
            onImprimir={handleImprimir}
          />

          {/* Tabla de registros */}
          <TablaPapeletas 
            papeletas={obtenerDatosPaginaActual(papeletasFiltradas)}
            cargando={cargandoPapeletas}
            error={errorPapeletas}
            totalFiltrados={papeletasFiltradas.length}
            paginaActual={paginaActual}
            elementosPorPagina={elementosPorPagina}
            onCargarPapeletas={cargarPapeletas}
            onVerDetalle={handleVer}
          />

          {/* Controles de paginación */}
          {papeletasFiltradas.length > elementosPorPagina && (
            <Paginacion 
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              elementosPorPagina={elementosPorPagina}
              onPaginaAnterior={paginaAnterior}
              onPaginaSiguiente={paginaSiguiente}
              onCambiarPagina={irAPagina}
            />
          )}


        </div>

        <ModalDetallePapeleta 
          mostrar={mostrarModalDetalle}
          papeleta={papeletaDetalle}
          cargando={cargandoDetalle}
          error={errorDetalle}
          onCerrar={handleCerrarModalDetalle}
          onEditar={handleAbrirEdicion}
          puedeEditar={!isReadOnly}
        />

        <ModalEditarPapeleta 
          mostrar={mostrarModalEditar}
          papeleta={papeletaEditar}
          onCerrar={handleCerrarModalEditar}
          onGuardar={handleGuardarEdicion}
          cargando={cargandoEdicion}
        />

        <footer className="text-center text-muted py-3 small">
          © 2025 Municipalidad Provincial de San Miguel — Módulo de Registro RRHH - Sistema Digital de Papeletas
        </footer>
      </div>

      {/* Panel de Estadísticas */}
      <PanelEstadisticas
        papeletas={papeletas}
        isVisible={mostrarPanelEstadisticas}
        onClose={cerrarPanelEstadisticas}
      />
    </>
  );
};

export default RRHH;