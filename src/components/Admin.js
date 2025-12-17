import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import adminService from '../services/adminService';
import TablaUsuarios from './Admin/Tabla/TablaUsuarios';
import TarjetasEstadisticasAdmin from './Admin/Estadisticas/TarjetasEstadisticasAdmin';

const Admin = () => {
  // Estados para manejar los datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    usuario: '',
    dni: '',
    rol: ''
  });

  // Estados para manejo de UI
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'danger'

  // Estados para modo edición
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [formDataEdicion, setFormDataEdicion] = useState({
    nombreCompleto: '',
    usuario: '',
    dni: '',
    rol: ''
  });
  const [isLoadingEdicion, setIsLoadingEdicion] = useState(false);
  const [mensajeEdicion, setMensajeEdicion] = useState('');
  const [tipoMensajeEdicion, setTipoMensajeEdicion] = useState('');

  // Estados para eliminación
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [isLoadingEliminacion, setIsLoadingEliminacion] = useState(false);
  const [mensajeEliminacion, setMensajeEliminacion] = useState('');
  const [tipoMensajeEliminacion, setTipoMensajeEliminacion] = useState('');

  // Función para cargar usuarios desde la API
  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    setErrorUsuarios('');
    
    try {
      const usuariosData = await adminService.obtenerUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      setErrorUsuarios('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Estado para manejar la tabla de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState('');

  // Manejo del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para el campo DNI
    if (name === 'dni') {
      const dniValidado = adminService.validarFormatoDNI(value);
      setFormData(prev => ({
        ...prev,
        [name]: dniValidado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar teclas presionadas en el campo DNI
  const handleDniKeyPress = (e) => {
    // Solo permitir números (0-9) y teclas especiales
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    setMessage('');
    
    // Preparar datos para enviar al backend
    const userData = {
      nombre_completo: formData.nombreCompleto,
      usuario: formData.usuario,
      dni: formData.dni,
      rol: formData.rol.toLowerCase() // Convertir a minúsculas para el backend
    };

    // Validar datos antes de enviar
    const validation = adminService.validarDatosUsuario(userData);
    if (!validation.isValid) {
      setMessage(validation.errors.join('. '));
      setMessageType('danger');
      return;
    }

    // Activar estado de carga
    setIsLoading(true);

    try {
      // Crear nuevo usuario
      const response = await adminService.crearUsuario(userData);
      setMessage(response.message || 'Usuario creado correctamente');
      setMessageType('success');
      
      // Recargar la lista de usuarios desde la API
      await cargarUsuarios();
      
      // Limpiar formulario
      setFormData({
        nombreCompleto: '',
        usuario: '',
        dni: '',
        rol: ''
      });

    } catch (error) {
      // Mostrar mensaje de error
      setMessage(error.message || 'Error al crear usuario. Intente nuevamente.');
      setMessageType('danger');
    } finally {
      // Desactivar estado de carga
      setIsLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    // Cargar datos del usuario en el formulario del modal
    setUsuarioEditar(usuario);
    setFormDataEdicion({
      nombreCompleto: '', // No editable, se mantiene vacío
      usuario: usuario.usuario || '',
      dni: usuario.dni || '',
      rol: usuario.rol || ''
    });
    
    // Limpiar mensajes del modal
    setMensajeEdicion('');
    setTipoMensajeEdicion('');
    
    // Mostrar modal
    setMostrarModalEdicion(true);
  };

  const handleCloseModal = () => {
    setMostrarModalEdicion(false);
    setUsuarioEditar(null);
    setFormDataEdicion({
      nombreCompleto: '',
      usuario: '',
      dni: '',
      rol: ''
    });
    setMensajeEdicion('');
    setTipoMensajeEdicion('');
    setIsLoadingEdicion(false);
  };

  const handleInputChangeEdicion = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para el campo DNI
    if (name === 'dni') {
      const dniValidado = adminService.validarFormatoDNI(value);
      setFormDataEdicion(prev => ({
        ...prev,
        [name]: dniValidado
      }));
    } else {
      setFormDataEdicion(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDniKeyPressEdicion = (e) => {
    // Solo permitir números (0-9) y teclas especiales
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    setMensajeEdicion('');
    
    // Preparar datos para enviar al backend (sin nombre completo)
    const userData = {
      usuario: formDataEdicion.usuario,
      dni: formDataEdicion.dni,
      rol: formDataEdicion.rol.toLowerCase()
    };

    // Validar datos básicos
    if (!userData.usuario || !userData.dni || !userData.rol) {
      setMensajeEdicion('Todos los campos son obligatorios');
      setTipoMensajeEdicion('danger');
      return;
    }

    // Validar DNI
    if (!/^\d{8}$/.test(userData.dni)) {
      setMensajeEdicion('El DNI debe tener exactamente 8 dígitos numéricos');
      setTipoMensajeEdicion('danger');
      return;
    }

    // Activar estado de carga
    setIsLoadingEdicion(true);

    try {
      // Actualizar usuario existente
      const response = await adminService.actualizarUsuario(usuarioEditar.id, userData);
      setMensajeEdicion(response.message || 'Usuario actualizado correctamente');
      setTipoMensajeEdicion('success');
      
      // Recargar la lista de usuarios desde la API
      await cargarUsuarios();
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        handleCloseModal();
      }, 1500);

    } catch (error) {
      // Mostrar mensaje de error
      setMensajeEdicion(error.message || 'Error al actualizar usuario. Intente nuevamente.');
      setTipoMensajeEdicion('danger');
    } finally {
      // Desactivar estado de carga
      setIsLoadingEdicion(false);
    }
  };

  const handleDelete = (usuario) => {
    setUsuarioEliminar(usuario);
    setMostrarModalEliminacion(true);
    setMensajeEliminacion('');
  };

  const handleCloseModalEliminacion = () => {
    setMostrarModalEliminacion(false);
    setUsuarioEliminar(null);
    setMensajeEliminacion('');
    setTipoMensajeEliminacion('');
  };

  const handleConfirmarEliminacion = async () => {
    if (!usuarioEliminar) return;

    setIsLoadingEliminacion(true);
    setMensajeEliminacion('');

    try {
      const response = await adminService.eliminarUsuario(usuarioEliminar.id);
      setMensajeEliminacion(response.message || 'Usuario eliminado correctamente');
      setTipoMensajeEliminacion('success');
      
      // Recargar la lista de usuarios
      await cargarUsuarios();
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        handleCloseModalEliminacion();
      }, 1500);

    } catch (error) {
      setMensajeEliminacion(error.message || 'Error al eliminar usuario. Intente nuevamente.');
      setTipoMensajeEliminacion('danger');
    } finally {
      setIsLoadingEliminacion(false);
    }
  };

  /* Backup / Restore handlers temporarily disabled while backend integration is pending
  const handleGenerateBackup = () => {
    // TODO: Implementar lógica de backup
    alert('Respaldo generado exitosamente');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implementar lógica de restauración
      alert(`Archivo ${file.name} cargado para restauración`);
    }
  };
  */

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
          
          .text-break {
            word-break: break-word;
            overflow-wrap: break-word;
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
          
          .card-body p {
            font-size: 0.75rem;
          }
        }
        
        /* Asegurar que los botones en columnas se vean bien */
        @media (max-width: 575px) {
          .d-flex.flex-column .btn {
            margin-bottom: 0.25rem;
          }
        }
        
        /* Mejoras adicionales para centrado y espaciado */
        .btn-form-action {
          min-width: 180px;
        }
        
        @media (min-width: 992px) {
          .btn-form-action {
            min-width: 200px;
          }
        }
        
        /* Asegurar centrado perfecto en móviles */
        @media (max-width: 576px) {
          .justify-content-center {
            text-align: center;
          }
          
          .card-body {
            text-align: center;
          }
          
          .form-label {
            text-align: left !important;
            display: block;
          }
          
          .table-responsive table {
            font-size: 0.8rem;
          }
        }
        
        /* Mejorar espaciado entre secciones */
        .card {
          margin-bottom: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .card {
            margin-bottom: 2rem;
          }
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
            min-width: 650px;
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
        <Navbar userRole="Administrador TI" />

        <div className="container mt-4">
          <h3 className="text-primary fw-bold mb-3">
            Módulo de Administración del Sistema (TI)
          </h3>

          {/* Panel de Monitoreo */}
          <TarjetasEstadisticasAdmin 
            totalUsuarios={usuarios.length}
            cargando={loadingUsuarios}
          />

          {/* Gestión de Usuarios */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold text-primary mb-3">Gestión de Usuarios y Roles</h5>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label fw-semibold">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    placeholder="Ej. Fabricio Seminario Vásquez"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label fw-semibold">Usuario</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    placeholder="Ej. SVfabricio"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-6 col-sm-6 col-lg-3">
                  <label className="form-label fw-semibold">DNI</label>
                  <input 
                    type="text" 
                    className={`form-control ${formData.dni && formData.dni.length === 8 ? 'is-valid' : formData.dni && formData.dni.length > 0 ? 'is-invalid' : ''}`}
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    onKeyDown={handleDniKeyPress}
                    placeholder="Ej. 12345678"
                    maxLength="8"
                    pattern="[0-9]{8}"
                    inputMode="numeric"
                    title="Ingrese exactamente 8 dígitos numéricos"
                    required
                    disabled={isLoading}
                  />
                  <div className={`form-text small ${formData.dni && formData.dni.length === 8 ? 'text-success' : formData.dni && formData.dni.length > 0 ? 'text-danger' : 'text-muted'}`}>
                    {formData.dni && formData.dni.length === 8 
                      ? '✓ DNI válido' 
                      : formData.dni && formData.dni.length > 0 
                        ? `Faltan ${8 - formData.dni.length} dígitos` 
                        : 'Exactamente 8 dígitos'
                    }
                  </div>
                </div>
                <div className="col-6 col-sm-6 col-lg-3">
                  <label className="form-label fw-semibold">Rol</label>
                  <select 
                    className="form-select"
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="rrhh">RRHH</option>
                    <option value="rrhh-vista">RRHH Vista (Solo lectura)</option>
                    <option value="administrador">Administrador TI</option>
                  </select>
                </div>
                <div className="col-12 d-flex justify-content-center mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-form-action"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        Creando Usuario...
                      </div>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Agregar Usuario
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Mensajes de éxito o error */}
              {message && (
                <div className="mt-3">
                  <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage('')}
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              )}

              <hr />

              {/* Tabla de usuarios */}
              <TablaUsuarios 
                usuarios={usuarios}
                cargando={loadingUsuarios}
                error={errorUsuarios}
                onEditar={handleEdit}
                onEliminar={handleDelete}
                onRecargar={cargarUsuarios}
              />
            </div>
          </div>

          {/*
          <div className="card shadow-sm mb-5">
            <div className="card-body">
              <h5 className="fw-semibold text-primary mb-4 text-center">
                Respaldo y Restauración de Base de Datos
              </h5>
              <div className="row g-4 justify-content-center align-items-start">
                <div className="col-12 col-md-5">
                  <div className="text-center">
                    <h6 className="fw-semibold text-secondary mb-3">Generar Respaldo</h6>
                    <p className="text-muted small mb-3">
                      Crear una copia de seguridad de la base de datos
                    </p>
                    <div className="d-grid">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={handleGenerateBackup}
                      >
                        💾 Generar respaldo (.SQL)
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-5">
                  <div className="text-center">
                    <h6 className="fw-semibold text-secondary mb-3">Restaurar Base de Datos</h6>
                    <p className="text-muted small mb-3">
                      Seleccionar archivo de respaldo para restaurar
                    </p>
                    <input 
                      type="file" 
                      className="form-control mb-3" 
                      accept=".sql"
                      onChange={handleFileUpload}
                    />
                    <div className="d-grid">
                      <button className="btn btn-outline-success">
                        🔄 Restaurar desde archivo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          */}
        </div>

        {/* Modal de Edición de Usuario */}
        {mostrarModalEdicion && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>
                    Editar Usuario - ID #{usuarioEditar?.id}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={handleCloseModal}
                    disabled={isLoadingEdicion}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <div>
                      <strong>Editando Usuario:</strong> {usuarioEditar?.usuario} - DNI: {usuarioEditar?.dni}
                    </div>
                  </div>

                  <form onSubmit={handleSubmitEdicion}>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Usuario</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="usuario"
                          value={formDataEdicion.usuario}
                          onChange={handleInputChangeEdicion}
                          placeholder="Ej. SVfabricio"
                          required
                          disabled={isLoadingEdicion}
                        />
                      </div>
                      
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">DNI</label>
                        <input 
                          type="text" 
                          className={`form-control ${formDataEdicion.dni && formDataEdicion.dni.length === 8 ? 'is-valid' : formDataEdicion.dni && formDataEdicion.dni.length > 0 ? 'is-invalid' : ''}`}
                          name="dni"
                          value={formDataEdicion.dni}
                          onChange={handleInputChangeEdicion}
                          onKeyDown={handleDniKeyPressEdicion}
                          placeholder="Ej. 12345678"
                          maxLength="8"
                          pattern="[0-9]{8}"
                          inputMode="numeric"
                          title="Ingrese exactamente 8 dígitos numéricos"
                          required
                          disabled={isLoadingEdicion}
                        />
                        <div className={`form-text small ${formDataEdicion.dni && formDataEdicion.dni.length === 8 ? 'text-success' : formDataEdicion.dni && formDataEdicion.dni.length > 0 ? 'text-danger' : 'text-muted'}`}>
                          {formDataEdicion.dni && formDataEdicion.dni.length === 8 
                            ? '✓ DNI válido' 
                            : formDataEdicion.dni && formDataEdicion.dni.length > 0 
                              ? `Faltan ${8 - formDataEdicion.dni.length} dígitos` 
                              : 'Exactamente 8 dígitos'
                          }
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label fw-semibold">Rol</label>
                        <select 
                          className="form-select"
                          name="rol"
                          value={formDataEdicion.rol}
                          onChange={handleInputChangeEdicion}
                          required
                          disabled={isLoadingEdicion}
                        >
                          <option value="">Seleccionar rol</option>
                          <option value="rrhh">RRHH</option>
                          <option value="rrhh-vista">RRHH Vista (Solo lectura)</option>
                          <option value="administrador">Administrador TI</option>
                        </select>
                      </div>
                    </div>

                    {/* Mensaje del modal */}
                    {mensajeEdicion && (
                      <div className="mt-3">
                        <div className={`alert alert-${tipoMensajeEdicion} alert-dismissible fade show`} role="alert">
                          {mensajeEdicion}
                          <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setMensajeEdicion('')}
                            aria-label="Close"
                          ></button>
                        </div>
                      </div>
                    )}

                    <div className="modal-footer border-0 pt-3 mt-3">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleCloseModal}
                        disabled={isLoadingEdicion}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-warning"
                        disabled={isLoadingEdicion}
                      >
                        {isLoadingEdicion ? (
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Actualizando...</span>
                            </div>
                            Actualizando Usuario...
                          </div>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Actualizar Usuario
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {mostrarModalEliminacion && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Confirmar Eliminación
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={handleCloseModalEliminacion}
                    disabled={isLoadingEliminacion}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                      <strong>¡Atención!</strong> Esta acción no se puede deshacer.
                    </div>
                  </div>

                  <p className="mb-3">
                    ¿Estás seguro de que deseas eliminar al siguiente usuario?
                  </p>

                  {usuarioEliminar && (
                    <div className="card bg-light border-0">
                      <div className="card-body py-2">
                        <div className="row g-2 text-sm">
                          <div className="col-6">
                            <strong>ID:</strong> {usuarioEliminar.id}
                          </div>
                          <div className="col-6">
                            <strong>Usuario:</strong> {usuarioEliminar.usuario}
                          </div>
                          <div className="col-6">
                            <strong>DNI:</strong> {usuarioEliminar.dni}
                          </div>
                          <div className="col-6">
                            <strong>Rol:</strong> {adminService.mapRoleToDisplay(usuarioEliminar.rol)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {mensajeEliminacion && (
                    <div className="mt-3">
                      <div className={`alert alert-${tipoMensajeEliminacion} alert-dismissible fade show`} role="alert">
                        {mensajeEliminacion}
                        <button 
                          type="button" 
                          className="btn-close" 
                          onClick={() => setMensajeEliminacion('')}
                          aria-label="Close"
                        ></button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModalEliminacion}
                    disabled={isLoadingEliminacion}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleConfirmarEliminacion}
                    disabled={isLoadingEliminacion}
                  >
                    {isLoadingEliminacion ? (
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Eliminando...</span>
                        </div>
                        Eliminando Usuario...
                      </div>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Eliminar Usuario
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-muted py-3 small">
          © 2025 Municipalidad Provincial de San Miguel — Módulo Administración TI
        </footer>
      </div>
    </>
  );
};

export default Admin;