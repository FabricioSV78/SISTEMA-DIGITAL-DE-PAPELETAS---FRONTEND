import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GraficoPorDia = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <i className="bi bi-calendar3 text-info"></i>
          Papeletas por Día (Últimos 7 días)
        </div>
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox display-4 opacity-25"></i>
          <p className="mt-2">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-title">
        <i className="bi bi-calendar3 text-info"></i>
        Papeletas por Día (Últimos 7 días)
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis 
            dataKey="fecha" 
            stroke="#6c757d"
            fontSize={12}
          />
          <YAxis 
            stroke="#6c757d" 
            fontSize={12}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '13px'
            }}
            labelStyle={{ color: '#495057' }}
          />
          <Line 
            type="monotone" 
            dataKey="cantidad" 
            stroke="#667eea"
            strokeWidth={3}
            dot={{ r: 6, fill: '#667eea' }}
            activeDot={{ r: 8, fill: '#764ba2' }}
            name="Papeletas"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPorDia;