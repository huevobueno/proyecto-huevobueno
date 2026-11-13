/**
 * ============================================================================
 * HISTORIAL - Lógica de la pantalla de historial
 * ============================================================================
 */

window.historialActual = null;
window.periodoHistorial = "semana";
window.filtroBusquedaHist = "";

async function cargarHistorial() {
  if (!window.sesionActual) return;
  const contenedor = document.getElementById("historial-contenido");
  contenedor.innerHTML = `<p class="cargando">Cargando historial...</p>`;

  try {
    const r = await API.historial(window.sesionActual.correo, window.periodoHistorial);
    if (!r.ok) { contenedor.innerHTML = `<p class="vacio">Error: ${r.error}</p>`; return; }
    window.historialActual = r; renderizarHistorial();
  } catch (error) { contenedor.innerHTML = `<p class="vacio">Error de conexión.</p>`; }
}

function renderizarHistorial() {
  const contenedor = document.getElementById("historial-contenido");
  if (!window.historialActual) return;
  const resumen = window.historialActual.resumen || { totalPedidos: 0, totalCobrado: 0, totalCarteras: 0 };
  const grupos = window.historialActual.grupos || [];
  const filtro = window.filtroBusquedaHist.toLowerCase().trim();

  let html = `<div class="historial-resumen"><div class="historial-resumen-icono">${ICONOS.paquete}</div><div class="historial-resumen-textos"><p class="historial-resumen-titulo">${resumen.totalPedidos} pedido(s) · ${formatearMoneda(resumen.totalCobrado)}</p><p class="historial-resumen-sub">${resumen.totalCarteras} cartera(s) entregada(s)</p></div></div>`;

  if (!grupos.length) { contenedor.innerHTML = html + `<p class="vacio">No hay pedidos en este período.</p>`; return; }

  const gruposFiltrados = grupos.map(g => {
    const pedidos = !filtro ? g.pedidos : g.pedidos.filter(p => (p.id || "").toLowerCase().includes(filtro) || (p.nombre || "").toLowerCase().includes(filtro) || (p.colonia || "").toLowerCase().includes(filtro));
    return { ...g, pedidos: pedidos };
  }).filter(g => g.pedidos.length > 0);

  if (!gruposFiltrados.length) { contenedor.innerHTML = html + `<p class="vacio">No se encontraron coincidencias.</p>`; return; }

  gruposFiltrados.forEach(g => {
    html += `<div class="historial-grupo"><div class="historial-grupo-header"><span class="historial-grupo-fecha">${g.etiqueta}</span><span class="historial-grupo-total">${g.totalEntregas} pedido(s) · ${formatearMoneda(g.totalCobrado)}</span></div>${g.pedidos.map(p => {
      const metodoClase = p.metodoPago === "EFECTIVO" ? "efectivo" : (p.metodoPago === "TRANSFERENCIA" ? "transferencia" : "");
      return `<div class="historial-card"><div class="historial-card-icono">${ICONOS.huevera}</div><div class="historial-card-info"><div class="historial-card-id">${p.id}</div><div class="historial-card-nombre">${p.nombre}</div><div class="historial-card-detalle">${p.cantidad} ${p.tipoHuevo} · ${p.colonia}</div></div><div class="historial-card-derecha"><span class="historial-card-total">${formatearMoneda(p.precioTotal)}</span>${p.metodoPago ? `<span class="historial-card-metodo ${metodoClase}">${p.metodoPago}</span>` : ""}</div></div>`;
    }).join("")}</div>`;
  });
  contenedor.innerHTML = html;
}

function cambiarPeriodoHistorial(periodo) {
  window.periodoHistorial = periodo;
  document.getElementById("chips-historial").querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c.dataset.periodo === periodo));
  cargarHistorial();
}

if (document.getElementById("chips-historial")) {
  document.getElementById("chips-historial").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (chip) cambiarPeriodoHistorial(chip.dataset.periodo);
  });
}
if (document.getElementById("input-busqueda-historial")) {
  document.getElementById("input-busqueda-historial").addEventListener("input", (e) => { window.filtroBusquedaHist = e.target.value; renderizarHistorial(); });
}