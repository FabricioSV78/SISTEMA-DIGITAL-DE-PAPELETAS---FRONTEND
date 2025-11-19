import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Componente de filtros para papeletas
 */
const FiltrosPapeletas = ({
  filtros,
  motivosUnicos,
  cargando,
  onFiltroChange,
  onBuscar,
  onLimpiar,
  onVerEstadisticas,
  onImprimir
}) => {
  const { fechaInicio, fechaFin } = filtros;

  // Local state para el rango del DatePicker
  // Helper: parse YYYY-MM-DD into a Date at local midnight
  const parseYMDToLocalDate = (ymd) => {
    if (!ymd) return null;
    const parts = ymd.split('-').map(Number);
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  // Helper: format Date to YYYY-MM-DD using local date (avoid toISOString timezone shift)
  const formatDateLocal = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [range, setRange] = useState([
    parseYMDToLocalDate(fechaInicio),
    parseYMDToLocalDate(fechaFin)
  ]);
  const [startDate, endDate] = range;
  // Control manual del open/close del DatePicker para cerrarlo al seleccionar fecha final
  const [open, setOpen] = useState(false);

  // Sincronizar si los filtros cambian desde fuera
  useEffect(() => {
    setRange([parseYMDToLocalDate(fechaInicio), parseYMDToLocalDate(fechaFin)]);
  }, [fechaInicio, fechaFin]);

  // Validación simple del rango de fechas: fechaFin no puede ser anterior a fechaInicio
  let fechaRangeError = '';
  let isFechaRangeValid = true;
  if (startDate && endDate) {
    if (endDate < startDate) {
      isFechaRangeValid = false;
      fechaRangeError = 'La fecha "Hasta" no puede ser anterior a la fecha "Desde".';
    }
  }
  return (
      <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold text-primary mb-0">Filtrar y Consultar Papeletas</h5>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onVerEstadisticas}
          >
            <i className="bi bi-bar-chart me-1"></i>
            Ver Estadísticas
          </button>
        </div>
        <form className="row g-3 filtros-form">
          <div className="col-12 col-sm-6 col-md-3">
            <input 
              type="text" 
              className="form-control"
              name="dni"
              value={filtros.dni}
              onChange={onFiltroChange}
              placeholder="Buscar por DNI"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-3 d-flex align-items-center">
            <div className="w-100 filtros-date-row d-flex align-items-center">
              <div className="d-flex gap-3 w-100">
                <div className="date-wrapper d-flex flex-column" style={{minWidth: 0}}>
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                      dateFormat="yyyy/MM/dd"
                    onChange={(update) => {
                      // update puede ser [Date, Date] o null
                      setRange(update || [null, null]);
                      const [s, e] = update || [null, null];
                      // sincronizar con el handler externo usando fechas formateadas en local (YYYY-MM-DD)
                      onFiltroChange({ target: { name: 'fechaInicio', value: s ? formatDateLocal(s) : '' } });
                      onFiltroChange({ target: { name: 'fechaFin', value: e ? formatDateLocal(e) : '' } });
                      // Si ya hay fecha de inicio y ahora seleccionaron fecha fin, cerramos el calendario
                      if (s && e) {
                        setOpen(false);
                      }
                    }}
                    isClearable
                    className={`form-control filtros-date-input ${!isFechaRangeValid ? 'is-invalid' : ''}`}
                    placeholderText="Filtrar por rango de fechas"
                    shouldCloseOnSelect={false}
                    open={open}
                    onInputClick={() => setOpen(true)}
                    onClickOutside={() => setOpen(false)}
                  />
                
                  {!isFechaRangeValid && (
                    <div className="invalid-feedback d-block text-center mt-1" style={{fontSize: '0.8rem'}}>
                      {fechaRangeError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <select 
              className="form-select"
              name="motivo"
              value={filtros.motivo}
              onChange={onFiltroChange}
            >
              <option value="">Seleccionar motivo</option>
              {motivosUnicos.map(motivo => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <button 
              type="button" 
              className="btn btn-primary w-100"
              onClick={onBuscar}
              disabled={cargando || !isFechaRangeValid}
            >
              {cargando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Actualizando...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </>
              )}
            </button>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary w-50"
                onClick={onLimpiar}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="btn btn-outline-primary w-50"
                onClick={onImprimir}
                disabled={!isFechaRangeValid || cargando}
              >
                <i className="bi bi-printer me-1"></i>
                Imprimir
              </button>
            </div>
          </div>
        </form>
      </div>
      <style jsx>{`
        /* Ensure date inputs don't force the column to overflow */
        .filtros-date-row .filtros-date-input {
          flex: 1 1 0%;
          min-width: 0; /* allow shrinking inside flex */
        }

        /* Keep consistent vertical alignment and spacing with other controls */
        .filtros-form .form-control,
        .filtros-form .form-select {
          height: calc(1.5em + .75rem + 2px);
        }

        /* Make the inline label match spacing but not push inputs down */
        .filtros-date-row .small {
          line-height: 1;
          margin-top: 0;
          margin-bottom: 0;
          white-space: nowrap;
        }

        /* Ensure each date-wrapper occupies similar spacing as other controls */
        .filtros-form .date-wrapper {
          flex: 1 1 0%;
          min-width: 0;
        }

        /* Keep consistent gap between filter controls (columns) */
        .filtros-form > .col-12,
        .filtros-form > .col-12 > .w-100 {
          display: flex;
          align-items: center;
        }

        .filtros-form .form-control,
        .filtros-form .form-select {
          margin-bottom: 0;
        }

        @media (max-width: 575px) {
          .filtros-date-row {
            gap: .5rem;
            flex-direction: column;
            align-items: stretch;
          }

          .filtros-date-row .small {
            display: block;
            margin-bottom: .25rem;
          }
        }
      `}</style>
    </div>
  );
};

FiltrosPapeletas.propTypes = {
  filtros: PropTypes.shape({
    dni: PropTypes.string,
    fechaInicio: PropTypes.string,
    fechaFin: PropTypes.string,
    motivo: PropTypes.string
  }).isRequired,
  motivosUnicos: PropTypes.arrayOf(PropTypes.string).isRequired,
  cargando: PropTypes.bool.isRequired,
  onFiltroChange: PropTypes.func.isRequired,
  onBuscar: PropTypes.func.isRequired,
  onLimpiar: PropTypes.func.isRequired,
  onVerEstadisticas: PropTypes.func.isRequired
  , onImprimir: PropTypes.func.isRequired
};

export default FiltrosPapeletas;
