import React from 'react';
import PropTypes from 'prop-types';

/**
 * Tabla de listado de usuarios del sistema
 */
const TablaUsuarios = ({
  usuarios,
  cargando,
  error,
  onEditar,
  onEliminar,
  onRecargar
}) => {
  const mapRoleToDisplay = (rol) => {
    const roleNames = {
      'administrador': 'Administrador TI',
      'rrhh': 'RRHH'
    };
    return roleNames[rol?.toLowerCase()] || rol;
  };

  return (
    <div>
      {/* Header de la tabla con botón de refrescar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-semibold">Lista de Usuarios</h6>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={onRecargar}
          disabled={cargando}
        >
          {cargando ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-1" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <span className="d-none d-sm-inline">Cargando...</span>
            </div>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1"></i>
              <span className="d-none d-sm-inline">Refrescar</span>
            </>
          )}
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th style={{minWidth: '60px'}}>ID</th>
              <th style={{minWidth: '120px'}}>Usuario</th>
              <th style={{minWidth: '120px'}}>DNI</th>
              <th style={{minWidth: '140px'}}>Rol</th>
              <th style={{minWidth: '160px'}}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="5" className="py-4">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    Cargando usuarios...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="py-4 text-danger">
                  <div className="d-flex justify-content-center align-items-center flex-column">
                    <i className="bi bi-exclamation-triangle mb-2" style={{fontSize: '1.5rem'}}></i>
                    {error}
                    <button 
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={onRecargar}
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-muted">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.usuario}</td>
                  <td>{usuario.dni}</td>
                  <td>{mapRoleToDisplay(usuario.rol)}</td>
                  <td>
                    <div className="d-flex flex-column flex-lg-row gap-1 justify-content-center align-items-center">
                      <button 
                        className="btn btn-sm btn-outline-primary px-3"
                        onClick={() => onEditar(usuario)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger px-3"
                        onClick={() => onEliminar(usuario)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TablaUsuarios.propTypes = {
  usuarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      usuario: PropTypes.string.isRequired,
      dni: PropTypes.string.isRequired,
      rol: PropTypes.string.isRequired
    })
  ).isRequired,
  cargando: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onRecargar: PropTypes.func.isRequired
};

TablaUsuarios.defaultProps = {
  error: null
};

export default TablaUsuarios;
