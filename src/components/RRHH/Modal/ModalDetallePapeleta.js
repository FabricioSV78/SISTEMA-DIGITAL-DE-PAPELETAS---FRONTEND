import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { generarPdfReporte } from '../../../utils/reportGenerator';

/**
 * Componente Modal de Detalles de Papeleta
 */
const ModalDetallePapeleta = ({
  mostrar,
  cargando,
  error,
  papeleta,
  onCerrar,
  onEditar,
  puedeEditar
}) => {
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

  if (!mostrar) return null;

  return (
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
              onClick={onCerrar}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            {cargando ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary me-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <span>Cargando detalles de la papeleta...</span>
              </div>
            ) : error ? (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            ) : papeleta ? (
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
                    <div className="p-2 bg-light rounded">{papeleta.trabajador}</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-semibold text-muted small">DNI</label>
                    <div className="p-2 bg-light rounded">{papeleta.dni}</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-semibold text-muted small">Código</label>
                    <div className="p-2 bg-light rounded fw-bold text-primary">{papeleta.codigo}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold text-muted small">Área</label>
                    <div className="p-2 bg-light rounded">{papeleta.area}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold text-muted small">Cargo</label>
                    <div className="p-2 bg-light rounded">{papeleta.cargo}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold text-muted small">Régimen Laboral</label>
                    <div className="p-2 bg-light rounded">{papeleta.regimenLaboral}</div>
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
                    <div className="p-2 bg-light rounded">{papeleta.oficinaVisitar}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold text-muted small">Motivo</label>
                    <div className="p-2 bg-light rounded">{papeleta.motivo}</div>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold text-muted small">Fundamentación</label>
                    <div className="p-2 bg-light rounded" style={{minHeight: '60px'}}>
                      {papeleta.fundamentacion}
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
                    <div className="p-2 bg-light rounded">{papeleta.fecha}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold text-muted small">Hora de Salida</label>
                    <div className="p-2 bg-light rounded">{papeleta.horaSalida}</div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold text-muted small">Hora de Retorno</label>
                    <div className={`p-2 rounded ${papeleta.horaRetorno === 'Sin retorno' ? 'bg-warning bg-opacity-25 text-warning-emphasis' : 'bg-light'}`}>
                      {papeleta.horaRetorno}
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold text-muted small">Fecha de Registro en el Sistema</label>
                    <div className="p-2 bg-light rounded small text-muted">{papeleta.fechaCreacion}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          
          <div className="modal-footer bg-light">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCerrar}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cerrar
            </button>
            {papeleta && (
              <>
                {puedeEditar && (
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={() => onEditar(papeleta)}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Editar
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await generarPdfReporte([papeleta], {}, {
                        title: `Detalle Papeleta - ${papeleta.codigo || papeleta.trabajador || ''}`,
                        filename: `papeleta-${papeleta.codigo || papeleta.dni || 'detalle'}.pdf`,
                        detail: true
                      });
                    } catch (err) {
                      // Fallback a print dialog si falla la generación de PDF
                      console.error('Error generando PDF:', err);
                      window.print();
                    }
                  }}
                >
                  <i className="bi bi-printer me-2"></i>
                  Imprimir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ModalDetallePapeleta.propTypes = {
  mostrar: PropTypes.bool.isRequired,
  cargando: PropTypes.bool.isRequired,
  error: PropTypes.string,
  papeleta: PropTypes.shape({
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
    horaRetorno: PropTypes.string,
    fechaCreacion: PropTypes.string
  }),
  onCerrar: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  puedeEditar: PropTypes.bool.isRequired
};

export default ModalDetallePapeleta;
