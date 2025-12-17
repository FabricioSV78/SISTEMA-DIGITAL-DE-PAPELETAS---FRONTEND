import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GraficoDuracion = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <i className="bi bi-stopwatch text-secondary"></i>
          Duración Promedio por Área
        </div>
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox display-4 opacity-25"></i>
          <p className="mt-2">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Convertir minutos a horas y minutos para mejor visualización
  const formatearDuracion = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    }
    return `${mins}m`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const duracion = payload[0].value;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1 fw-semibold">{label}</p>
          <p className="mb-0 text-primary">
            Promedio: <strong>{formatearDuracion(duracion)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="chart-title">
        <i className="bi bi-stopwatch text-secondary"></i>
        Duración Promedio por Área
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis 
            dataKey="area" 
            stroke="#6c757d"
            fontSize={14}
            angle={-35}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            stroke="#6c757d" 
            fontSize={12}
            tickFormatter={(value) => formatearDuracion(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="duracionPromedio" 
            fill="#6f42c1"
            radius={[4, 4, 0, 0]}
            name="Duración Promedio"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Tabla resumen */}
      <div className="mt-3">
        <h6 className="text-muted mb-3">Resumen por Área:</h6>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="table-light">
              <tr>
                <th>Área</th>
                <th>Duración Promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="small">{item.area}</td>
                  <td className="small fw-semibold text-primary">
                    {formatearDuracion(item.duracionPromedio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GraficoDuracion;