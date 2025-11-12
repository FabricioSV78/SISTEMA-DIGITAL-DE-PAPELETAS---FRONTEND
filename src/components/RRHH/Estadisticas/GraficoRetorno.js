import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const GraficoRetorno = ({ data }) => {
  if (!data || (data.conRetorno === 0 && data.sinRetorno === 0)) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <i className="bi bi-arrow-repeat text-warning"></i>
          Papeletas con/sin Retorno
        </div>
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox display-4 opacity-25"></i>
          <p className="mt-2">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Con Retorno', value: data.conRetorno, color: '#28a745' },
    { name: 'Sin Retorno', value: data.sinRetorno, color: '#ffc107' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1 fw-semibold">{data.payload.name}</p>
          <p className="mb-0">
            <strong>{data.value}</strong> papeletas ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="chart-title">
        <i className="bi bi-arrow-repeat text-warning"></i>
        Papeletas con/sin Retorno
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Estadísticas adicionales */}
      <div className="row g-2 mt-3">
        <div className="col-6">
          <div className="text-center p-3 bg-success bg-opacity-10 rounded">
            <h5 className="text-success mb-1">{data.conRetorno}</h5>
            <small className="text-muted">Con Retorno</small>
          </div>
        </div>
        <div className="col-6">
          <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
            <h5 className="text-warning mb-1">{data.sinRetorno}</h5>
            <small className="text-muted">Sin Retorno</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoRetorno;