import React from 'react';

const Notificacion = ({ mensaje, tipo = 'info', mostrar = false, onClose }) => {
  if (!mostrar) return null;

  const alertClass = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  }[tipo] || 'alert-info';

  return (
    <div className={`alert ${alertClass} alert-dismissible fade show`} role="alert">
      {mensaje}
      {onClose && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Notificacion;