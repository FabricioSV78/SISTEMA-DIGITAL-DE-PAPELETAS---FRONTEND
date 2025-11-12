import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const GraficoDiasLaborables = ({ data }) => {
  // Filtrar solo días laborables (por seguridad adicional)
  const diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const dataFiltrada = data.filter(item => diasLaborables.includes(item.dia));
  
  // Colores para cada día de la semana
  const coloresDias = {
    'Lunes': '#8884d8',
    'Martes': '#82ca9d', 
    'Miércoles': '#ffc658',
    'Jueves': '#ff7c7c',
    'Viernes': '#8dd1e1'
  };

  const dataConColores = dataFiltrada.map(item => ({
    ...item,
    color: coloresDias[item.dia] || '#8884d8'
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: 0, color: payload[0].color }}>
            {`Papeletas: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(...dataFiltrada.map(d => d.cantidad), 1);
  const yAxisMax = Math.ceil(maxValue * 1.2);

  return (
    <div className="chart-container mb-4">
      <div className="chart-header">
        <h6 className="chart-title">
          <i className="bi bi-calendar-week me-2"></i>
          Incidencia por Días de la Semana Actual
        </h6>
        <small className="text-muted">📅 Lunes a Viernes de la semana actual</small>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer>
          <BarChart data={dataConColores} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="dia"
              tick={{ fontSize: 14 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, yAxisMax]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
              {dataConColores.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Estadística adicional */}
      <div className="row mt-1">
        <div className="col-12">
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '5px',
            fontSize: '0.9em'
          }}>
            <strong>📊 Resumen:</strong>
            {dataFiltrada.length > 0 ? (
              <>
                <span className="ms-2">
                  Día con mayor incidencia: <strong>{dataFiltrada.reduce((max, current) => 
                    current.cantidad > max.cantidad ? current : max
                  ).dia}</strong> ({dataFiltrada.reduce((max, current) => 
                    current.cantidad > max.cantidad ? current : max
                  ).cantidad} papeletas)
                </span>
                <span className="ms-3">
                  Promedio diario: <strong>{(dataFiltrada.reduce((sum, d) => sum + d.cantidad, 0) / dataFiltrada.length).toFixed(1)}</strong> papeletas
                </span>
              </>
            ) : (
              <span className="ms-2">No hay datos de días laborables disponibles</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoDiasLaborables;