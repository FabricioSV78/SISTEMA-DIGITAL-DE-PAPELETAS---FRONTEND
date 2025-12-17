import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

const GraficoPorMotivo = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <i className="bi bi-list-task text-success"></i>
          Papeletas por Motivo
        </div>
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox display-4 opacity-25"></i>
          <p className="mt-2">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1 fw-semibold">{data.payload.motivo}</p>
          <p className="mb-0 text-primary">
            <strong>{data.value}</strong> papeletas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="chart-title">
        <i className="bi bi-list-task text-success"></i>
        Papeletas por Motivo
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ motivo, percent }) => 
              percent > 0.05 ? `${motivo} (${(percent * 100).toFixed(0)}%)` : ''
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="cantidad"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPorMotivo;