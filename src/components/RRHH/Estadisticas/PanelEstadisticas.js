import React, { useState } from 'react';
import { useEstadisticas } from '../../../hooks/useEstadisticas';
import GraficoPorArea from './GraficoPorArea';
import GraficoPorMotivo from './GraficoPorMotivo';
import GraficoRetorno from './GraficoRetorno';
import GraficoTopEmpleados from './GraficoTopEmpleados';
import GraficoDuracion from './GraficoDuracion';
import GraficoDiasLaborables from './GraficoDiasLaborables';

const PanelEstadisticas = ({ papeletas, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const { estadisticas } = useEstadisticas(papeletas);

  if (!isVisible) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: 'bi-graph-up' },
    { id: 'areas', label: 'Por Área', icon: 'bi-building' },
    { id: 'empleados', label: 'Empleados', icon: 'bi-people' }
  ];

  return (
    <div className={`estadisticas-panel ${isVisible ? 'show' : ''}`}>
      <style jsx>{`
        .estadisticas-panel {
          position: fixed;
          top: 0;
          right: -750px;
          width: 750px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 1050;
          display: flex;
          flex-direction: column;
        }
        
        .estadisticas-panel.show {
          right: 0;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .estadisticas-panel {
            right: -100vw;
            width: 100vw;
            left: 0;
          }
          
          .estadisticas-panel.show {
            right: 0;
          }
        }
        
        @media (max-width: 1400px) {
          .estadisticas-panel {
            right: -650px;
            width: 650px;
          }
        }
        
        @media (max-width: 1200px) {
          .estadisticas-panel {
            right: -550px;
            width: 550px;
          }
        }
        
        .panel-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .nav-tabs {
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 0;
        }
        
        .nav-tabs .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          background: none;
          color: #6c757d;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 1rem 1.5rem;
          white-space: nowrap;
        }
        
        .nav-tabs .nav-link.active {
          border-bottom-color: #667eea;
          color: #667eea;
          font-weight: 600;
          background: none;
        }
        
        .nav-tabs .nav-link:hover:not(.active) {
          color: #495057;
          border-bottom-color: #dee2e6;
        }
        
        .chart-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e9ecef;
          transition: box-shadow 0.3s ease;
        }
        
        .chart-container:hover {
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
        }
        
        .chart-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #495057;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 2px solid #f8f9fa;
          padding-bottom: 1rem;
        }
        
        .chart-title i {
          font-size: 1.3rem;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 1.75rem 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
          border: 1px solid #dee2e6;
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
          text-align: center;
          margin-bottom: 1rem;
          border: 1px solid #dee2e6;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
          display: block;
        }
        
        .stat-label {
          color: #6c757d;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
      `}</style>

      {/* Header */}
      <div className="panel-header">
        <div>
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-bar-chart-line me-2"></i>
            Estadísticas RRHH
          </h4>
          <small className="opacity-75">{papeletas.length} papeletas registradas</small>
        </div>
        <button 
          className="btn btn-light btn-sm"
          onClick={onClose}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 pt-3">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map(tab => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`${tab.icon} me-1`}></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="panel-content">
        {activeTab === 'general' && (
          <div>

            <GraficoDiasLaborables data={estadisticas.porDiaLaboral} />
            <GraficoRetorno data={estadisticas.retornoStats} />
            <GraficoPorMotivo data={estadisticas.porMotivo} />
          </div>
        )}

        {activeTab === 'areas' && (
          <div>
            <GraficoPorArea data={estadisticas.porArea} />
            <GraficoDuracion data={estadisticas.duracionPromedio} />
          </div>
        )}

        {activeTab === 'empleados' && (
          <div>
            <GraficoTopEmpleados data={estadisticas.topEmpleados} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelEstadisticas;