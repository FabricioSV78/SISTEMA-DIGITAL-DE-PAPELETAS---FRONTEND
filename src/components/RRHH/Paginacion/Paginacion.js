import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de paginación
 */
const Paginacion = ({
  paginaActual,
  totalPaginas,
  onPaginaAnterior,
  onPaginaSiguiente,
  onCambiarPagina
}) => {
  if (totalPaginas <= 1) return null;

  const renderNumerosPagina = () => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(totalPaginas, inicio + maxPaginasVisibles - 1);

    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(
        <li key={i} className={`page-item ${paginaActual === i ? 'active' : ''}`}>
          <button
            className="page-link"
            onClick={() => onCambiarPagina(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    return paginas;
  };

  return (
    <nav aria-label="Paginación de papeletas">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={onPaginaAnterior}
            disabled={paginaActual === 1}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>

        {renderNumerosPagina()}

        <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={onPaginaSiguiente}
            disabled={paginaActual === totalPaginas}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

Paginacion.propTypes = {
  paginaActual: PropTypes.number.isRequired,
  totalPaginas: PropTypes.number.isRequired,
  onPaginaAnterior: PropTypes.func.isRequired,
  onPaginaSiguiente: PropTypes.func.isRequired,
  onCambiarPagina: PropTypes.func.isRequired
};

export default Paginacion;
