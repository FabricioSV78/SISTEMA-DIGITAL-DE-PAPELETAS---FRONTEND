import React from 'react';

const FormularioPapeleta = ({ papeletaForm, setPapeletaForm, handleSubmit, cargandoFormulario }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5>Registrar Nueva Papeleta</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                className="form-control"
                value={papeletaForm.nombreCompleto}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, nombreCompleto: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">DNI</label>
              <input
                type="text"
                className="form-control"
                value={papeletaForm.dni}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, dni: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Área</label>
              <input
                type="text"
                className="form-control"
                value={papeletaForm.area}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, area: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Motivo</label>
              <input
                type="text"
                className="form-control"
                value={papeletaForm.motivo}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, motivo: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-control"
                value={papeletaForm.fecha}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, fecha: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Hora Salida</label>
              <input
                type="time"
                className="form-control"
                value={papeletaForm.horaSalida}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, horaSalida: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Hora Retorno</label>
              <input
                type="time"
                className="form-control"
                value={papeletaForm.horaRetorno}
                onChange={(e) => setPapeletaForm(prev => ({ ...prev, horaRetorno: e.target.value }))}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={cargandoFormulario}
          >
            {cargandoFormulario ? 'Guardando...' : 'Guardar Papeleta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioPapeleta;