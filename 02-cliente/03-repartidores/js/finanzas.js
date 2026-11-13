/**
 * ============================================================================
 * FINANZAS - Lógica de la pantalla de caja
 * ============================================================================
 */

window.cajaActual = null;
window.periodoCaja = "hoy";

async function cargarCaja() {
  if (!window.sesionActual) return;
  const cajaContenido = document.getElementById("caja-contenido");
  cajaContenido.innerHTML = `<p class="cargando">Cargando finanzas...</p>`;

  try {
    const r = await API.caja(window.sesionActual.correo);
    if (!r.ok) { cajaContenido.innerHTML = `<p class="vacio">Error: ${r.error}</p>`; return; }
    window.cajaActual = r; renderizarCaja();
  } catch (error) { cajaContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`; }
}

function renderizarCaja() {
  const cajaContenido = document.getElementById("caja-contenido");
  if (!window.cajaActual) return;
  const periodo = window.cajaActual[window.periodoCaja];
  if (!periodo) { cajaContenido.innerHTML = `<p class="vacio">Sin datos.</p>`; return; }

  const ing = periodo.ingresos, com = periodo.compras, bal = periodo.balance;
  const claseBalance = bal >= 0 ? "positivo" : "negativo";
  const simboloBalance = bal >= 0 ? "+" : "";

  let comprasDetalleHTML = "";
  if (com.cajasBlancas > 0 || com.cajasRojas > 0) {
    comprasDetalleHTML = `<div class="caja-desglose">${com.cajasBlancas > 0 ? `<div class="caja-desglose-fila"><span class="label">⚪ Cajas blancas</span><span class="valor">${com.cajasBlancas}</span></div>` : ""}${com.cajasRojas > 0 ? `<div class="caja-desglose-fila"><span class="label">🔴 Cajas rojas</span><span class="valor">${com.cajasRojas}</span></div>` : ""}</div>`;
  }

  cajaContenido.innerHTML = `
    <div class="caja-card"><p class="caja-card-titulo">Ingresos</p><p class="caja-card-valor">${formatearMoneda(ing.total)}</p><p class="caja-card-sub">${ing.entregas} entrega(s) · ${ing.carteras} cartera(s)</p><div class="caja-desglose"><div class="caja-desglose-fila"><span class="label">${ICONOS.efectivo} Efectivo</span><span class="valor">${formatearMoneda(ing.efectivo)}</span></div><div class="caja-desglose-fila"><span class="label">${ICONOS.transferencia} Transferencia</span><span class="valor">${formatearMoneda(ing.transferencia)}</span></div></div></div>
    <div class="caja-card"><p class="caja-card-titulo">Compras a HuevoBueno</p><p class="caja-card-valor">${formatearMoneda(com.total)}</p><p class="caja-card-sub">${com.cajasBlancas + com.cajasRojas} caja(s) en total</p>${comprasDetalleHTML}</div>
    <div class="caja-card caja-card-balance ${claseBalance}"><p class="caja-card-titulo">Balance del período</p><p class="caja-card-valor">${simboloBalance}${formatearMoneda(bal)}</p><p class="caja-card-sub">Ingresos − Compras</p></div>
  `;
}

function cambiarPeriodoCaja(periodo) {
  window.periodoCaja = periodo;
  document.getElementById("chips-caja").querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c.dataset.periodo === periodo));
  renderizarCaja();
}

if (document.getElementById("chips-caja")) {
  document.getElementById("chips-caja").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (chip) cambiarPeriodoCaja(chip.dataset.periodo);
  });
}