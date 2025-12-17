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

  // Selector mensual: formato yyyy-mm (input type="month")
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const monthDefault = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const [selectedMonth, setSelectedMonth] = useState(monthDefault);

  const getMonthStartEnd = (monthStr) => {
    if (!monthStr) return {};
    const [y, m] = monthStr.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0); // last day of month
    const toYMD = (d) => d.toISOString().split('T')[0];
    return { start: toYMD(start), end: toYMD(end) };
  };

  const prevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1); // month-1 index
    setSelectedMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  const nextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setSelectedMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  // Filtrar papeletas por el mes seleccionado (si hay papeletas)
  const { start, end } = getMonthStartEnd(selectedMonth);
  const papeletasFiltradasPorMes = Array.isArray(papeletas) && start && end
    ? papeletas.filter(p => {
        const fecha = p.fecha ? p.fecha.split('T')[0] : p.fecha;
        return fecha >= start && fecha <= end;
      })
    : papeletas;

  const { estadisticas } = useEstadisticas(papeletasFiltradasPorMes);

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
        
        /* Responsive design mejorado */
        @media (max-width: 480px) {
          .estadisticas-panel {
            right: -100vw;
            width: 100vw;
            left: 0;
          }
          
          .estadisticas-panel.show {
            right: 0;
          }
          
          .panel-header {
            padding: 1rem !important;
          }
          
          .panel-header h4 {
            font-size: 1rem !important;
          }
          
          .panel-header small {
            font-size: 0.75rem !important;
          }
          
          .panel-content {
            padding: 0.75rem !important;
          }
          
          .chart-container {
            padding: 1rem !important;
            margin-bottom: 1rem !important;
          }
          
          .chart-title {
            font-size: 0.9rem !important;
            margin-bottom: 1rem !important;
          }
          
          .nav-tabs .nav-link {
            padding: 0.75rem 0.5rem !important;
            font-size: 0.8rem !important;
          }
          
          .nav-tabs .nav-link i {
            display: none;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .estadisticas-panel {
            right: -100vw;
            width: 100vw;
            left: 0;
          }
          
          .estadisticas-panel.show {
            right: 0;
          }
          
          .panel-header {
            padding: 1.25rem 1.5rem;
          }
          
          .panel-header h4 {
            font-size: 1.1rem;
          }
          
          .panel-content {
            padding: 1rem;
          }
          
          .chart-container {
            padding: 1.25rem;
          }
          
          .nav-tabs .nav-link {
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }
        }
        
        @media (min-width: 769px) and (max-width: 992px) {
          .estadisticas-panel {
            right: -500px;
            width: 500px;
          }
          
          .panel-content {
            padding: 1.25rem;
          }
          
          .chart-container {
            padding: 1.5rem;
          }
        }
        
        @media (min-width: 993px) and (max-width: 1200px) {
          .estadisticas-panel {
            right: -550px;
            width: 550px;
          }
        }
        
        @media (min-width: 1201px) and (max-width: 1400px) {
          .estadisticas-panel {
            right: -650px;
            width: 650px;
          }
        }
        
        .panel-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        
        .panel-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1.5rem;
          -webkit-overflow-scrolling: touch;
        }
        
        .nav-tabs {
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 0;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
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
          flex-shrink: 0;
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
        
        /* Mejorar scroll en móvil */
        @media (max-width: 768px) {
          .panel-content::-webkit-scrollbar {
            width: 4px;
          }
          
          .panel-content::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          .panel-content::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          .nav-tabs::-webkit-scrollbar {
            height: 3px;
          }
          
          .nav-tabs::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          .nav-tabs::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 3px;
          }
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

        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div className="d-flex align-items-center" style={{gap:8}}>
            <button className="btn btn-sm btn-light" title="Mes anterior" onClick={prevMonth}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <input
              type="month"
              className="form-control form-control-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{width: '160px'}}
              aria-label="Seleccionar mes"
            />
            <button className="btn btn-sm btn-light" title="Mes siguiente" onClick={nextMonth}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <button className="btn btn-sm btn-outline-light" title="Mostrar todo" onClick={() => setSelectedMonth('')}>
            Todo
          </button>
          <button 
            className="btn btn-light btn-sm"
            onClick={onClose}
            title="Cerrar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
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