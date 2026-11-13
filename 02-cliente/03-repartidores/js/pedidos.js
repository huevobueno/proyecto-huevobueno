/**
 * ============================================================================
 * PEDIDOS - Lógica de la pantalla principal y el modal de entrega
 * FECHA: 12/11/2026
 * ============================================================================
 */

window.pedidosActuales = [];
window.filtroBusqueda = "";
window.filtroEstado = "PENDIENTE";
window.pedidoModalActual = null;
window.pasoModal = "inicial";

const listaPedidos = document.getElementById("lista-pedidos");
const chipsFiltro = document.getElementById("chips-filtro");
const modalDetalle = document.getElementById("modal-detalle");
const modalCuerpo = document.getElementById("modal-cuerpo");

function crearTarjetaPedido(p) {
  const estado = infoEstado(p.estadoEntrega);
  const direccionCompleta = `${p.direccion}, ${p.colonia}, ${p.ciudad || "—"}`;
  
  // Formateamos la fecha y hora
  const fechaPedido = p.fecha ? `${formatearFecha(p.fecha)} (${formatearHora(p.fecha)})` : "Fecha desconocida";
  
  let badgePago = "";
  if (p.metodoPago === 'SALDO' || p.origen === 'PAGADO_CON_SALDO_PWA') {
      badgePago = `<span style="background:#E8F5E9; color:#1B5E20; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; display:inline-block; margin-top:4px;">PAGADO ✓</span>`;
  } else {
      badgePago = `<span style="background:#FFF3CD; color:#856404; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; display:inline-block; margin-top:4px;">COBRAR $${p.precioTotal}</span>`;
  }

  return `
    <article class="pedido-card" data-id="${p.id}">
      <div class="pedido-contenido">
        <div class="pedido-imagen">${ICONOS.huevera}</div>
        <div class="pedido-detalles">
          
          <div class="pedido-numero" style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <span>${p.id}</span>
            <span style="font-size:10px; color:#6B7280; font-weight:700; text-align:right; line-height:1.2;">📅 ${fechaPedido}</span>
          </div>
          
          <div class="pedido-cliente">${ICONOS.usuario}<span>${p.nombre}</span></div>
          
          <div class="pedido-direccion">${ICONOS.ubicacion}<span>${direccionCompleta}</span></div>
          
          ${badgePago}
        </div>
        <div class="pedido-derecha">
          <span class="etiqueta ${estado.clase}">${estado.icono}${estado.texto}</span>
        </div>
      </div>
      <div class="pedido-botones">
        <button class="btn-secundario" data-accion="detalle" data-id="${p.id}">
          ${ICONOS.ojo} Ver detalle
        </button>
        <button class="btn-accion" data-accion="ubicacion" data-id="${p.id}">
          ${ICONOS.mapa} Ubicación
        </button>
      </div>
    </article>
  `;
}

function renderizarLista() {
  const filtro = window.filtroBusqueda.toLowerCase().trim();
  let porEstado = window.pedidosActuales;

  if (window.filtroEstado === "PENDIENTE") {
    porEstado = window.pedidosActuales.filter(p => p.estadoEntrega === "PENDIENTE" || p.estadoEntrega === "NO_ENCONTRADO");
  } else {
    porEstado = window.pedidosActuales.filter(p => p.estadoEntrega === window.filtroEstado);
  }

  const filtrados = !filtro ? porEstado : porEstado.filter(p =>
    (p.id || "").toLowerCase().includes(filtro) || (p.nombre || "").toLowerCase().includes(filtro) ||
    (p.direccion || "").toLowerCase().includes(filtro) || (p.colonia || "").toLowerCase().includes(filtro) ||
    (p.ciudad || "").toLowerCase().includes(filtro)
  );

  if (!filtrados.length) {
    const msj = { "PENDIENTE": "No tienes pedidos por entregar.", "ENTREGADO": "Aún no has entregado pedidos.", "CANCELADO": "No hay pedidos cancelados.", "NO_ENCONTRADO": "No hay pedidos no encontrados." };
    listaPedidos.innerHTML = `<p class="vacio">${msj[window.filtroEstado] || "Sin pedidos."}</p>`;
    return;
  }
  listaPedidos.innerHTML = filtrados.map(crearTarjetaPedido).join("");
}

function renderizarResumen(resumen) {
  document.getElementById("resumen-titulo").textContent = `Hoy tienes ${resumen.total} pedidos en ruta`;
  const porEntregar = (resumen.pendientes || 0) + (resumen.noEncontrados || 0);
  document.getElementById("resumen-sub").textContent = `${porEntregar} por entregar · ${resumen.entregados || 0} entregados`;
}

function renderizarChips(resumen) {
  const nums = { "PENDIENTE": (resumen.pendientes || 0) + (resumen.noEncontrados || 0), "ENTREGADO": resumen.entregados || 0, "CANCELADO": resumen.cancelados || 0, "NO_ENCONTRADO": resumen.noEncontrados || 0 };
  Object.keys(nums).forEach(k => { const el = document.querySelector(`[data-num="${k}"]`); if (el) el.textContent = nums[k]; });
  chipsFiltro.querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c.dataset.filtro === window.filtroEstado));
}

function calcularResumenLocal() {
  return {
    total: window.pedidosActuales.length,
    pendientes: window.pedidosActuales.filter(p => p.estadoEntrega === "PENDIENTE").length,
    entregados: window.pedidosActuales.filter(p => p.estadoEntrega === "ENTREGADO").length,
    cancelados: window.pedidosActuales.filter(p => p.estadoEntrega === "CANCELADO").length,
    noEncontrados: window.pedidosActuales.filter(p => p.estadoEntrega === "NO_ENCONTRADO").length
  };
}

async function cargarPedidos() {
  if (!window.sesionActual || !window.sesionActual.repartidor) return;
  listaPedidos.innerHTML = `<p class="cargando">Cargando pedidos...</p>`;
  try {
    const resultado = await API.pedidos(window.sesionActual.repartidor);
    if (!resultado.ok) { listaPedidos.innerHTML = `<p class="vacio">Error: ${resultado.error}</p>`; return; }
    window.pedidosActuales = resultado.pedidos || [];
    const resumen = resultado.resumen || { total: 0, pendientes: 0, entregados: 0, cancelados: 0, noEncontrados: 0 };
    renderizarResumen(resumen); renderizarChips(resumen); renderizarLista(); procesarPedidoDeURL();
  } catch (error) { listaPedidos.innerHTML = `<p class="vacio">Error de conexión.</p>`; }
}

// --- MODAL Y ACCIONES ---
function htmlPasoInicial() { return `<div class="modal-acciones"><button class="btn-estado btn-estado-entregado" data-estado="ENTREGADO">${ICONOS.check} Entregado</button><button class="btn-estado btn-estado-cancelado" data-estado="CANCELADO">${ICONOS.x} Cancelado</button></div><div class="modal-acciones-2"><button class="btn-estado btn-estado-contactar" data-contactar="1">${ICONOS.whatsapp} Contactar</button><button class="btn-estado btn-estado-noencontrado" data-ubicacion-modal="1">${ICONOS.mapa} Ver mapa</button></div>`; }
function htmlPasoPago() { return `<div class="modal-seccion" style="text-align:center;"><p>¿Cómo pagó el cliente?</p><div class="modal-acciones-2"><button class="btn-estado btn-estado-entregado" data-pago="EFECTIVO">${ICONOS.efectivo} Efectivo</button><button class="btn-estado btn-estado-entregado" data-pago="TRANSFERENCIA">${ICONOS.transferencia} Transferencia</button></div></div>`; }
function htmlPasoTicket() { return `<div class="modal-seccion" style="text-align:center;"><p>Envía el comprobante al cliente por WhatsApp.</p><div class="modal-acciones"><button class="btn-estado btn-estado-entregado" data-ticket="enviar">${ICONOS.enviar} Enviar ticket</button></div></div>`; }
function htmlPasoFinal(p) { return `<div class="modal-seccion" style="text-align:center;padding:20px 0;"><div style="font-size:42px;">🎉</div><p style="font-size:15px;font-weight:700;">¡Pedido completado!</p></div>`; }

