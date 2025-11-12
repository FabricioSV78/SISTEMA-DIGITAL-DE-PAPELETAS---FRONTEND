import React from 'react';

const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';
  
  return (
    <div className={`d-flex justify-content-center`}>
      <div className={`spinner-border text-${color} ${sizeClass}`} role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
};

export default Spinner;