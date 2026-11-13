/**
 * ============================================================================
 * COMPRAS - Lógica de Mis Compras y Nota de Remisión
 * ============================================================================
 */

window.comprasActuales = null;
window.filtroMisCompras = "todas";
window.compraModalActual = null;

async function cargarMisCompras() {
  if (!window.sesionActual) return;
  document.getElementById("mis-compras-resumen").innerHTML = `<p class="cargando">Cargando...</p>`;
  document.getElementById("mis-compras-lista").innerHTML = `<p class="cargando">Cargando compras...</p>`;

  try {
    const r = await API.misCompras(window.sesionActual.correo);
    if (!r.ok) { document.getElementById("mis-compras-resumen").innerHTML = `<p class="vacio">Error: ${r.error}</p>`; return; }
    window.comprasActuales = r; renderizarMisCompras();
  } catch (error) { document.getElementById("mis-compras-resumen").innerHTML = `<p class="vacio">Error de conexión.</p>`; }
}

function renderizarMisCompras() {
  if (!window.comprasActuales) return;
  const resumen = window.comprasActuales.resumen || {};
  const compras = window.comprasActuales.compras || [];
  const totales = { todas: compras.length, pagadas: compras.filter(c => c.estado === "pagada").length, con_saldo: compras.filter(c => c.estado === "con_saldo").length };

  document.getElementById("chips-mis-compras").querySelectorAll(".chip").forEach(chip => {
    let numSpan = chip.querySelector(".chip-num") || document.createElement("span"); numSpan.className = "chip-num"; chip.appendChild(numSpan);
    numSpan.textContent = totales[chip.dataset.filtro] || 0;
    chip.classList.toggle("activo", chip.dataset.filtro === window.filtroMisCompras);
  });

  const saldo = resumen.saldoPendiente || 0;
  const claseSaldo = saldo > 0 ? "caja-card-balance negativo" : "caja-card-balance positivo";

  document.getElementById("mis-compras-resumen").innerHTML = `
    <div class="caja-card"><p class="caja-card-titulo">Total comprado</p><p class="caja-card-valor">${formatearMoneda(resumen.totalComprado || 0)}</p><p class="caja-card-sub">${resumen.numCompras || 0} compra(s)</p></div>
    <div class="caja-card ${claseSaldo}"><p class="caja-card-titulo">Saldo pendiente</p><p class="caja-card-valor">${formatearMoneda(saldo)}</p><p class="caja-card-sub">${saldo > 0 ? "Tienes compras por pagar" : "Estás al día"}</p></div>
  `;

  const filtradas = compras.filter(c => window.filtroMisCompras === "todas" ? true : (window.filtroMisCompras === "pagadas" ? c.estado === "pagada" : c.estado === "con_saldo"));

  if (!filtradas.length) { document.getElementById("mis-compras-lista").innerHTML = `<p class="vacio">No hay compras.</p>`; return; }

  document.getElementById("mis-compras-lista").innerHTML = filtradas.map((c, idx) => {
    const cajasTxt = []; if (c.cajasBlancas > 0) cajasTxt.push(`${c.cajasBlancas} blanca(s)`); if (c.cajasRojas > 0) cajasTxt.push(`${c.cajasRojas} roja(s)`);
    const estadoClase = c.estado === "pagada" ? "compra-pagada" : "compra-saldo";
    const estadoTxt = c.estado === "pagada" ? "Pagada" : `Debes ${formatearMoneda(c.saldo)}`;
    return `<div class="compra-card-compra" data-idx="${idx}"><div class="compra-card-compra-info"><div class="compra-card-compra-fecha">${formatearFechaLarga(c.fecha)}</div><div class="compra-card-compra-detalle">${cajasTxt.join(" · ")}</div>${c.notas ? `<div class="compra-card-compra-notas">"${c.notas}"</div>` : ""}</div><div class="compra-card-compra-montos"><div class="compra-card-compra-total">${formatearMoneda(c.total)}</div><div class="compra-card-compra-estado ${estadoClase}">${estadoTxt}</div></div></div>`;
  }).join("");

  document.getElementById("mis-compras-lista").querySelectorAll(".compra-card-compra").forEach(card => {
    card.addEventListener("click", () => abrirModalCompra(filtradas[Number(card.dataset.idx)]));
  });
}

function abrirModalCompra(compra) {
  if (!compra) return;
  const modalCompra = document.getElementById("modal-compra"); const modalCompraCuerpo = document.getElementById("modal-compra-cuerpo");
  const cajasBlancas = compra.cajasBlancas > 0 ? `<div class="modal-fila"><span class="label">Cajas blancas</span><span class="valor">${compra.cajasBlancas} × ${formatearMoneda(compra.precioBlanco)}</span></div>` : "";
  const cajasRojas = compra.cajasRojas > 0 ? `<div class="modal-fila"><span class="label">Cajas rojas</span><span class="valor">${compra.cajasRojas} × ${formatearMoneda(compra.precioRojo)}</span></div>` : "";
  const saldoHTML = compra.saldo > 0 ? `<div class="modal-fila"><span class="label"><strong>Saldo pendiente</strong></span><span class="valor" style="color:#856404;"><strong>${formatearMoneda(compra.saldo)}</strong></span></div>` : `<div class="modal-fila"><span class="label">Saldo pendiente</span><span class="valor" style="color:#155724;">Pagada ✓</span></div>`;
  const botonNota = compra.folio && compra.saldo <= 0 ? `<button class="btn-ver-nota-grande" id="btn-ver-nota-modal">📄 Ver nota de remisión</button>` : "";

  modalCompraCuerpo.innerHTML = `<h2 class="modal-titulo">Compra</h2><p class="modal-sub">${formatearFechaLarga(compra.fecha)}${compra.folio ? " · " + compra.folio : ""}</p><div class="modal-seccion"><div class="modal-fila"><span class="label">Fecha</span><span class="valor">${formatearFecha(compra.fecha)}</span></div></div><div class="modal-seccion">${cajasBlancas}${cajasRojas}</div><div class="modal-seccion"><div class="modal-fila"><span class="label"><strong>Total</strong></span><span class="valor"><strong>${formatearMoneda(compra.total)}</strong></span></div><div class="modal-fila"><span class="label">Pagado</span><span class="valor">${formatearMoneda(compra.montoPagado)}</span></div>${saldoHTML}</div>${compra.notas ? `<div class="modal-seccion"><div class="modal-fila"><span class="label">Notas</span><span class="valor">${compra.notas}</span></div></div>` : ""}${botonNota}`;
  modalCompra.classList.remove("hidden");
  const btnNotaModal = document.getElementById("btn-ver-nota-modal");
  if (btnNotaModal) btnNotaModal.addEventListener("click", () => { cerrarModalCompra(); verNotaRemision(compra.folio); });
}

function cerrarModalCompra() { document.getElementById("modal-compra").classList.add("hidden"); window.compraModalActual = null; }

async function verNotaRemision(folio) {
  if (!folio) { alert("Compra sin folio."); return; }
  const modalNota = document.getElementById("modal-nota"); const modalNotaCuerpo = document.getElementById("modal-nota-cuerpo");
  modalNota.classList.remove("hidden"); modalNotaCuerpo.innerHTML = `<p class="cargando">Cargando nota...</p>`;
  try {
    const r = await API.obtenerNotaRemision(folio);
    if (!r.ok) { modalNotaCuerpo.innerHTML = `<p class="vacio">${r.error}</p>`; return; }
    modalNotaCuerpo.innerHTML = renderizarNota(r.nota);
  } catch (err) { modalNotaCuerpo.innerHTML = `<p class="vacio">Error de conexión.</p>`; }
}

