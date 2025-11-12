import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GraficoPorArea = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <i className="bi bi-building text-primary"></i>
          Papeletas por Área
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
        <i className="bi bi-building text-primary"></i>
        Papeletas por Área
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 90 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis 
            dataKey="area" 
            angle={-35}
            textAnchor="end"
            height={90}
            fontSize={14}
            stroke="#6c757d"
            interval={0}
          />
          <YAxis stroke="#6c757d" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '13px'
            }}
          />
          <Bar 
            dataKey="cantidad" 
            fill="#667eea"
            radius={[4, 4, 0, 0]}
            name="Papeletas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPorArea;