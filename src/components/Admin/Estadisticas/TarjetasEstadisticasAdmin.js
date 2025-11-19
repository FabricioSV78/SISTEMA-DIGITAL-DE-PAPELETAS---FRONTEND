import React from 'react';
import PropTypes from 'prop-types';

/**
 * Tarjetas de estadísticas del panel de administrador
 */
const TarjetasEstadisticasAdmin = ({ totalUsuarios, cargando }) => {
  return (
    <div className="row g-3 mb-2">
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm border-0 bg-primary text-white">
          <div className="card-body py-2 py-md-3">
            <h6 className="fw-semibold small">Total de Usuarios</h6>
            <h3 className="fw-bold mb-0">
              {cargando ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              ) : (
                totalUsuarios
              )}
            </h3>
          </div>
        </div>
      </div>
   
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm border-0 bg-info text-dark">
          <div className="card-body py-2 py-md-3">
            <h6 className="fw-semibold small">Último respaldo</h6>
            <p className="fw-bold mb-0 small">30/10/2025 - 08:30 a.m.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

TarjetasEstadisticasAdmin.propTypes = {
  totalUsuarios: PropTypes.number.isRequired,
  cargando: PropTypes.bool.isRequired
};

export default TarjetasEstadisticasAdmin;