function obtenerHtmlAcciones(p) {
  if (p.estadoEntrega === "ENTREGADO") {
    if (window.pasoModal === "pago" || !p.metodoPago) { window.pasoModal = "pago"; return htmlPasoPago(); }
    
    if (p.ticketCompra === "ENVIADO" || p.ticketCompra === "ENVIAR") {
      window.pasoModal = "final";
      return htmlPasoFinal(p);
    }
    
    if (window.pasoModal === "ticket") { window.pasoModal = "ticket"; return htmlPasoTicket(); }
    window.pasoModal = "ticket"; return htmlPasoTicket();
  }
  if (p.estadoEntrega === "PENDIENTE" || p.estadoEntrega === "NO_ENCONTRADO") { window.pasoModal = "inicial"; return htmlPasoInicial(p); }
  return "";
}

function renderizarModal() {
  const p = window.pedidoModalActual;
  if (!p) return;
  const estado = infoEstado(p.estadoEntrega);
  
  // AQUÍ AGREGAMOS LA FECHA AL MODAL
  const fechaPedido = p.fecha ? `${formatearFecha(p.fecha)} (${formatearHora(p.fecha)})` : "Fecha desconocida";
  
  modalCuerpo.innerHTML = `
    <h2 class="modal-titulo">${p.id}</h2>
    <p class="modal-sub" style="margin-bottom:10px;">${p.nombre}</p>
    <p style="font-size:12px; color:#6B7280; font-weight:700; margin-bottom:15px;">📅 Recibido: ${fechaPedido}</p>
    
    <div class="modal-seccion"><div class="modal-fila"><span class="label">Dirección</span><span class="valor">${p.direccion || "—"}</span></div><div class="modal-fila"><span class="label">Colonia</span><span class="valor">${p.colonia || "—"}</span></div><div class="modal-fila"><span class="label">Ciudad</span><span class="valor">${p.ciudad || "—"}</span></div></div>
    <div class="modal-seccion"><div class="modal-fila"><span class="label">Producto</span><span class="valor" style="font-weight:800; color:#0E5C3F;">${p.tipoHuevo || "Huevo"}</span></div><div class="modal-fila"><span class="label">Total a cobrar</span><span class="valor">$${p.precioTotal}</span></div></div>
    <div class="modal-seccion"><div class="modal-fila"><span class="label">Estado</span><span class="valor"><span class="etiqueta ${estado.clase}">${estado.icono}${estado.texto}</span></span></div>${p.metodoPago ? `<div class="modal-fila"><span class="label">Pago</span><span class="valor">${p.metodoPago}</span></div>` : ""}</div>
    ${obtenerHtmlAcciones(p)}
  `;
}

function abrirModalDetalle(idPedido) {
  const p = window.pedidosActuales.find(x => x.id === idPedido);
  if (!p) return;
  window.pedidoModalActual = p; window.pasoModal = "inicial"; renderizarModal(); modalDetalle.classList.remove("hidden");
}

function cerrarModal() { modalDetalle.classList.add("hidden"); window.pedidoModalActual = null; window.pasoModal = "inicial"; }

async function accionarEstado(nuevoEstado) {
  const p = window.pedidoModalActual; if (!p || nuevoEstado !== "ENTREGADO") return;
  const btn = document.querySelector('button[data-estado="ENTREGADO"]');
  if (btn) { btn.disabled = true; btn.style.opacity = "0.5"; }

  try {
    const resultado = await API.actualizar(p.id, { Estado_de_entrega: "ENTREGADO" });
    if (!resultado.ok) { alert("Error al actualizar"); if(btn) btn.disabled = false; return; }
    p.estadoEntrega = "ENTREGADO"; p.fechaEntrega = new Date().toISOString(); window.pasoModal = "pago"; renderizarModal();
  } catch (error) { alert("Error de conexión."); if(btn) btn.disabled = false; }
}

async function accionarPago(metodoPago) {
  const p = window.pedidoModalActual; if (!p) return;
  const btns = document.querySelectorAll('button[data-pago]');
  btns.forEach(b => { b.disabled = true; b.style.opacity = "0.5"; });

  try {
    const resultado = await API.actualizar(p.id, { Metodo_de_pago: metodoPago });
    if (!resultado.ok) { alert("Error al guardar pago"); btns.forEach(b => b.disabled = false); return; }
    p.metodoPago = metodoPago; window.pasoModal = "ticket"; renderizarModal();
  } catch (error) { alert("Error de conexión."); btns.forEach(b => b.disabled = false); }
}

