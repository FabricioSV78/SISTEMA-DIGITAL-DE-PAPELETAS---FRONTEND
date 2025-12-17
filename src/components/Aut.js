import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Aut = () => {
  const navigate = useNavigate();

  // Estados para el formulario de login
  const [loginData, setLoginData] = useState({
    usuario: '',
    dni: ''
  });

  // Estado para mostrar alertas
  const [alert, setAlert] = useState('');

  // Estado para controlar el spinner de carga
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el tipo de alerta (success, danger)
  const [alertType, setAlertType] = useState('danger');

  /**
   * Redirigir al módulo correspondiente según el rol
   * @param {string} role - Rol del usuario
   */
  const redirectToUserModule = useCallback((role) => {
    switch (role.toLowerCase()) {
      case 'rrhh':
      case 'rrhh-vista': // Usuario de solo consulta
        navigate('/rrhh');
        break;
      case 'administrador':
      case 'admin': // Alias para compatibilidad con backend
        navigate('/admin');
        break;
      default:
        console.error('Rol no reconocido:', role);
        setAlert('Error: Rol de usuario no reconocido.');
        setAlertType('danger');
    }
  }, [navigate]);

  // Verificar si ya está autenticado al cargar el componente
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      redirectToUserModule(authService.mapRole(user.rol));
    }
  }, [redirectToUserModule]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { usuario, dni } = loginData;

    // Validación básica
    if (!usuario || !dni) {
      setAlert('Por favor ingrese usuario y DNI.');
      setAlertType('danger');
      return;
    }

    // Activar spinner de carga
    setIsLoading(true);
    setAlert('');

    try {
      // Llamar al servicio de autenticación
      const response = await authService.login(usuario, dni);
      
      // Login exitoso - mostrar mensaje de bienvenida
      showLoginSuccess(response);
    } catch (error) {
      // Manejar errores
      setAlert(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');
      setAlertType('danger');
      setIsLoading(false);
    }
  };

  /**
   * Manejar login exitoso con redirección automática
   * @param {Object} loginResponse - Respuesta del login del backend
   */
  const showLoginSuccess = (loginResponse) => {
    const { user_data, message } = loginResponse;
    
    // Mostrar mensaje de bienvenida con spinner
    setAlert(message || `Bienvenido, ${user_data.nombre_completo}. Redirigiendo...`);
    setAlertType('success');
    
    // Redirigir automáticamente según el rol después de 1.5 segundos
    setTimeout(() => {
      const mappedRole = authService.mapRole(user_data.rol);
      redirectToUserModule(mappedRole);
    }, 1500);
  };

  return (
    <>
      {/* Estilos CSS específicos del componente */}
      <style jsx>{`
        .auth-body {
          background: linear-gradient(135deg, #007bff 0%, #00c6ff 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
        }
        
        .auth-container {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          animation: fadeIn 0.6s ease-in-out;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .auth-header h4 {
          color: #000000;
          font-weight: 700;
        }
        
        .form-control, .form-select {
          border-radius: 10px;
          padding: 0.7rem 1rem;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .form-label i {
          color: #007bff;
          margin-right: 0.5rem;
        }
        
        .btn-primary {
          border-radius: 10px;
          font-weight: 600;
          width: 100%;
          padding: 0.7rem;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        
        .role-label {
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .auth-footer {
          position: fixed;
          bottom: 10px;
          width: 100%;
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.9);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Responsive design */
        @media (max-width: 576px) {
          .auth-container {
            padding: 1.5rem;
            margin: 1rem;
            max-width: calc(100% - 2rem);
          }
          
          .auth-header h4 {
            font-size: 1.25rem;
          }
          
          .auth-header p {
            font-size: 0.75rem;
          }
          
          .auth-header img {
            width: 50px;
          }
          
          .form-control, .form-select {
            padding: 0.6rem 0.8rem;
            font-size: 0.9rem;
          }
          
          .btn-primary {
            padding: 0.6rem;
            font-size: 0.95rem;
          }
          
          .auth-footer {
            font-size: 0.75rem;
            padding: 0 1rem;
          }
        }
        
        @media (min-width: 577px) and (max-width: 768px) {
          .auth-container {
            padding: 1.75rem;
            margin: 1.5rem;
          }
          
          .auth-header h4 {
            font-size: 1.4rem;
          }
          
          .auth-header img {
            width: 55px;
          }
        }
        
        @media (max-width: 480px) {
          .auth-body {
            padding: 0.5rem;
          }
          
          .auth-container {
            border-radius: 15px;
            padding: 1.25rem;
          }
          
          .form-label {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="auth-body">
        <div className="auth-container">
          <div className="auth-header">
            <img src="/muni-c.png" alt="logo" width="60" className="mb-2" />
            <h4>Sistema Digital de Papeletas</h4>
            <p className="text-muted small mb-0">Municipalidad Provincial de San Miguel</p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-person"></i>
                Usuario
              </label>
              <input 
                name="usuario"
                value={loginData.usuario}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Ej. mtorres"
                disabled={isLoading}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="bi bi-credit-card"></i>
                DNI
              </label>
              <input 
                name="dni"
                value={loginData.dni}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Ej. 71328546"
                disabled={isLoading}
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="d-flex align-items-center justify-content-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  Ingresando...
                </div>
              ) : (
                'Ingresar'
              )}
            </button>
            
            {alert && (
              <div className="mt-3">
                <div className={`alert alert-${alertType} small`}>
                  {alertType === 'success' && isLoading ? (
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      {alert}
                    </div>
                  ) : (
                    alert
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="auth-footer">
          © 2025 Municipalidad Provincial de San Miguel
        </div>
      </div>
    </>
  );
};

export default Aut;