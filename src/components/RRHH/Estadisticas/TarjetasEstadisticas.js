import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de tarjetas de estadísticas resumidas
 * Mantiene el diseño original con tarjetas grandes centradas y colores de fondo
 */
const TarjetasEstadisticas = ({ estadisticas, cargando }) => {
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card text-center shadow-sm border-0 bg-primary text-white h-100">
          <div className="card-body d-flex flex-column justify-content-center py-3">
            <div className="mb-2">
              <i className="bi bi-clipboard-data fs-1"></i>
            </div>
            <h6 className="fw-semibold mb-2">Total de Papeletas</h6>
            <h2 className="fw-bold mb-0">
              {cargando ? (
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
              {cargando ? (
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
              {cargando ? (
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
              {cargando ? (
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
  );
};

TarjetasEstadisticas.propTypes = {
  estadisticas: PropTypes.shape({
    totalPapeletas: PropTypes.number.isRequired,
    papeletasHoy: PropTypes.number.isRequired,
    areaMasSolicitada: PropTypes.string.isRequired,
    papeletasSinRetorno: PropTypes.number.isRequired
  }).isRequired,
  cargando: PropTypes.bool.isRequired
};

export default TarjetasEstadisticas;
