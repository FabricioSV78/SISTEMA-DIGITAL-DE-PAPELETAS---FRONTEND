import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GraficoTopEmpleados = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <i className="bi bi-people text-primary"></i>
          Top 4 Empleados (Por cantidad de papeletas)
        </div>
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox display-4 opacity-25"></i>
          <p className="mt-2">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Tomar solo los primeros 4 empleados para mejor visualización
  const topData = data.slice(0, 4);

  return (
    <div className="chart-container">
      <div className="chart-title">
        <i className="bi bi-people text-primary"></i>
        Top 4 Empleados (Por cantidad de papeletas)
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={topData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis 
            dataKey="empleado" 
            stroke="#6c757d"
            fontSize={14}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tickFormatter={(value) => {
              // Truncar nombres largos
              return value.length > 15 ? value.substring(0, 13) + '...' : value;
            }}
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
            formatter={(value, name, props) => [
              `${value} papeletas`,
              props.payload.empleado
            ]}
          />
          <Bar 
            dataKey="cantidad" 
            fill="#667eea"
            radius={[4, 4, 0, 0]}
            name="Papeletas"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Lista adicional */}
      <div className="mt-3">
        <h6 className="text-muted mb-3">Top 4 Empleados:</h6>
        <div className="row">
          {data.slice(0, 4).map((empleado, index) => (
            <div key={index} className="col-12 mb-2">
              <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">{index + 1}</span>
                  <small className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                    {empleado.empleado}
                  </small>
                </div>
                <span className="badge bg-secondary">{empleado.cantidad}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraficoTopEmpleados;