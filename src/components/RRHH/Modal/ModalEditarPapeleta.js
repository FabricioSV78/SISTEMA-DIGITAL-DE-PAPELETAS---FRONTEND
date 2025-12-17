import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MOTIVOS_PAPELETA, AREAS } from '../../../config/constants';
import Autocomplete from '../../Common/Autocomplete';
import SelectorTiempo from '../SelectorTiempo/SelectorTiempo';

/**
 * Componente Modal de Edición de Papeleta
 */
const ModalEditarPapeleta = ({
  mostrar,
  papeleta,
  onCerrar,
  onGuardar,
  cargando,
  
}) => {
  const [formData, setFormData] = useState({
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

  const [sinRetorno, setSinRetorno] = useState(false);
  const [mostrarSelectorSalida, setMostrarSelectorSalida] = useState(false);
  const [mostrarSelectorRetorno, setMostrarSelectorRetorno] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Cargar datos de la papeleta al abrir el modal
  useEffect(() => {
    if (mostrar && papeleta) {
      setFormData({
        nombreCompleto: papeleta.trabajador || '',
        dni: papeleta.dni || '',
        codigo: papeleta.codigo || '',
        area: papeleta.area || '',
        cargo: papeleta.cargo || '',
        regimenLaboral: papeleta.regimenLaboral || '',
        oficinaVisitar: papeleta.oficinaVisitar || '',
        motivo: papeleta.motivo || '',
        fundamentacion: papeleta.fundamentacion || '',
        fecha: papeleta.fecha || '',
        horaSalida: papeleta.horaSalida || '',
        horaRetorno: papeleta.horaRetorno === 'Sin retorno' ? '' : papeleta.horaRetorno || ''
      });
      setSinRetorno(papeleta.horaRetorno === 'Sin retorno');
      setMensaje({ tipo: '', texto: '' });
    }
  }, [mostrar, papeleta]);

  // Controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (mostrar) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [mostrar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSinRetornoChange = (e) => {
    const checked = e.target.checked;
    setSinRetorno(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, horaRetorno: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    
    try {
      await onGuardar(papeleta.id, formData);
    } catch (error) {
      setMensaje({
        tipo: 'danger',
        texto: error.message || 'Error al actualizar la papeleta'
      });
    }
  };

  const seleccionarHora = (tipo, tiempo) => {
    setFormData(prev => ({
      ...prev,
      [tipo]: tiempo
    }));
  };

  if (!mostrar) return null;

  return (
    <>
      {/* Mensajes de error/éxito por encima del modal */}
      {mensaje && mensaje.texto && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x mt-3" 
          style={{ zIndex: 1060, width: '90%', maxWidth: '500px' }}
        >
          <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show shadow-lg`} role="alert">
            <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            <strong>{mensaje.tipo === 'success' ? 'Éxito:' : 'Error:'}</strong> {mensaje.texto}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMensaje({ tipo: '', texto: '' })}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              Editar Papeleta
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onCerrar}
              aria-label="Close"
              disabled={cargando}
            ></button>
          </div>
          
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="formEditarPapeleta">
              {/* Información del Trabajador */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">
                    <i className="bi bi-person-fill me-2"></i>
                    Información del Trabajador
                  </h6>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Nombre Completo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">
                    DNI <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    maxLength="8"
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-semibold">
                    Código <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">
                    Área <span className="text-danger">*</span>
                  </label>
                  <Autocomplete
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    suggestions={AREAS}
                    placeholder="Escriba para buscar área (ej. recursos)"
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">Cargo</label>
                  <input
                    type="text"
                    className="form-control"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">Régimen Laboral</label>
                  <select
                    className="form-select"
                    name="regimenLaboral"
                    value={formData.regimenLaboral}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar régimen</option>
                    <option value="728">728</option>
                    <option value="276">276</option>
                    <option value="1057">1057</option>
                    <option value="30057">30057</option>
                  </select>
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
                  <label className="form-label fw-semibold">Oficina o Entidad a Visitar</label>
                  <input
                    type="text"
                    className="form-control"
                    name="oficinaVisitar"
                    value={formData.oficinaVisitar}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Motivo</label>
                  <select
                    className="form-select"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar motivo...</option>
                    {MOTIVOS_PAPELETA.map(motivo => (
                      <option key={motivo} value={motivo}>{motivo}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">Fundamentación</label>
                  <textarea
                    className="form-control"
                    name="fundamentacion"
                    value={formData.fundamentacion}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Horarios y Fechas */}
              <div className="row mb-3">
                <div className="col-12">
                  <h6 className="text-warning fw-bold border-bottom pb-2 mb-3">
                    <i className="bi bi-calendar-clock me-2"></i>
                    Horarios y Fechas
                  </h6>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">
                    Fecha de la Papeleta <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    Hora de Salida <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.horaSalida}
                    onClick={() => setMostrarSelectorSalida(true)}
                    readOnly
                    required
                    placeholder="Seleccionar hora..."
                  />
                  <SelectorTiempo
                    tipo="horaSalida"
                    mostrar={mostrarSelectorSalida}
                    onCerrar={() => setMostrarSelectorSalida(false)}
                    valorActual={formData.horaSalida}
                    onSeleccionar={seleccionarHora}
                  />
                </div>
                <div className="col-md-4 mb-3 position-relative">
                  <label className="form-label fw-semibold">Hora de Retorno</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.horaRetorno}
                    onClick={() => !sinRetorno && setMostrarSelectorRetorno(true)}
                    readOnly
                    disabled={sinRetorno}
                    placeholder={sinRetorno ? 'Sin retorno' : 'Seleccionar hora...'}
                  />
                  <SelectorTiempo
                    tipo="horaRetorno"
                    mostrar={mostrarSelectorRetorno}
                    onCerrar={() => setMostrarSelectorRetorno(false)}
                    valorActual={formData.horaRetorno}
                    onSeleccionar={seleccionarHora}
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sinRetornoEdit"
                      checked={sinRetorno}
                      onChange={handleSinRetornoChange}
                    />
                    <label className="form-check-label" htmlFor="sinRetornoEdit">
                      Sin retorno
                    </label>
                  </div>
                </div>
              </div>
            </form>
            </div>
            
            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onCerrar}
                disabled={cargando}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                form="formEditarPapeleta"
                className="btn btn-success"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
      </div>
    </div>
    </>
  );
};

ModalEditarPapeleta.propTypes = {
  mostrar: PropTypes.bool.isRequired,
  papeleta: PropTypes.shape({
    id: PropTypes.number,
    trabajador: PropTypes.string,
    dni: PropTypes.string,
    codigo: PropTypes.string,
    area: PropTypes.string,
    cargo: PropTypes.string,
    regimenLaboral: PropTypes.string,
    oficinaVisitar: PropTypes.string,
    motivo: PropTypes.string,
    fundamentacion: PropTypes.string,
    fecha: PropTypes.string,
    horaSalida: PropTypes.string,
    horaRetorno: PropTypes.string
  }),
  onCerrar: PropTypes.func.isRequired,
  onGuardar: PropTypes.func.isRequired,
  cargando: PropTypes.bool
  
};

export default ModalEditarPapeleta;
