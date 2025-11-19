import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente selector de tiempo con opciones preestablecidas
 */
const SelectorTiempo = ({ tipo, mostrar, onCerrar, valorActual, onSeleccionar }) => {
  if (!mostrar) return null;

  const [horaActual, minutosActuales] = valorActual 
    ? valorActual.split(':').map(Number) 
    : [0, 0];

  const horas = Array.from({ length: 24 }, (_, i) => i);
  const minutos = [0, 15, 30, 45];

  const horariosPreestablecidos = {
    horaSalida: ['08:00', '08:30', '09:00', '14:00', '15:00'],
    horaRetorno: ['12:00', '13:00', '17:00', '17:30', '18:00']
  };

  const handleSeleccionarHora = (hora, minuto) => {
    const tiempoFormateado = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
    onSeleccionar(tipo, tiempoFormateado);
    onCerrar();
  };

  const handleAhora = () => {
    const ahora = new Date();
    handleSeleccionarHora(ahora.getHours(), ahora.getMinutes());
  };

  return (
    <div 
      className="position-absolute bg-white border rounded shadow-lg p-3 mt-1" 
      style={{ zIndex: 1050, minWidth: '280px' }}
    >
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
            onClick={handleAhora}
          >
            <i className="bi bi-clock-fill me-1"></i>
            Ahora ({new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })})
          </button>
        </div>

        {/* Horarios preestablecidos */}
        <div className="d-flex gap-1 flex-wrap">
          {horariosPreestablecidos[tipo].map(hora => {
            const [h, m] = hora.split(':').map(Number);
            return (
              <button
                key={hora}
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleSeleccionarHora(h, m)}
              >
                {hora}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector manual */}
      <div className="row g-2">
        <div className="col-6">
          <label className="form-label small fw-semibold">Hora</label>
          <select 
            className="form-select form-select-sm"
            value={horaActual || 0}
            onChange={(e) => handleSeleccionarHora(parseInt(e.target.value), minutosActuales || 0)}
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
            onChange={(e) => handleSeleccionarHora(horaActual || 0, parseInt(e.target.value))}
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

SelectorTiempo.propTypes = {
  tipo: PropTypes.oneOf(['horaSalida', 'horaRetorno']).isRequired,
  mostrar: PropTypes.bool.isRequired,
  onCerrar: PropTypes.func.isRequired,
  valorActual: PropTypes.string,
  onSeleccionar: PropTypes.func.isRequired
};

export default SelectorTiempo;
