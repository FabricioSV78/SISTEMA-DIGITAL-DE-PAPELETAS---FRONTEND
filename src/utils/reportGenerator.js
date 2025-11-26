import html2pdf from 'html2pdf.js';

/**
 * Genera y descarga un PDF a partir de los datos de papeletas y filtros.
 * Mantiene el mismo comportamiento que la implementación previa en RRHH.js.
 * @param {Array} papeletasFiltradas
 * @param {Object} filtros
 * @param {Object} [opts] - Opciones adicionales (title, filename)
 * @returns {Promise<void>}
 */
export async function generarPdfReporte(papeletasFiltradas = [], filtros = {}, opts = {}) {
  const title = opts.title || 'Reporte de Papeletas';
  const fechaGeneracion = new Date().toLocaleString();
  const logoUrl = opts.logo || '/muni-c.png';

  // Resumen de filtros aplicados
  const filtrosAplicados = [];
  if (filtros.dni) filtrosAplicados.push(`DNI: ${filtros.dni}`);
  if (filtros.fechaInicio || filtros.fechaFin) {
    const desde = filtros.fechaInicio || '-';
    const hasta = filtros.fechaFin || '-';
    filtrosAplicados.push(`Fecha: ${desde} - ${hasta}`);
  }
  if (filtros.motivo) filtrosAplicados.push(`Motivo: ${filtros.motivo}`);
  const filtrosHtml = filtrosAplicados.length ? filtrosAplicados.join(' | ') : 'Ninguno';

  // Construir filas de la tabla (escape básico de valores)
  const escapeHtml = (str) => String(str === null || str === undefined ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  const rows = papeletasFiltradas.map(p => `
    <tr>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.codigo || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.trabajador || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.dni || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.area || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.fecha || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.motivo || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.regimenLaboral || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.oficinaVisitar || '')}</td>
      <td style="border:1px solid #ddd; padding:8px">${escapeHtml(p.horaSalida ? (p.horaRetorno ? p.horaSalida + ' - ' + p.horaRetorno : p.horaSalida + ' - Sin retorno') : (p.horaRetorno ? p.horaRetorno : ''))}</td>
    </tr>
  `).join('');

  // Si se pasó una sola papeleta y el caller solicita un detalle, renderizar una vista detallada
  if (papeletasFiltradas.length === 1 && opts.detail) {
    const p = papeletasFiltradas[0];
    const detalleHtml = `
      <style>
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        td, th { page-break-inside: avoid; -webkit-column-break-inside: avoid; }
        @media print {
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
        }
      </style>
      <div style="font-family: Arial, Helvetica, sans-serif; color: #222; padding: 18px; max-width:800px; margin:0 auto; background:#fff;">
        <header style="margin-bottom:12px; display:flex; align-items:center; gap:12px;">
          <img src="${escapeHtml(logoUrl)}" alt="Logo" style="width:84px; height:auto; object-fit:contain;" crossorigin="anonymous" />
          <div style="flex:1">
            <h1 style="font-size:18px; margin:0 0 4px 0; color:#0d6efd">${escapeHtml(title)}</h1>
            <div style="font-size:12px; color:#555">Municipalidad Provincial de San Miguel • Generado: ${escapeHtml(fechaGeneracion)}</div>
            <div style="font-size:12px; color:#666; margin-top:6px">Filtros: ${escapeHtml(filtrosHtml)}</div>
          </div>
        </header>

        <section style="margin-top:14px; margin-bottom:14px; border:1px solid #e9ecef; padding:12px; border-radius:6px; background:#fff;">
          <h2 style="font-size:13px; margin:0 0 10px 0; color:#0d6efd; border-bottom:1px dashed #e9ecef; padding-bottom:8px;">Información del Trabajador</h2>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:8px;">
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa; vertical-align:top;"><strong>Nombre</strong></td>
              <td style="padding:8px">${escapeHtml(p.trabajador || '')}</td>
              <td style="width:20%; padding:8px; background:#f8f9fa; vertical-align:top;"><strong>DNI</strong></td>
              <td style="padding:8px">${escapeHtml(p.dni || '')}</td>
            </tr>
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa;"><strong>Cod-papeleta</strong></td>
              <td style="padding:8px">${escapeHtml(p.codigo || '')}</td>
              <td style="width:20%; padding:8px; background:#f8f9fa;"><strong>Área</strong></td>
              <td style="padding:8px">${escapeHtml(p.area || '')}</td>
            </tr>
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa;"><strong>Cargo</strong></td>
              <td style="padding:8px">${escapeHtml(p.cargo || '')}</td>
              <td style="width:20%; padding:8px; background:#f8f9fa;"><strong>Régimen</strong></td>
              <td style="padding:8px">${escapeHtml(p.regimenLaboral || '')}</td>
            </tr>
          </table>
        </section>

        <section style="margin-bottom:14px; border:1px solid #e9ecef; padding:12px; border-radius:6px; background:#fff;">
          <h2 style="font-size:13px; margin:0 0 10px 0; color:#198754; border-bottom:1px dashed #e9ecef; padding-bottom:8px;">Información de la Papeleta</h2>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:8px;">
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa;"><strong>Entidad visitada</strong></td>
              <td style="padding:8px">${escapeHtml(p.oficinaVisitar || '')}</td>
              <td style="width:20%; padding:8px; background:#f8f9fa;"><strong>Motivo</strong></td>
              <td style="padding:8px">${escapeHtml(p.motivo || '')}</td>
            </tr>
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa; vertical-align:top;"><strong>Fundamentación</strong></td>
              <td style="padding:8px" colspan="3"><div style="padding:10px; background:#f8f9fa; border-radius:4px;">${escapeHtml(p.fundamentacion || '')}</div></td>
            </tr>
          </table>
        </section>

        <section style="margin-bottom:6px; border:1px solid #e9ecef; padding:12px; border-radius:6px; background:#fff;">
          <h2 style="font-size:13px; margin:0 0 10px 0; color:#ffc107; border-bottom:1px dashed #e9ecef; padding-bottom:8px;">Horarios y Fechas</h2>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:8px;">
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa;"><strong>Fecha papeleta</strong></td>
              <td style="padding:8px">${escapeHtml(p.fecha || '')}</td>
              <td style="width:20%; padding:8px; background:#f8f9fa;"><strong>Hora salida</strong></td>
              <td style="padding:8px">${escapeHtml(p.horaSalida || '')}</td>
            </tr>
            <tr>
              <td style="width:30%; padding:8px; background:#f8f9fa;"><strong>Hora retorno</strong></td>
              <td style="padding:8px">${escapeHtml(p.horaRetorno || 'Sin retorno')}</td>
              <td style="width:20%; padding:8px; background:#f8f9fa;"><strong>Fecha de registro</strong></td>
              <td style="padding:8px">${escapeHtml(p.fechaCreacion || '')}</td>
            </tr>
          </table>
        </section>

        <div style="text-align:right; font-size:11px; color:#666; margin-top:10px;">Resultados: 1</div>
      </div>
    `;

    // sobre-escribir el html con el detalle
    const htmlDetalle = detalleHtml;
    const containerDetalle = document.createElement('div');
    containerDetalle.style.width = '100%';
    containerDetalle.innerHTML = htmlDetalle;
    document.body.appendChild(containerDetalle);

    const filenameDetalle = opts.filename || `papeleta-${(p.codigo || p.dni || 'detalle')}.pdf`;
    const optDetalle = Object.assign({
      margin:       10,
      filename:     filenameDetalle,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
    }, opts.html2pdfOptions || {});

    try {
      await html2pdf().set(optDetalle).from(containerDetalle).save();
    } finally {
      if (containerDetalle && containerDetalle.parentNode) containerDetalle.parentNode.removeChild(containerDetalle);
    }

    return;
  }

    const html = `
    <style>
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr { page-break-inside: avoid; break-inside: avoid; }
      td, th { page-break-inside: avoid; -webkit-column-break-inside: avoid; }
      @media print {
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: avoid; break-inside: avoid; }
      }
    </style>
    <div style="font-family: Arial, Helvetica, sans-serif; color: #222; padding: 14px; background:#fff;">
      <header style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
        <img src="${escapeHtml(logoUrl)}" alt="Logo" style="width:84px; height:auto; object-fit:contain;" crossorigin="anonymous" />
        <div style="flex:1">
          <h1 style="font-size:18px; margin:0 0 4px 0; color:#0d6efd">${escapeHtml(title)}</h1>
          <div style="font-size:12px; color:#555">Municipalidad Provincial de San Miguel</div>
        </div>
        <div style="text-align:right; font-size:11px; color:#666">Generado: ${escapeHtml(fechaGeneracion)}<br/>Resultados: ${papeletasFiltradas.length}</div>
      </header>
      <div style="font-size:12px; color:#666; margin-bottom:10px">Filtros: ${escapeHtml(filtrosHtml)}</div>
      <table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:12px;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Cod-papeleta</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Trabajador</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">DNI</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Área</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Fecha</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Motivo</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Régimen</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Entidad visitada</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f8f9fa; color:#333; text-align:left">Horario</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="9" style="text-align:center; padding:8px;">No hay registros</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  // Generar PDF y disparar diálogo "Guardar como"
  const container = document.createElement('div');
  container.style.width = '100%';
  container.innerHTML = html;
  document.body.appendChild(container);

  const filename = opts.filename || `reporte-papeletas-${new Date().toISOString().slice(0,10)}.pdf`;
  const opt = Object.assign({
    margin:       10,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'landscape' }
  }, opts.html2pdfOptions || {});

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    // limpiar el contenedor siempre
    if (container && container.parentNode) container.parentNode.removeChild(container);
  }
}