function renderizarNota(nota) {
  const e = nota.emisor || {}, rec = nota.receptor || {}, conceptos = nota.conceptos || [];
  const conceptosRows = conceptos.map(c => `<tr><td>${escaparHTML(c.descripcion)}</td><td class="nota-col-num">${c.cantidad}</td><td class="nota-col-num">${formatearMoneda(c.precioUnitario)}</td><td class="nota-col-num">${formatearMoneda(c.importe)}</td></tr>`).join("");
  return `<div class="nota-hoja"><div class="nota-header"><div class="nota-emisor"><div class="nota-emisor-nombre">${escaparHTML(e.nombre)}</div><div class="nota-emisor-slogan">${escaparHTML(e.slogan)}</div><div class="nota-emisor-datos">${escaparHTML(e.direccion)}<br>Tel: ${escaparHTML(e.telefono)}<br>${escaparHTML(e.correo)}</div></div><div class="nota-titulo-bloque"><div class="nota-tipo">NOTA DE REMISIÓN</div><div class="nota-folio">${escaparHTML(nota.folio)}</div><div class="nota-fecha">Fecha: ${formatearFechaLarga(nota.fecha)}</div></div></div><div class="nota-seccion"><div class="nota-seccion-titulo">RECEPTOR</div><div class="nota-receptor"><div><span class="nota-label">Nombre:</span> ${escaparHTML(rec.nombre)}</div><div><span class="nota-label">Domicilio:</span> ${escaparHTML(rec.domicilio)}</div><div><span class="nota-label">Teléfono:</span> ${escaparHTML(rec.telefono)}</div></div></div><div class="nota-seccion"><table class="nota-tabla"><thead><tr><th>Descripción</th><th class="nota-col-num">Cant.</th><th class="nota-col-num">P. Unit.</th><th class="nota-col-num">Importe</th></tr></thead><tbody>${conceptosRows}</tbody></table></div><div class="nota-totales"><div class="nota-total-linea"><span class="nota-total-label">TOTAL:</span><span class="nota-total-valor">${formatearMoneda(nota.total)}</span></div><div class="nota-total-letra"><strong>Total con letra:</strong> ${escaparHTML(nota.totalLetra)}</div></div><div class="nota-pie"><div class="nota-pie-fila"><span><strong>Forma de pago:</strong> ${escaparHTML(nota.formaPago)}</span><span><strong>Estado:</strong> ${escaparHTML(nota.estado)}</span></div>${nota.notas ? `<div class="nota-pie-notas"><strong>Notas:</strong> ${escaparHTML(nota.notas)}</div>` : ""}</div><div class="nota-firma"><div class="nota-firma-linea"></div><div class="nota-firma-texto">${escaparHTML(e.nombre)}</div><div class="nota-firma-sub">Emisor</div></div></div>`;
}

function cerrarModalNota() { document.getElementById("modal-nota").classList.add("hidden"); document.getElementById("modal-nota-cuerpo").innerHTML = ""; }

if (document.getElementById("chips-mis-compras")) {
  document.getElementById("chips-mis-compras").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (chip) { window.filtroMisCompras = chip.dataset.filtro; renderizarMisCompras(); }
  });
}
if (document.getElementById("btn-cerrar-modal-compra")) document.getElementById("btn-cerrar-modal-compra").addEventListener("click", cerrarModalCompra);
if (document.getElementById("modal-compra")) document.getElementById("modal-compra").addEventListener("click", (e) => { if (e.target === document.getElementById("modal-compra")) cerrarModalCompra(); });
if (document.getElementById("btn-cerrar-modal-nota")) document.getElementById("btn-cerrar-modal-nota").addEventListener("click", cerrarModalNota);
if (document.getElementById("btn-imprimir-nota")) document.getElementById("btn-imprimir-nota").addEventListener("click", () => window.print());
if (document.getElementById("modal-nota")) document.getElementById("modal-nota").addEventListener("click", (e) => { if (e.target === document.getElementById("modal-nota")) cerrarModalNota(); });