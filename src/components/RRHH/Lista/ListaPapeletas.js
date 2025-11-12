import React from 'react';

const ListaPapeletas = ({ papeletas, filtros, setFiltros }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5>Lista de Papeletas</h5>
      </div>
      <div className="card-body">
        {/* Filtros */}
        <div className="row mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por DNI"
              value={filtros.dni}
              onChange={(e) => setFiltros(prev => ({ ...prev, dni: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              type="date"
              className="form-control"
              value={filtros.fecha}
              onChange={(e) => setFiltros(prev => ({ ...prev, fecha: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filtros.motivo}
              onChange={(e) => setFiltros(prev => ({ ...prev, motivo: e.target.value }))}
            >
              <option value="">Seleccionar motivo</option>
              <option value="Comisión de servicios">Comisión de servicios</option>
              <option value="Atención médica">Atención médica</option>
              <option value="Capacitación">Capacitación</option>
              <option value="Asuntos particulares">Asuntos particulares</option>
            </select>
          </div>
        </div>
        
        {/* Lista de papeletas */}
        <div className="row">
          {papeletas && papeletas.length > 0 ? (
            papeletas.map((papeleta, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">{papeleta.nombreCompleto}</h6>
                    <p className="card-text">
                      <strong>DNI:</strong> {papeleta.dni}<br/>
                      <strong>Área:</strong> {papeleta.area}<br/>
                      <strong>Motivo:</strong> {papeleta.motivo}<br/>
                      <strong>Fecha:</strong> {papeleta.fecha}<br/>
                      <strong>Salida:</strong> {papeleta.horaSalida}
                      {papeleta.horaRetorno && (
                        <><br/><strong>Retorno:</strong> {papeleta.horaRetorno}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="text-center text-muted">No hay papeletas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaPapeletas;