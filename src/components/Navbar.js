import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import authService from '../services/authService';

/**
 * Componente de barra de navegación
 * @param {string} userRole - Rol del usuario actual
 */
const Navbar = ({ userRole = "Administrador TI" }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Usar el servicio de autenticación para cerrar sesión
    authService.logout();
    
    // Mostrar mensaje de confirmación (opcional)
    console.log("Sesión cerrada exitosamente");
    
    // Redirigir a la página de login
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Estilos CSS del navbar */}
      <style jsx>{`
        /* Estilos personalizados para navbar con mejor contraste */
        .navbar-custom {
          background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
          box-shadow: 0 2px 10px rgba(30, 58, 138, 0.3);
        }
        
        .navbar-custom .navbar-brand {
          color: #ffffff !important;
        }
        
        .navbar-custom .navbar-brand small {
          color: #e5e7eb !important;
          opacity: 1 !important;
        }
        
        .navbar-custom .user-info {
          color: #f3f4f6 !important;
        }
        
        .navbar-custom .btn-outline-light {
          border-color: #ffffff;
          color: #ffffff;
          font-weight: 500;
        }
        
        .navbar-custom .btn-outline-light:hover {
          background-color: #ffffff;
          color: #1e3a8a;
        }
        
        /* Responsive navbar mejorado */
        @media (max-width: 480px) {
          .navbar-brand img {
            width: 35px !important;
            height: 47px !important;
          }
          
          .navbar-brand div {
            font-size: 0.75rem;
          }
          
          .navbar-brand small {
            font-size: 0.6rem !important;
            display: none;
          }
          
          .navbar .container {
            padding-left: 8px;
            padding-right: 8px;
          }
          
          .btn-sm {
            padding: 0.15rem 0.3rem;
            font-size: 0.7rem;
          }
        }
        
        @media (min-width: 481px) and (max-width: 576px) {
          .navbar-brand img {
            width: 45px !important;
            height: 60px !important;
          }
          
          .navbar-brand div {
            font-size: 0.85rem;
          }
          
          .navbar-brand small {
            font-size: 0.65rem !important;
          }
          
          .navbar .container {
            padding-left: 10px;
            padding-right: 10px;
          }
        }
        
        @media (min-width: 577px) and (max-width: 768px) {
          .navbar-brand img {
            width: 55px !important;
            height: 73px !important;
          }
          
          .navbar-brand div {
            font-size: 0.95rem;
          }
          
          .navbar-brand small {
            font-size: 0.75rem !important;
          }
          
          .navbar .container {
            padding-left: 15px;
            padding-right: 15px;
          }
        }
        
        @media (min-width: 769px) and (max-width: 992px) {
          .navbar-brand img {
            width: 65px !important;
            height: 87px !important;
          }
        }
        
        /* Mejoras adicionales para responsive */
        .navbar-brand {
          flex-shrink: 1;
          min-width: 0;
        }
        
        .navbar-brand div {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        @media (max-width: 576px) {
          .navbar-custom {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
        }
      `}</style>

      {/* Navbar JSX */}
      <nav className="navbar navbar-expand-lg navbar-custom shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center fw-bold" href="/">
            <img 
              src="/muni-c.png" 
              alt="Logo Municipalidad" 
              width="71" 
              height="95" 
              className="me-2 me-md-3"
            />
            <div>
              <div className="fw-bold">Sistema Digital de Papeletas</div>
              <small className="d-block">Municipalidad Provincial de San Miguel</small>
            </div>
          </a>
          
          <div className="d-flex align-items-center">
            <span className="user-info me-3 d-none d-md-inline">
              <i className="bi bi-person-circle me-1"></i>
              <small>{userRole}</small>
            </span>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              <span className="d-none d-sm-inline">Cerrar Sesión</span>
              <span className="d-sm-none">Salir</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

Navbar.propTypes = {
  userRole: PropTypes.string
};

export default Navbar;