async function accionarTicket() {
  const p = window.pedidoModalActual; if (!p) return;
  
  const btn = document.querySelector('button[data-ticket="enviar"]');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.pointerEvents = "none";
    btn.innerHTML = "Enviando...";
  }

  try {
    const resultado = await API.enviarTicket(p.id);
    if (!resultado.ok) { 
      alert("No se pudo enviar ticket: " + resultado.error); 
      if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; btn.innerHTML = `${ICONOS.enviar} Enviar ticket`; }
      return; 
    }
    
    p.ticketCompra = "ENVIADO"; 
    await API.actualizar(p.id, { Ticket_de_compra: "ENVIADO" });
    
    window.pasoModal = "final"; 
    renderizarModal();
    await cargarPedidos();
    setTimeout(() => { cerrarModal(); window.filtroEstado = "ENTREGADO"; renderizarChips(calcularResumenLocal()); renderizarLista(); }, 1200);
  } catch (error) { 
    alert("Error de conexión."); 
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; btn.innerHTML = `${ICONOS.enviar} Enviar ticket`; }
  }
}

async function accionarContactar() {
  const p = window.pedidoModalActual; if (!p) return;
  
  const btn = document.querySelector('button[data-contactar="1"]');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.pointerEvents = "none";
    btn.innerHTML = "Avisando...";
  }

  try {
    const resultado = await API.contactarCliente(p.id);
    if (!resultado.ok) { 
      alert("No se pudo avisar al cliente:\n\n" + resultado.error); 
      if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; btn.innerHTML = `${ICONOS.whatsapp} Contactar`; }
      return; 
    }
    alert("✅ Se avisó al cliente que estás en su domicilio.");
    
    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; btn.innerHTML = `${ICONOS.whatsapp} Contactar`; }
    }, 3000);

  } catch (error) { 
    alert("Error de conexión."); 
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; btn.innerHTML = `${ICONOS.whatsapp} Contactar`; }
  }
}

function accionarUbicacionModal() { const p = window.pedidoModalActual; if (p) abrirUbicacion(p); }

if (chipsFiltro) chipsFiltro.addEventListener("click", (e) => { const chip = e.target.closest(".chip"); if (chip) { window.filtroEstado = chip.dataset.filtro; renderizarChips(calcularResumenLocal()); renderizarLista(); } });
if (listaPedidos) listaPedidos.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-accion]"); if (!boton) return;
  if (boton.dataset.accion === "detalle") abrirModalDetalle(boton.dataset.id);
  else if (boton.dataset.accion === "ubicacion") { const p = window.pedidosActuales.find(x => x.id === boton.dataset.id); if (p) abrirUbicacion(p); }
});
if (modalCuerpo) modalCuerpo.addEventListener("click", (e) => {
  if (e.target.closest("button[data-estado]")) { accionarEstado(e.target.closest("button[data-estado]").dataset.estado); return; }
  if (e.target.closest("button[data-pago]")) { accionarPago(e.target.closest("button[data-pago]").dataset.pago); return; }
  if (e.target.closest("button[data-ticket]")) { accionarTicket(); return; }
  if (e.target.closest("button[data-contactar]")) { accionarContactar(); return; }
  if (e.target.closest("button[data-ubicacion-modal]")) { accionarUbicacionModal(); return; }
});
if (document.getElementById("btn-cerrar-modal")) document.getElementById("btn-cerrar-modal").addEventListener("click", cerrarModal);
if (modalDetalle) modalDetalle.addEventListener("click", (e) => { if (e.target === modalDetalle) cerrarModal(); });
if (document.getElementById("input-busqueda")) document.getElementById("input-busqueda").addEventListener("input", (e) => { window.filtroBusqueda = e.target.value; renderizarLista(); });

function procesarPedidoDeURL() {
  try {
    const pedidoId = new URLSearchParams(window.location.search).get("pedido"); if (!pedidoId) return;
    const p = window.pedidosActuales.find(x => x.id === pedidoId); if (!p) return;
    abrirModalDetalle(pedidoId); window.history.replaceState({}, "", window.location.pathname);
  } catch (e) { console.error(e); }
}