import { useMemo } from 'react';

export const useEstadisticas = (papeletas) => {
  const estadisticas = useMemo(() => {
    
    if (!papeletas || papeletas.length === 0) {
      return {
        totalPapeletas: 0,
        papeletasHoy: 0,
        areaMasSolicitada: 'N/A',
        papeletasSinRetorno: 0,
        porArea: [],
        porMotivo: [],
        porDia: [],
        porDiaLaboral: [],
        retornoStats: { conRetorno: 0, sinRetorno: 0 },
        topEmpleados: [],
        duracionPromedio: []
      };
    }

    const totalPapeletas = papeletas.length;
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    const papeletasHoy = papeletas.filter(p => p.fecha === fechaHoy).length;
    
    const papeletasSinRetorno = papeletas.filter(p => !p.horaRetorno).length;

    const porArea = Object.entries(
      papeletas.reduce((acc, p) => {
        const area = p.area || 'Sin área';
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {})
    ).map(([area, cantidad]) => ({ area, cantidad }))
     .sort((a, b) => b.cantidad - a.cantidad);
     
    const areaMasSolicitada = porArea.length > 0 ? porArea[0].area : 'N/A';

    const porMotivo = Object.entries(
      papeletas.reduce((acc, p) => {
        const motivo = p.motivo || 'Sin especificar';
        acc[motivo] = (acc[motivo] || 0) + 1;
        return acc;
      }, {})
    ).map(([motivo, cantidad]) => ({ motivo, cantidad }))
     .sort((a, b) => b.cantidad - a.cantidad);

    const fechaBase = new Date();
    const fechas = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(fechaBase);
      fecha.setDate(fechaBase.getDate() - i);
      fechas.push(fecha.toISOString().split('T')[0]);
    }
    
    const porDia = fechas.map(fecha => {
      const cantidad = papeletas.filter(p => p.fecha === fecha).length;
      return {
        fecha: new Date(fecha).toLocaleDateString('es-ES', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        cantidad
      };
    });

    // 3.1. Papeletas por días laborables de la semana actual (lunes a viernes)
    console.log('📅 Calculando semana laboral actual (lunes a viernes)...');
    const fechaActual = new Date();
    console.log('Fecha actual:', fechaActual.toISOString(), '- Local:', fechaActual.toLocaleDateString());
    
    // Encontrar el lunes de esta semana
    const hoyDiaSemana = fechaActual.getDay(); // 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
    console.log('Hoy es día de la semana:', hoyDiaSemana, ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][hoyDiaSemana]);
    console.log('Fecha de hoy:', fechaActual.getDate(), '/', fechaActual.getMonth() + 1, '/', fechaActual.getFullYear());
    
    // Calcular cuántos días restar para llegar al lunes
    let diasHastaLunes;
    if (hoyDiaSemana === 0) { // Si hoy es domingo
      diasHastaLunes = -1; // Avanzar 1 día para llegar al lunes siguiente
    } else {
      diasHastaLunes = hoyDiaSemana - 1; // Retroceder hasta el lunes de esta semana
    }
    
    console.log('Días a ajustar para llegar al lunes de esta semana:', diasHastaLunes);
    
    const lunesDeEstaSemana = new Date(fechaActual);
    lunesDeEstaSemana.setDate(fechaActual.getDate() - diasHastaLunes);
    
    console.log('Lunes de esta semana calculado:', lunesDeEstaSemana.toISOString().split('T')[0]);
    console.log('Fecha del lunes:', lunesDeEstaSemana.getDate(), '/', lunesDeEstaSemana.getMonth() + 1, '/', lunesDeEstaSemana.getFullYear());
    console.log('Verificación - día de la semana del lunes:', lunesDeEstaSemana.getDay(), '(debe ser 1)');
    
    // Generar todos los días laborables de la semana (lunes a viernes)
    const fechasLaborablesSemana = [];
    const nombresDias = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
    
    console.log('\n🗓️ Calculando fechas de lunes a viernes:');
    console.log('Fecha base (lunes):', lunesDeEstaSemana.toISOString().split('T')[0]);
    
    for (let i = 0; i < 5; i++) { // 5 días laborables: 0=lunes, 1=martes, 2=miércoles, 3=jueves, 4=viernes
      const fecha = new Date(lunesDeEstaSemana);
      fecha.setDate(lunesDeEstaSemana.getDate() + i);
      const fechaString = fecha.toISOString().split('T')[0];
      const diaSemanaCalc = fecha.getDay();
      
      fechasLaborablesSemana.push(fechaString);
      console.log(`${nombresDias[i]} (día ${i}): ${fechaString} (${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}) - Día semana: ${diaSemanaCalc}`);
    }
    
    console.log('✅ Fechas laborables completas (debe ser 5 días):', fechasLaborablesSemana);
    console.log('Total de días calculados:', fechasLaborablesSemana.length);
    
    const porDiaLaboral = fechasLaborablesSemana.map((fecha, index) => {
      // Usar índice fijo para días laborables: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes
      const nombresDiasLaborables = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
      const nombreDiaSemana = nombresDiasLaborables[index];
      
      console.log(`\n🔍 Procesando ${nombreDiaSemana} ${fecha}`);
      
      // Filtrar papeletas que coincidan con esta fecha (usando p.fecha, NO p.fechaCreacion)
      const papeletasDelDia = papeletas.filter(p => {
        // IMPORTANTE: Usar p.fecha (fecha de la papeleta) NO p.fechaCreacion
        const fechaPapeleta = p.fecha ? p.fecha.split('T')[0] : p.fecha;
        const coincide = fechaPapeleta === fecha;
        
        if (coincide) {
          console.log(`   ✅ Papeleta coincidente: DNI=${p.dni}, fecha_papeleta="${p.fecha}", trabajador="${p.trabajador || p.nombreCompleto}"`);
        }
        
        return coincide;
      });
      
      const cantidad = papeletasDelDia.length;
      console.log(`   📊 Total papeletas encontradas para ${nombreDiaSemana}: ${cantidad}`);
      
      const fechaObj = new Date(fecha);
      const fechaCorta = fechaObj.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      return {
        fecha: `${nombreDiaSemana} ${fechaCorta}`,
        dia: nombreDiaSemana,
        cantidad
      };
    });
    
    console.log('\n📊 Resultado final del gráfico - Semana laboral actual:');
    console.log('Total días procesados:', porDiaLaboral.length);
    porDiaLaboral.forEach((dia, index) => {
      console.log(`${index + 1}. ${dia.dia}: ${dia.cantidad} papeletas`);
    });

    const conRetorno = papeletas.filter(p => p.horaRetorno && p.horaRetorno.trim() !== '').length;
    const sinRetorno = papeletas.length - conRetorno;
    const retornoStats = { conRetorno, sinRetorno };

    const topEmpleados = Object.entries(
      papeletas.reduce((acc, p) => {
        const empleado = p.trabajador || p.nombreCompleto || p.empleado || 'Sin nombre';
        acc[empleado] = (acc[empleado] || 0) + 1;
        return acc;
      }, {})
    ).map(([empleado, cantidad]) => ({ empleado, cantidad }))
     .sort((a, b) => b.cantidad - a.cantidad)
     .slice(0, 10);

    const duracionPromedio = porArea.map(({ area }) => {
      const papeletasArea = papeletas.filter(p => 
        p.area === area && p.horaRetorno && p.horaSalida
      );
      
      if (papeletasArea.length === 0) {
        return { area, duracionPromedio: 0 };
      }

      const totalMinutos = papeletasArea.reduce((acc, p) => {
        try {
          const [salidaH, salidaM] = p.horaSalida.split(':').map(Number);
          const [retornoH, retornoM] = p.horaRetorno.split(':').map(Number);
          const salidaMinutos = salidaH * 60 + salidaM;
          const retornoMinutos = retornoH * 60 + retornoM;
          const duracion = retornoMinutos - salidaMinutos;
          return acc + (duracion > 0 ? duracion : 0);
        } catch (error) {
          return acc;
        }
      }, 0);

      const duracionPromedio = papeletasArea.length > 0 
        ? Math.round(totalMinutos / papeletasArea.length) 
        : 0;
      return { area, duracionPromedio };
    }).filter(item => item.duracionPromedio > 0);

    return {
      totalPapeletas,
      papeletasHoy,
      areaMasSolicitada,
      papeletasSinRetorno,
      porArea,
      porMotivo,
      porDia,
      porDiaLaboral,
      retornoStats,
      topEmpleados,
      duracionPromedio
    };
  }, [papeletas]);

  return { estadisticas };
};