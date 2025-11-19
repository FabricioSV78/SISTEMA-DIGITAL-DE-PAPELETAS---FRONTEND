import React from 'react';
import PropTypes from 'prop-types';

const TablaPapeletas = ({ 
  papeletas, 
  cargando, 
  error, 
  totalFiltrados,
  paginaActual,
  elementosPorPagina,
  onCargarPapeletas,
  onVerDetalle 
}) => {
  const calcularRangoMostrado = () => {
    if (totalFiltrados === 0) return null;
    const inicio = (paginaActual - 1) * elementosPorPagina + 1;
    const fin = Math.min(paginaActual * elementosPorPagina, totalFiltrados);
    return { inicio, fin };
  };

  const rango = calcularRangoMostrado();

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold text-primary mb-0">
            Listado de Papeletas
          </h5>
          <div className="text-muted small">
            {rango && (
              <>
                Mostrando {rango.inicio} - {rango.fin} de {totalFiltrados} resultados
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
              {cargando ? (
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
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-4 text-danger">
                    <div className="d-flex justify-content-center align-items-center flex-column">
                      <i className="bi bi-exclamation-triangle mb-2" style={{fontSize: '1.5rem'}}></i>
                      {error}
                      <button 
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={onCargarPapeletas}
                      >
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : papeletas.length > 0 ? (
                papeletas.map(papeleta => (
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
                        onClick={() => onVerDetalle(papeleta.id)}
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
      </div>
    </div>
  );
};

TablaPapeletas.propTypes = {
  papeletas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      codigo: PropTypes.string,
      trabajador: PropTypes.string,
      dni: PropTypes.string,
      area: PropTypes.string,
      fecha: PropTypes.string,
      motivo: PropTypes.string,
      oficinaVisitar: PropTypes.string,
      horaSalida: PropTypes.string,
      horaRetorno: PropTypes.string
    })
  ).isRequired,
  cargando: PropTypes.bool.isRequired,
  error: PropTypes.string,
  totalFiltrados: PropTypes.number.isRequired,
  paginaActual: PropTypes.number.isRequired,
  elementosPorPagina: PropTypes.number.isRequired,
  onCargarPapeletas: PropTypes.func.isRequired,
  onVerDetalle: PropTypes.func.isRequired
};

TablaPapeletas.defaultProps = {
  error: null
};

export default TablaPapeletas;
