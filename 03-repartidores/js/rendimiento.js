/**
 * ============================================================================
 * RENDIMIENTO - Lógica de la pantalla de rendimiento
 * ============================================================================
 */

window.rendimientoActual = null;
window.periodoRendimiento = "mes";

async function cargarRendimiento() {
  if (!window.sesionActual) return;
  const contenedor = document.getElementById("rendimiento-contenido");
  contenedor.innerHTML = `<p class="cargando">Cargando rendimiento...</p>`;

  try {
    const r = await API.rendimiento(window.sesionActual.correo, window.periodoRendimiento);
    if (!r.ok) { contenedor.innerHTML = `<p class="vacio">Error: ${r.error}</p>`; return; }
    window.rendimientoActual = r; renderizarRendimiento();
  } catch (error) { contenedor.innerHTML = `<p class="vacio">Error de conexión.</p>`; }
}

function renderizarRendimiento() {
  const contenedor = document.getElementById("rendimiento-contenido");
  if (!window.rendimientoActual) return;
  const cp = window.rendimientoActual.cardPrincipal;
  const th = window.rendimientoActual.tipoHuevo;
  const top = window.rendimientoActual.topColonias || [];
  const cm = window.rendimientoActual.coloniasMuertas || { total: 0, ejemplos: [] };
  const md = window.rendimientoActual.mejorDia || { dia: null, promedio: 0 };
  const sem = window.rendimientoActual.semanas || [];

  let cambioHTML = "";
  if (cp.cambioPorcentaje !== null && cp.cambioPorcentaje !== undefined) {
    const clase = cp.cambioPorcentaje > 0 ? "up" : (cp.cambioPorcentaje < 0 ? "down" : "flat");
    const flecha = cp.cambioPorcentaje > 0 ? "↑" : (cp.cambioPorcentaje < 0 ? "↓" : "=");
    cambioHTML = `<span class="rend-cambio ${clase}">${flecha} ${cp.cambioPorcentaje > 0 ? "+" : ""}${cp.cambioPorcentaje}% vs período anterior</span>`;
  } else if (cp.totalAnterior === 0 && cp.totalCobrado > 0) {
    cambioHTML = `<span class="rend-cambio up">Nuevo período con ventas</span>`;
  } else if (cp.totalCobrado === 0) {
    cambioHTML = `<span class="rend-cambio flat">Sin ventas en este período</span>`;
  }

  const totalTH = th.blanco.ingresos + th.rojo.ingresos;
  const pctBlanco = totalTH > 0 ? Math.round((th.blanco.ingresos / totalTH) * 100) : 0;
  const pctRojo = totalTH > 0 ? Math.round((th.rojo.ingresos / totalTH) * 100) : 0;

  let tipoHuevoHTML = totalTH === 0 ? `<p class="rend-vacio">Aún no hay ventas.</p>` : `
    <div class="rend-barra-h"><div class="rend-barra-h-header"><span class="rend-barra-h-label">⚪ Blanco</span><span class="rend-barra-h-valor">${formatearMoneda(th.blanco.ingresos)}</span></div><div class="rend-barra-h-track"><div class="rend-barra-h-fill blanco" style="width: ${pctBlanco}%"></div></div><div class="rend-barra-h-sub">${th.blanco.carteras} cartera(s) · ${pctBlanco}%</div></div>
    <div class="rend-barra-h"><div class="rend-barra-h-header"><span class="rend-barra-h-label">🔴 Rojo</span><span class="rend-barra-h-valor">${formatearMoneda(th.rojo.ingresos)}</span></div><div class="rend-barra-h-track"><div class="rend-barra-h-fill rojo" style="width: ${pctRojo}%"></div></div><div class="rend-barra-h-sub">${th.rojo.carteras} cartera(s) · ${pctRojo}%</div></div>
  `;

  let topColoniasHTML = top.length === 0 ? `<p class="rend-vacio">Sin ventas registradas.</p>` : top.map((c, i) => {
    const pct = top[0].ingresos > 0 ? Math.round((c.ingresos / top[0].ingresos) * 100) : 0;
    return `<div class="rend-barra-h"><div class="rend-barra-h-header"><span class="rend-barra-h-label">${i + 1}. ${c.colonia}</span><span class="rend-barra-h-valor">${formatearMoneda(c.ingresos)}</span></div><div class="rend-barra-h-track"><div class="rend-barra-h-fill" style="width: ${pct}%"></div></div><div class="rend-barra-h-sub">${c.carteras} cartera(s)</div></div>`;
  }).join("");

  let coloniasMuertasHTML = cm.total === 0 ? `<p class="rend-vacio">Todas tus colonias tuvieron ventas.</p>` : `
    <div class="rend-muertas">${cm.ejemplos.map(e => `<div class="rend-muerta-item"><div><div class="rend-muerta-nombre">${e.colonia}</div><div class="rend-muerta-motivo">${e.motivo}</div></div><div style="font-size:11.5px;font-weight:700;color:#856404;">${formatearMoneda(e.ingresos)}</div></div>`).join("")}</div>
    ${cm.total > cm.ejemplos.length ? `<p class="rend-muerta-mas">+ ${cm.total - cm.ejemplos.length} colonia(s) más sin ventas</p>` : ""}
  `;

  let mejorDiaHTML = !md.dia ? `<p class="rend-vacio">Aún no hay suficientes datos.</p>` : `<div class="rend-mejor-dia"><div class="rend-mejor-dia-trofeo">🏆</div><div class="rend-mejor-dia-textos"><div class="rend-mejor-dia-dia">Los ${md.dia.toLowerCase()} vendes más</div><div class="rend-mejor-dia-prom">Promedio: <strong>${formatearMoneda(md.promedio)}</strong></div></div></div>`;

  let semanasHTML = !sem.length || sem.every(s => s.total === 0) ? `<p class="rend-vacio">Aún no hay datos.</p>` : `<div class="rend-barras-v">${sem.map(s => { const alturaPct = Math.round((s.total / Math.max(...sem.map(x => x.total), 1)) * 100); return `<div class="rend-barra-v"><span class="rend-barra-v-valor">$${s.total}</span><div class="rend-barra-v-columna" style="height: ${alturaPct}%"></div><span class="rend-barra-v-label">${s.etiqueta}</span></div>`; }).join("")}</div>`;

  contenedor.innerHTML = `
    <div class="rend-card-principal"><p class="titulo">Total cobrado</p><p class="valor">${formatearMoneda(cp.totalCobrado)}</p>${cambioHTML}<p class="sub">${cp.totalEntregas} entrega(s) · ${cp.totalCarteras} cartera(s) · Promedio ${formatearMoneda(cp.promedioEntrega)}</p></div>
    <div class="rend-card"><p class="rend-card-titulo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg> Tipo de huevo</p>${tipoHuevoHTML}</div>
    <div class="rend-card"><p class="rend-card-titulo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tus mejores colonias</p>${topColoniasHTML}</div>
    <div class="rend-card"><p class="rend-card-titulo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Colonias con ventas bajas</p>${coloniasMuertasHTML}</div>
    <div class="rend-card"><p class="rend-card-titulo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Mejor día de la semana</p>${mejorDiaHTML}</div>
    <div class="rend-card"><p class="rend-card-titulo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Últimas 4 semanas</p>${semanasHTML}</div>
  `;
}

function cambiarPeriodoRendimiento(periodo) {
  window.periodoRendimiento = periodo;
  document.getElementById("chips-rendimiento").querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c.dataset.periodo === periodo));
  cargarRendimiento();
}

if (document.getElementById("chips-rendimiento")) {
  document.getElementById("chips-rendimiento").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (chip) cambiarPeriodoRendimiento(chip.dataset.periodo);
  });
}