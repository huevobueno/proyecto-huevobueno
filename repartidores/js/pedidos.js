/**
 * ============================================================================
 * PEDIDOS - Lógica principal del emprendedor
 * ============================================================================
 */

// --- Estado global ---
let sesionActual      = null;
let pedidosActuales   = [];
let filtroBusqueda    = "";
let filtroEstado      = "PENDIENTE";
let pedidoModalActual = null;
let pasoModal         = "inicial";
let filtroRutas       = "";
let pantallaActual    = "pedidos";
let cajaActual        = null;
let periodoCaja       = "hoy";
let historialActual   = null;
let periodoHistorial  = "semana";
let filtroBusquedaHist = "";
let rendimientoActual  = null;
let periodoRendimiento = "mes";
let comprasActuales   = null;
let filtroMisCompras  = "todas";
let compraModalActual = null;

// --- Referencias DOM: header ---
const headerTitulo    = document.getElementById("header-titulo");
const headerSubtitulo = document.getElementById("header-subtitulo");
const btnRefrescar    = document.getElementById("btn-refrescar");
const btnPerfil       = document.getElementById("btn-perfil");

// --- Referencias DOM: pantalla pedidos ---
const listaPedidos     = document.getElementById("lista-pedidos");
const inputBusqueda    = document.getElementById("input-busqueda");
const resumenTitulo    = document.getElementById("resumen-titulo");
const resumenSub       = document.getElementById("resumen-sub");
const saludoRepartidor = document.getElementById("saludo-repartidor");
const chipsFiltro      = document.getElementById("chips-filtro");

// --- Referencias DOM: pantalla rutas ---
const listaRutas         = document.getElementById("lista-rutas");
const inputBusquedaRutas = document.getElementById("input-busqueda-rutas");

// --- Referencias DOM: pantalla caja ---
const chipsCaja     = document.getElementById("chips-caja");
const cajaContenido = document.getElementById("caja-contenido");

// --- Referencias DOM: pantalla mis compras ---
const misComprasResumen = document.getElementById("mis-compras-resumen");
const misComprasLista   = document.getElementById("mis-compras-lista");
const chipsMisCompras   = document.getElementById("chips-mis-compras");

// --- Referencias DOM: pantalla historial ---
const chipsHistorial     = document.getElementById("chips-historial");
const historialContenido = document.getElementById("historial-contenido");
const inputBusquedaHist  = document.getElementById("input-busqueda-historial");

// --- Referencias DOM: pantalla rendimiento ---
const chipsRendimiento     = document.getElementById("chips-rendimiento");
const rendimientoContenido = document.getElementById("rendimiento-contenido");

// --- Referencias DOM: modal detalle pedido ---
const modalDetalle   = document.getElementById("modal-detalle");
const modalCuerpo    = document.getElementById("modal-cuerpo");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");

// --- Referencias DOM: modal detalle compra ---
const modalCompra       = document.getElementById("modal-compra");
const modalCompraCuerpo = document.getElementById("modal-compra-cuerpo");
const btnCerrarModalCompra = document.getElementById("btn-cerrar-modal-compra");

// --- Referencias DOM: modal nota de remisión ---
const modalNota        = document.getElementById("modal-nota");
const btnCerrarModalN  = document.getElementById("btn-cerrar-modal-nota");
const btnImprimirNota  = document.getElementById("btn-imprimir-nota");
const modalNotaCuerpo  = document.getElementById("modal-nota-cuerpo");

// --- Referencias DOM: drawer ---
const drawerOverlay   = document.getElementById("drawer-overlay");
const btnDrawerCerrar = document.getElementById("btn-drawer-cerrar");
const drawerAvatar    = document.getElementById("drawer-avatar");
const drawerNombre    = document.getElementById("drawer-nombre");
const drawerCorreo    = document.getElementById("drawer-correo");

// Constante
const WHATSAPP_SUPERVISOR = "523325110628";

// ============================================================================
// CONFIGURACIÓN DE PANTALLAS
// ============================================================================
const PANTALLAS = {
  pedidos: {
    titulo: "Pedidos",
    subtitulo: () => "Llevamos huevos frescos a tu comunidad"
  },
  rutas: {
    titulo: "Mis rutas",
    subtitulo: () => {
      const total = (sesionActual && sesionActual.colonias) ? sesionActual.colonias.length : 0;
      return `${total} colonia(s) activa(s)`;
    }
  },
  rendimiento: {
    titulo: "Rendimiento",
    subtitulo: () => "Tu comportamiento de ventas"
  },
  caja: {
    titulo: "Mis finanzas",
    subtitulo: () => "Tus ingresos y compras"
  },
  "mis-compras": {
    titulo: "Mis compras",
    subtitulo: () => "Tus compras a HuevoBueno"
  },
  historial: {
    titulo: "Historial de pedidos",
    subtitulo: () => "Tus pedidos entregados"
  }
};

// ============================================================================
// ICONOS SVG
// ============================================================================
const ICONOS = {
  usuario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  ubicacion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  mapa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  ojo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  reloj: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  alerta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  efectivo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>`,
  transferencia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  enviar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  caja: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  carrito: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  paquete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  huevera: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="34" width="52" height="18" rx="4" fill="#D2B48C"/>
    <ellipse cx="18" cy="30" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/>
    <ellipse cx="32" cy="28" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/>
    <ellipse cx="46" cy="30" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/>
    <ellipse cx="25" cy="40" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/>
    <ellipse cx="39" cy="40" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/>
  </svg>`
};

// ============================================================================
// HELPERS
// ============================================================================
function formatearHora(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const horas   = d.getHours();
    const minutos = d.getMinutes().toString().padStart(2, "0");
    const ampm    = horas >= 12 ? "p.m." : "a.m.";
    const hora12  = (horas % 12) || 12;
    return `${hora12}:${minutos} ${ampm}`;
  } catch (e) { return "—"; }
}

function formatearFecha(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const dia  = d.getDate().toString().padStart(2, "0");
    const mes  = (d.getMonth() + 1).toString().padStart(2, "0");
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch (e) { return "—"; }
}

function formatearFechaLarga(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  } catch (e) { return "—"; }
}

function formatearMoneda(n) {
  const num = Number(n) || 0;
  return "$" + num.toLocaleString("es-MX");
}

function escaparHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function infoEstado(estado) {
  switch (estado) {
    case "PENDIENTE":     return { texto: "Pendiente",     clase: "etiqueta-pendiente",     icono: ICONOS.reloj };
    case "ENTREGADO":     return { texto: "Entregado",     clase: "etiqueta-entregado",     icono: ICONOS.check };
    case "CANCELADO":     return { texto: "Cancelado",     clase: "etiqueta-cancelado",     icono: ICONOS.x };
    case "NO_ENCONTRADO": return { texto: "No encontrado", clase: "etiqueta-noencontrado",  icono: ICONOS.alerta };
    default:              return { texto: estado || "—",   clase: "etiqueta-pendiente",     icono: ICONOS.reloj };
  }
}

function abrirUbicacion(p) {
  const partes = [p.direccion, p.colonia, p.municipio, "Jalisco", "México"].filter(Boolean).join(", ");
  const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(partes);
  window.open(url, "_blank");
}

// ============================================================================
// NAVEGACIÓN
// ============================================================================
function mostrarPantalla(nombre) {
  pantallaActual = nombre;

  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("hidden"));

  const seccion = document.getElementById("pantalla-" + nombre);
  if (seccion) seccion.classList.remove("hidden");

  const config = PANTALLAS[nombre];
  if (config) {
    headerTitulo.textContent = config.titulo;
    headerSubtitulo.textContent = config.subtitulo();
  }

  document.querySelectorAll(".footer-btn").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.nav === nombre);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// LISTA PEDIDOS
// ============================================================================
function crearTarjetaPedido(p) {
  const estado = infoEstado(p.estadoEntrega);
  const direccionCorta = `${p.direccion}, ${p.colonia}`;

  return `
    <article class="pedido-card" data-id="${p.id}">
      <div class="pedido-contenido">
        <div class="pedido-imagen">${ICONOS.huevera}</div>
        <div class="pedido-detalles">
          <div class="pedido-numero">${p.id}</div>
          <div class="pedido-cliente">${ICONOS.usuario}<span>${p.nombre}</span></div>
          <div class="pedido-direccion">${ICONOS.ubicacion}<span>${direccionCorta}</span></div>
        </div>
        <div class="pedido-derecha">
          <span class="etiqueta ${estado.clase}">${estado.icono}${estado.texto}</span>
          <span class="pedido-total">$${p.precioTotal}</span>
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
  const filtro = filtroBusqueda.toLowerCase().trim();

  let porEstado = pedidosActuales;
  if (filtroEstado === "PENDIENTE") {
    porEstado = pedidosActuales.filter(p =>
      p.estadoEntrega === "PENDIENTE" || p.estadoEntrega === "NO_ENCONTRADO"
    );
  } else {
    porEstado = pedidosActuales.filter(p => p.estadoEntrega === filtroEstado);
  }

  const filtrados = !filtro ? porEstado : porEstado.filter(p =>
    (p.id || "").toLowerCase().includes(filtro) ||
    (p.nombre || "").toLowerCase().includes(filtro) ||
    (p.direccion || "").toLowerCase().includes(filtro) ||
    (p.colonia || "").toLowerCase().includes(filtro)
  );

  if (!filtrados.length) {
    const mensajes = {
      "PENDIENTE":     "No tienes pedidos por entregar. ¡Buen trabajo! 🎉",
      "ENTREGADO":     "Aún no has entregado pedidos.",
      "CANCELADO":     "No hay pedidos cancelados.",
      "NO_ENCONTRADO": "No hay pedidos no encontrados."
    };
    listaPedidos.innerHTML = `<p class="vacio">${mensajes[filtroEstado] || "Sin pedidos."}</p>`;
    return;
  }

  listaPedidos.innerHTML = filtrados.map(crearTarjetaPedido).join("");
}

function renderizarResumen(resumen) {
  resumenTitulo.textContent = `Hoy tienes ${resumen.total} pedidos en ruta`;
  const porEntregar = (resumen.pendientes || 0) + (resumen.noEncontrados || 0);
  resumenSub.textContent = `${porEntregar} por entregar · ${resumen.entregados || 0} entregados`;
}

function renderizarChips(resumen) {
  const pendientes = (resumen.pendientes || 0) + (resumen.noEncontrados || 0);
  const nums = {
    "PENDIENTE":     pendientes,
    "ENTREGADO":     resumen.entregados || 0,
    "CANCELADO":     resumen.cancelados || 0,
    "NO_ENCONTRADO": resumen.noEncontrados || 0
  };
  Object.keys(nums).forEach(k => {
    const el = document.querySelector(`[data-num="${k}"]`);
    if (el) el.textContent = nums[k];
  });

  chipsFiltro.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.filtro === filtroEstado);
  });
}

function calcularResumenLocal() {
  return {
    total:         pedidosActuales.length,
    pendientes:    pedidosActuales.filter(p => p.estadoEntrega === "PENDIENTE").length,
    entregados:    pedidosActuales.filter(p => p.estadoEntrega === "ENTREGADO").length,
    cancelados:    pedidosActuales.filter(p => p.estadoEntrega === "CANCELADO").length,
    noEncontrados: pedidosActuales.filter(p => p.estadoEntrega === "NO_ENCONTRADO").length
  };
}

// ============================================================================
// CARGA PEDIDOS
// ============================================================================
async function cargarPedidos() {
  if (!sesionActual || !sesionActual.repartidor) return;

  listaPedidos.innerHTML = `<p class="cargando">Cargando pedidos...</p>`;

  try {
    const resultado = await API.pedidos(sesionActual.repartidor);

    if (!resultado.ok) {
      listaPedidos.innerHTML = `<p class="vacio">Error: ${resultado.error || "no se pudo cargar."}</p>`;
      return;
    }

    pedidosActuales = resultado.pedidos || [];
    const resumen = resultado.resumen || { total: 0, pendientes: 0, entregados: 0, cancelados: 0, noEncontrados: 0 };
    renderizarResumen(resumen);
    renderizarChips(resumen);
    renderizarLista();
    procesarPedidoDeURL();

  } catch (error) {
    console.error(error);
    listaPedidos.innerHTML = `<p class="vacio">Error de conexión. Toca Actualizar para reintentar.</p>`;
  }
}

// ============================================================================
// RUTAS
// ============================================================================
function renderizarRutas() {
  const colonias = sesionActual.colonias || [];
  const filtro = filtroRutas.toLowerCase().trim();

  const filtradas = !filtro ? colonias : colonias.filter(c =>
    (c.colonia || "").toLowerCase().includes(filtro) ||
    (c.municipio || "").toLowerCase().includes(filtro)
  );

  if (!filtradas.length) {
    listaRutas.innerHTML = `<p class="vacio">No se encontraron colonias.</p>`;
    return;
  }

  listaRutas.innerHTML = filtradas.map(c => `
    <div class="ruta-card">
      <div class="ruta-card-icono">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/>
          <circle cx="12" cy="10" r="2.5"/>
        </svg>
      </div>
      <div class="ruta-card-info">
        <div class="ruta-card-nombre">${c.colonia || "—"}</div>
        <div class="ruta-card-municipio">${c.municipio || "—"}${c.codigoPostal ? " · CP " + c.codigoPostal : ""}</div>
        <div class="ruta-card-footer">
          <span class="ruta-card-dia">${c.diaEntrega || "Sin día"}</span>
          <span class="ruta-card-precios">⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</span>
        </div>
      </div>
    </div>
  `).join("");
}

async function refrescarRutas() {
  if (!sesionActual) return;

  listaRutas.innerHTML = `<p class="cargando">Cargando rutas...</p>`;

  try {
    const r = await API.misRutas(sesionActual.correo);

    if (r.ok && r.colonias) {
      sesionActual.colonias = r.colonias;
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(sesionActual));
      } catch (e) { /* silenciar */ }
    }
  } catch (error) {
    console.error("Error al refrescar rutas:", error);
  }

  headerSubtitulo.textContent = PANTALLAS.rutas.subtitulo();

  filtroRutas = "";
  inputBusquedaRutas.value = "";
  renderizarRutas();
}

// ============================================================================
// MIS FINANZAS
// ============================================================================
async function cargarCaja() {
  if (!sesionActual) return;

  cajaContenido.innerHTML = `<p class="cargando">Cargando finanzas...</p>`;

  try {
    const r = await API.caja(sesionActual.correo);

    if (!r.ok) {
      cajaContenido.innerHTML = `<p class="vacio">Error: ${r.error || "no se pudo cargar."}</p>`;
      return;
    }

    cajaActual = r;
    renderizarCaja();

  } catch (error) {
    console.error(error);
    cajaContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarCaja() {
  if (!cajaActual) return;

  const periodo = cajaActual[periodoCaja];
  if (!periodo) {
    cajaContenido.innerHTML = `<p class="vacio">Sin datos.</p>`;
    return;
  }

  const ing = periodo.ingresos;
  const com = periodo.compras;
  const bal = periodo.balance;

  const claseBalance = bal >= 0 ? "positivo" : "negativo";
  const simboloBalance = bal >= 0 ? "+" : "";

  let comprasDetalleHTML = "";
  if (com.cajasBlancas > 0 || com.cajasRojas > 0) {
    comprasDetalleHTML = `
      <div class="caja-desglose">
        ${com.cajasBlancas > 0 ? `
          <div class="caja-desglose-fila">
            <span class="label">⚪ Cajas blancas</span>
            <span class="valor">${com.cajasBlancas}</span>
          </div>
        ` : ""}
        ${com.cajasRojas > 0 ? `
          <div class="caja-desglose-fila">
            <span class="label">🔴 Cajas rojas</span>
            <span class="valor">${com.cajasRojas}</span>
          </div>
        ` : ""}
      </div>
    `;
  }

  cajaContenido.innerHTML = `
    <div class="caja-card">
      <p class="caja-card-titulo">Ingresos</p>
      <p class="caja-card-valor">${formatearMoneda(ing.total)}</p>
      <p class="caja-card-sub">${ing.entregas} entrega(s) · ${ing.carteras} cartera(s)</p>

      <div class="caja-desglose">
        <div class="caja-desglose-fila">
          <span class="label">${ICONOS.efectivo} Efectivo</span>
          <span class="valor">${formatearMoneda(ing.efectivo)}</span>
        </div>
        <div class="caja-desglose-fila">
          <span class="label">${ICONOS.transferencia} Transferencia</span>
          <span class="valor">${formatearMoneda(ing.transferencia)}</span>
        </div>
      </div>
    </div>

    <div class="caja-card">
      <p class="caja-card-titulo">Compras a HuevoBueno</p>
      <p class="caja-card-valor">${formatearMoneda(com.total)}</p>
      <p class="caja-card-sub">${com.cajasBlancas + com.cajasRojas} caja(s) en total</p>
      ${comprasDetalleHTML}
    </div>

    <div class="caja-card caja-card-balance ${claseBalance}">
      <p class="caja-card-titulo">Balance del período</p>
      <p class="caja-card-valor">${simboloBalance}${formatearMoneda(bal)}</p>
      <p class="caja-card-sub">Ingresos − Compras</p>
    </div>
  `;
}

function cambiarPeriodoCaja(periodo) {
  periodoCaja = periodo;

  chipsCaja.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === periodo);
  });

  renderizarCaja();
}

// ============================================================================
// MIS COMPRAS
// ============================================================================
async function cargarMisCompras() {
  if (!sesionActual) return;

  misComprasResumen.innerHTML = `<p class="cargando">Cargando...</p>`;
  misComprasLista.innerHTML = `<p class="cargando">Cargando compras...</p>`;

  try {
    const r = await API.misCompras(sesionActual.correo);

    if (!r.ok) {
      misComprasResumen.innerHTML = `<p class="vacio">Error: ${r.error || "no se pudo cargar."}</p>`;
      misComprasLista.innerHTML = "";
      return;
    }

    comprasActuales = r;
    renderizarMisCompras();

  } catch (error) {
    console.error(error);
    misComprasResumen.innerHTML = `<p class="vacio">Error de conexión.</p>`;
    misComprasLista.innerHTML = "";
  }
}

function renderizarMisCompras() {
  if (!comprasActuales) return;

  const resumen = comprasActuales.resumen || {};
  const compras = comprasActuales.compras || [];

  const totales = {
    todas: compras.length,
    pagadas: compras.filter(c => c.estado === "pagada").length,
    con_saldo: compras.filter(c => c.estado === "con_saldo").length
  };
  chipsMisCompras.querySelectorAll(".chip").forEach(chip => {
    const f = chip.dataset.filtro;
    let numSpan = chip.querySelector(".chip-num");
    if (!numSpan) {
      numSpan = document.createElement("span");
      numSpan.className = "chip-num";
      chip.appendChild(numSpan);
    }
    numSpan.textContent = totales[f] || 0;
    chip.classList.toggle("activo", chip.dataset.filtro === filtroMisCompras);
  });

  const saldo = resumen.saldoPendiente || 0;
  const claseSaldo = saldo > 0 ? "caja-card-balance negativo" : "caja-card-balance positivo";

  misComprasResumen.innerHTML = `
    <div class="caja-card">
      <p class="caja-card-titulo">Total comprado</p>
      <p class="caja-card-valor">${formatearMoneda(resumen.totalComprado || 0)}</p>
      <p class="caja-card-sub">${resumen.numCompras || 0} compra(s) registrada(s)</p>
    </div>
    <div class="caja-card ${claseSaldo}">
      <p class="caja-card-titulo">Saldo pendiente</p>
      <p class="caja-card-valor">${formatearMoneda(saldo)}</p>
      <p class="caja-card-sub">${saldo > 0 ? "Tienes compras por pagar" : "Estás al día con HuevoBueno"}</p>
    </div>
  `;

  const filtradas = compras.filter(c => {
    if (filtroMisCompras === "todas") return true;
    if (filtroMisCompras === "pagadas") return c.estado === "pagada";
    if (filtroMisCompras === "con_saldo") return c.estado === "con_saldo";
    return true;
  });

  if (!filtradas.length) {
    misComprasLista.innerHTML = `<p class="vacio">No hay compras en esta categoría.</p>`;
    return;
  }

  misComprasLista.innerHTML = filtradas.map((c, idx) => {
    const cajasTxt = [];
    if (c.cajasBlancas > 0) cajasTxt.push(`${c.cajasBlancas} blanca(s)`);
    if (c.cajasRojas > 0) cajasTxt.push(`${c.cajasRojas} roja(s)`);

    const estadoClase = c.estado === "pagada" ? "compra-pagada" : "compra-saldo";
    const estadoTxt = c.estado === "pagada" ? "Pagada" : `Debes ${formatearMoneda(c.saldo)}`;

    return `
      <div class="compra-card-compra" data-idx="${idx}">
        <div class="compra-card-compra-info">
          <div class="compra-card-compra-fecha">${formatearFechaLarga(c.fecha)}</div>
          <div class="compra-card-compra-detalle">${cajasTxt.join(" · ")}</div>
          ${c.notas ? `<div class="compra-card-compra-notas">"${c.notas}"</div>` : ""}
        </div>
        <div class="compra-card-compra-montos">
          <div class="compra-card-compra-total">${formatearMoneda(c.total)}</div>
          <div class="compra-card-compra-estado ${estadoClase}">${estadoTxt}</div>
        </div>
      </div>
    `;
  }).join("");

  misComprasLista.querySelectorAll(".compra-card-compra").forEach(card => {
    card.addEventListener("click", () => {
      const idx = Number(card.dataset.idx);
      abrirModalCompra(filtradas[idx]);
    });
  });
}

function cambiarFiltroMisCompras(filtro) {
  filtroMisCompras = filtro;

  chipsMisCompras.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.filtro === filtro);
  });

  renderizarMisCompras();
}

function abrirModalCompra(compra) {
  if (!compra || !modalCompra) return;

  compraModalActual = compra;

  const cajasBlancas = compra.cajasBlancas > 0
    ? `<div class="modal-fila"><span class="label">Cajas blancas</span><span class="valor">${compra.cajasBlancas} × ${formatearMoneda(compra.precioBlanco)}</span></div>`
    : "";
  const cajasRojas = compra.cajasRojas > 0
    ? `<div class="modal-fila"><span class="label">Cajas rojas</span><span class="valor">${compra.cajasRojas} × ${formatearMoneda(compra.precioRojo)}</span></div>`
    : "";

  const saldoHTML = compra.saldo > 0
    ? `<div class="modal-fila"><span class="label"><strong>Saldo pendiente</strong></span><span class="valor" style="color:#856404;"><strong>${formatearMoneda(compra.saldo)}</strong></span></div>`
    : `<div class="modal-fila"><span class="label">Saldo pendiente</span><span class="valor" style="color:#155724;">Pagada ✓</span></div>`;

  const botonNota = compra.folio && compra.saldo <= 0
    ? `<button class="btn-ver-nota-grande" id="btn-ver-nota-modal">
         📄 Ver nota de remisión
       </button>`
    : "";

  modalCompraCuerpo.innerHTML = `
    <h2 class="modal-titulo">Compra</h2>
    <p class="modal-sub">${formatearFechaLarga(compra.fecha)}${compra.folio ? " · " + compra.folio : ""}</p>

    <div class="modal-seccion">
      <div class="modal-fila"><span class="label">Fecha</span><span class="valor">${formatearFecha(compra.fecha)}</span></div>
    </div>

    <div class="modal-seccion">
      ${cajasBlancas}
      ${cajasRojas}
    </div>

    <div class="modal-seccion">
      <div class="modal-fila"><span class="label"><strong>Total</strong></span><span class="valor"><strong>${formatearMoneda(compra.total)}</strong></span></div>
      <div class="modal-fila"><span class="label">Pagado</span><span class="valor">${formatearMoneda(compra.montoPagado)}</span></div>
      ${saldoHTML}
    </div>

    ${compra.notas ? `
      <div class="modal-seccion">
        <div class="modal-fila"><span class="label">Notas</span><span class="valor">${compra.notas}</span></div>
      </div>
    ` : ""}

    ${botonNota}
  `;

  modalCompra.classList.remove("hidden");

  const btnNotaModal = document.getElementById("btn-ver-nota-modal");
  if (btnNotaModal) {
    btnNotaModal.addEventListener("click", () => {
      cerrarModalCompra();
      verNotaRemision(compra.folio);
    });
  }
}

function cerrarModalCompra() {
  if (modalCompra) modalCompra.classList.add("hidden");
  compraModalActual = null;
}

// ============================================================================
// NOTA DE REMISIÓN
// ============================================================================
async function verNotaRemision(folio) {
  if (!folio) { alert("Compra sin folio."); return; }

  modalNota.classList.remove("hidden");
  modalNotaCuerpo.innerHTML = `<p class="cargando">Cargando nota...</p>`;

  try {
    const r = await API.obtenerNotaRemision(folio);
    if (!r.ok) {
      modalNotaCuerpo.innerHTML = `<p class="vacio">${r.error || "No se pudo cargar la nota."}</p>`;
      return;
    }

    modalNotaCuerpo.innerHTML = renderizarNota(r.nota);
  } catch (err) {
    console.error(err);
    modalNotaCuerpo.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarNota(nota) {
  const e = nota.emisor || {};
  const rec = nota.receptor || {};
  const conceptos = nota.conceptos || [];

  const conceptosRows = conceptos.map(c => `
    <tr>
      <td>${escaparHTML(c.descripcion)}</td>
      <td class="nota-col-num">${c.cantidad}</td>
      <td class="nota-col-num">${formatearMoneda(c.precioUnitario)}</td>
      <td class="nota-col-num">${formatearMoneda(c.importe)}</td>
    </tr>
  `).join("");

  return `
    <div class="nota-hoja">
      <div class="nota-header">
        <div class="nota-emisor">
          <div class="nota-emisor-nombre">${escaparHTML(e.nombre)}</div>
          <div class="nota-emisor-slogan">${escaparHTML(e.slogan)}</div>
          <div class="nota-emisor-datos">
            ${escaparHTML(e.direccion)}<br>
            Tel: ${escaparHTML(e.telefono)}<br>
            ${escaparHTML(e.correo)}
          </div>
        </div>
        <div class="nota-titulo-bloque">
          <div class="nota-tipo">NOTA DE REMISIÓN</div>
          <div class="nota-folio">${escaparHTML(nota.folio)}</div>
          <div class="nota-fecha">Fecha: ${formatearFechaLarga(nota.fecha)}</div>
        </div>
      </div>

      <div class="nota-seccion">
        <div class="nota-seccion-titulo">RECEPTOR</div>
        <div class="nota-receptor">
          <div><span class="nota-label">Nombre:</span> ${escaparHTML(rec.nombre)}</div>
          <div><span class="nota-label">Domicilio:</span> ${escaparHTML(rec.domicilio)}</div>
          <div><span class="nota-label">Teléfono:</span> ${escaparHTML(rec.telefono)}</div>
        </div>
      </div>

      <div class="nota-seccion">
        <table class="nota-tabla">
          <thead>
            <tr>
              <th>Descripción</th>
              <th class="nota-col-num">Cant.</th>
              <th class="nota-col-num">P. Unit.</th>
              <th class="nota-col-num">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${conceptosRows}
          </tbody>
        </table>
      </div>

      <div class="nota-totales">
        <div class="nota-total-linea">
          <span class="nota-total-label">TOTAL:</span>
          <span class="nota-total-valor">${formatearMoneda(nota.total)}</span>
        </div>
        <div class="nota-total-letra">
          <strong>Total con letra:</strong> ${escaparHTML(nota.totalLetra)}
        </div>
      </div>

      <div class="nota-pie">
        <div class="nota-pie-fila">
          <span><strong>Forma de pago:</strong> ${escaparHTML(nota.formaPago)}</span>
          <span><strong>Estado:</strong> ${escaparHTML(nota.estado)}</span>
        </div>
        ${nota.notas ? `<div class="nota-pie-notas"><strong>Notas:</strong> ${escaparHTML(nota.notas)}</div>` : ""}
      </div>

      <div class="nota-firma">
        <div class="nota-firma-linea"></div>
        <div class="nota-firma-texto">${escaparHTML(e.nombre)}</div>
        <div class="nota-firma-sub">Emisor</div>
      </div>
    </div>
  `;
}

function cerrarModalNota() {
  if (modalNota) modalNota.classList.add("hidden");
  if (modalNotaCuerpo) modalNotaCuerpo.innerHTML = "";
}

if (btnCerrarModalN) btnCerrarModalN.addEventListener("click", cerrarModalNota);

if (btnImprimirNota) {
  btnImprimirNota.addEventListener("click", () => {
    window.print();
  });
}

if (modalNota) {
  modalNota.addEventListener("click", (e) => {
    if (e.target === modalNota) cerrarModalNota();
  });
}

// ============================================================================
// HISTORIAL
// ============================================================================
async function cargarHistorial() {
  if (!sesionActual) return;

  historialContenido.innerHTML = `<p class="cargando">Cargando historial...</p>`;

  try {
    const r = await API.historial(sesionActual.correo, periodoHistorial);

    if (!r.ok) {
      historialContenido.innerHTML = `<p class="vacio">Error: ${r.error || "no se pudo cargar."}</p>`;
      return;
    }

    historialActual = r;
    renderizarHistorial();

  } catch (error) {
    console.error(error);
    historialContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarHistorial() {
  if (!historialActual) return;

  const resumen = historialActual.resumen || { totalPedidos: 0, totalCobrado: 0, totalCarteras: 0 };
  const grupos  = historialActual.grupos  || [];
  const filtro  = filtroBusquedaHist.toLowerCase().trim();

  let html = `
    <div class="historial-resumen">
      <div class="historial-resumen-icono">${ICONOS.paquete}</div>
      <div class="historial-resumen-textos">
        <p class="historial-resumen-titulo">${resumen.totalPedidos} pedido(s) · ${formatearMoneda(resumen.totalCobrado)}</p>
        <p class="historial-resumen-sub">${resumen.totalCarteras} cartera(s) entregada(s)</p>
      </div>
    </div>
  `;

  if (!grupos.length) {
    html += `<p class="vacio">No hay pedidos en este período.</p>`;
    historialContenido.innerHTML = html;
    return;
  }

  const gruposFiltrados = grupos.map(g => {
    const pedidos = !filtro ? g.pedidos : g.pedidos.filter(p =>
      (p.id || "").toLowerCase().includes(filtro) ||
      (p.nombre || "").toLowerCase().includes(filtro) ||
      (p.colonia || "").toLowerCase().includes(filtro)
    );
    return { ...g, pedidos: pedidos };
  }).filter(g => g.pedidos.length > 0);

  if (!gruposFiltrados.length) {
    html += `<p class="vacio">No se encontraron coincidencias.</p>`;
    historialContenido.innerHTML = html;
    return;
  }

  gruposFiltrados.forEach(g => {
    html += `
      <div class="historial-grupo">
        <div class="historial-grupo-header">
          <span class="historial-grupo-fecha">${g.etiqueta}</span>
          <span class="historial-grupo-total">${g.totalEntregas} pedido(s) · ${formatearMoneda(g.totalCobrado)}</span>
        </div>
        ${g.pedidos.map(p => {
          const metodoClase = p.metodoPago === "EFECTIVO" ? "efectivo" :
                              p.metodoPago === "TRANSFERENCIA" ? "transferencia" : "";
          return `
            <div class="historial-card">
              <div class="historial-card-icono">${ICONOS.huevera}</div>
              <div class="historial-card-info">
                <div class="historial-card-id">${p.id}</div>
                <div class="historial-card-nombre">${p.nombre}</div>
                <div class="historial-card-detalle">${p.cantidad} ${p.tipoHuevo} · ${p.colonia}</div>
              </div>
              <div class="historial-card-derecha">
                <span class="historial-card-total">${formatearMoneda(p.precioTotal)}</span>
                ${p.metodoPago ? `<span class="historial-card-metodo ${metodoClase}">${p.metodoPago}</span>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  });

  historialContenido.innerHTML = html;
}

function cambiarPeriodoHistorial(periodo) {
  periodoHistorial = periodo;

  chipsHistorial.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === periodo);
  });

  cargarHistorial();
}

// ============================================================================
// RENDIMIENTO
// ============================================================================
async function cargarRendimiento() {
  if (!sesionActual) return;

  rendimientoContenido.innerHTML = `<p class="cargando">Cargando rendimiento...</p>`;

  try {
    const r = await API.rendimiento(sesionActual.correo, periodoRendimiento);

    if (!r.ok) {
      rendimientoContenido.innerHTML = `<p class="vacio">Error: ${r.error || "no se pudo cargar."}</p>`;
      return;
    }

    rendimientoActual = r;
    renderizarRendimiento();

  } catch (error) {
    console.error(error);
    rendimientoContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarRendimiento() {
  if (!rendimientoActual) return;

  const cp  = rendimientoActual.cardPrincipal;
  const th  = rendimientoActual.tipoHuevo;
  const top = rendimientoActual.topColonias || [];
  const cm  = rendimientoActual.coloniasMuertas || { total: 0, ejemplos: [] };
  const md  = rendimientoActual.mejorDia || { dia: null, promedio: 0 };
  const sem = rendimientoActual.semanas || [];

  let cambioHTML = "";
  if (cp.cambioPorcentaje !== null && cp.cambioPorcentaje !== undefined) {
    const clase = cp.cambioPorcentaje > 0 ? "up" : (cp.cambioPorcentaje < 0 ? "down" : "flat");
    const flecha = cp.cambioPorcentaje > 0 ? "↑" : (cp.cambioPorcentaje < 0 ? "↓" : "=");
    const signo  = cp.cambioPorcentaje > 0 ? "+" : "";
    cambioHTML = `<span class="rend-cambio ${clase}">${flecha} ${signo}${cp.cambioPorcentaje}% vs período anterior</span>`;
  } else if (cp.totalAnterior === 0 && cp.totalCobrado > 0) {
    cambioHTML = `<span class="rend-cambio up">Nuevo período con ventas</span>`;
  } else if (cp.totalCobrado === 0) {
    cambioHTML = `<span class="rend-cambio flat">Sin ventas en este período</span>`;
  }

  const totalTH = th.blanco.ingresos + th.rojo.ingresos;
  const pctBlanco = totalTH > 0 ? Math.round((th.blanco.ingresos / totalTH) * 100) : 0;
  const pctRojo   = totalTH > 0 ? Math.round((th.rojo.ingresos / totalTH) * 100) : 0;

  let tipoHuevoHTML = "";
  if (totalTH === 0) {
    tipoHuevoHTML = `<p class="rend-vacio">Aún no hay ventas en este período.</p>`;
  } else {
    tipoHuevoHTML = `
      <div class="rend-barra-h">
        <div class="rend-barra-h-header">
          <span class="rend-barra-h-label">⚪ Blanco</span>
          <span class="rend-barra-h-valor">${formatearMoneda(th.blanco.ingresos)}</span>
        </div>
        <div class="rend-barra-h-track">
          <div class="rend-barra-h-fill blanco" style="width: ${pctBlanco}%"></div>
        </div>
        <div class="rend-barra-h-sub">${th.blanco.carteras} cartera(s) · ${pctBlanco}%</div>
      </div>

      <div class="rend-barra-h">
        <div class="rend-barra-h-header">
          <span class="rend-barra-h-label">🔴 Rojo</span>
          <span class="rend-barra-h-valor">${formatearMoneda(th.rojo.ingresos)}</span>
        </div>
        <div class="rend-barra-h-track">
          <div class="rend-barra-h-fill rojo" style="width: ${pctRojo}%"></div>
        </div>
        <div class="rend-barra-h-sub">${th.rojo.carteras} cartera(s) · ${pctRojo}%</div>
      </div>
    `;
  }

  let topColoniasHTML = "";
  if (top.length === 0) {
    topColoniasHTML = `<p class="rend-vacio">Sin ventas registradas.</p>`;
  } else {
    const maxIngreso = top[0].ingresos;
    topColoniasHTML = top.map((c, i) => {
      const pct = maxIngreso > 0 ? Math.round((c.ingresos / maxIngreso) * 100) : 0;
      return `
        <div class="rend-barra-h">
          <div class="rend-barra-h-header">
            <span class="rend-barra-h-label">${i + 1}. ${c.colonia}</span>
            <span class="rend-barra-h-valor">${formatearMoneda(c.ingresos)}</span>
          </div>
          <div class="rend-barra-h-track">
            <div class="rend-barra-h-fill" style="width: ${pct}%"></div>
          </div>
          <div class="rend-barra-h-sub">${c.carteras} cartera(s)</div>
        </div>
      `;
    }).join("");
  }

  let coloniasMuertasHTML = "";
  if (cm.total === 0) {
    coloniasMuertasHTML = `<p class="rend-vacio">Todas tus colonias tuvieron ventas. ¡Excelente!</p>`;
  } else {
    const ejemplos = cm.ejemplos.map(e => `
      <div class="rend-muerta-item">
        <div>
          <div class="rend-muerta-nombre">${e.colonia}</div>
          <div class="rend-muerta-motivo">${e.motivo}</div>
        </div>
        <div style="font-size:11.5px;font-weight:700;color:#856404;">${formatearMoneda(e.ingresos)}</div>
      </div>
    `).join("");

    const restantes = cm.total - cm.ejemplos.length;
    coloniasMuertasHTML = `
      <div class="rend-muertas">${ejemplos}</div>
      ${restantes > 0 ? `<p class="rend-muerta-mas">+ ${restantes} colonia(s) más sin ventas</p>` : ""}
    `;
  }

  let mejorDiaHTML = "";
  if (!md.dia) {
    mejorDiaHTML = `<p class="rend-vacio">Aún no hay suficientes datos.</p>`;
  } else {
    mejorDiaHTML = `
      <div class="rend-mejor-dia">
        <div class="rend-mejor-dia-trofeo">🏆</div>
        <div class="rend-mejor-dia-textos">
          <div class="rend-mejor-dia-dia">Los ${md.dia.toLowerCase()} vendes más</div>
          <div class="rend-mejor-dia-prom">Promedio: <strong>${formatearMoneda(md.promedio)}</strong> por entrega</div>
        </div>
      </div>
    `;
  }

  let semanasHTML = "";
  if (!sem.length || sem.every(s => s.total === 0)) {
    semanasHTML = `<p class="rend-vacio">Aún no hay datos suficientes.</p>`;
  } else {
    const maxTotal = Math.max(...sem.map(s => s.total), 1);
    semanasHTML = `
      <div class="rend-barras-v">
        ${sem.map(s => {
          const alturaPct = Math.round((s.total / maxTotal) * 100);
          return `
            <div class="rend-barra-v">
              <span class="rend-barra-v-valor">$${s.total}</span>
              <div class="rend-barra-v-columna" style="height: ${alturaPct}%"></div>
              <span class="rend-barra-v-label">${s.etiqueta}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  rendimientoContenido.innerHTML = `
    <div class="rend-card-principal">
      <p class="titulo">Total cobrado</p>
      <p class="valor">${formatearMoneda(cp.totalCobrado)}</p>
      ${cambioHTML}
      <p class="sub">${cp.totalEntregas} entrega(s) · ${cp.totalCarteras} cartera(s) · Promedio ${formatearMoneda(cp.promedioEntrega)}</p>
    </div>

    <div class="rend-card">
      <p class="rend-card-titulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
        Tipo de huevo
      </p>
      ${tipoHuevoHTML}
    </div>

    <div class="rend-card">
      <p class="rend-card-titulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Tus mejores colonias
      </p>
      ${topColoniasHTML}
    </div>

    <div class="rend-card">
      <p class="rend-card-titulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Colonias con ventas bajas
      </p>
      ${coloniasMuertasHTML}
    </div>

    <div class="rend-card">
      <p class="rend-card-titulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Mejor día de la semana
      </p>
      ${mejorDiaHTML}
    </div>

    <div class="rend-card">
      <p class="rend-card-titulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Últimas 4 semanas
      </p>
      ${semanasHTML}
    </div>
  `;
}

function cambiarPeriodoRendimiento(periodo) {
  periodoRendimiento = periodo;

  chipsRendimiento.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === periodo);
  });

  cargarRendimiento();
}

// ============================================================================
// MODAL DETALLE PEDIDO
// ============================================================================
function htmlPasoInicial(p) {
  return `
    <div class="modal-acciones">
      <button class="btn-estado btn-estado-entregado" data-estado="ENTREGADO">
        ${ICONOS.check}
        Entregado
      </button>
      <button class="btn-estado btn-estado-cancelado" data-estado="CANCELADO">
        ${ICONOS.x}
        Cancelado
      </button>
      <button class="btn-estado btn-estado-noencontrado" data-estado="NO_ENCONTRADO">
        ${ICONOS.alerta}
        No encontrado
      </button>
    </div>

    <div class="modal-acciones-2">
      <button class="btn-estado btn-estado-contactar" data-contactar="1">
        ${ICONOS.whatsapp}
        Contactar cliente
      </button>
      <button class="btn-estado btn-estado-noencontrado" data-ubicacion-modal="1">
        ${ICONOS.mapa}
        Ver mapa
      </button>
    </div>
  `;
}

function htmlPasoPago() {
  return `
    <div class="modal-seccion" style="text-align:center;">
      <p style="font-size:13px;color:#6B7280;margin-bottom:12px;">¿Cómo pagó el cliente?</p>
      <div class="modal-acciones-2">
        <button class="btn-estado btn-estado-entregado" data-pago="EFECTIVO">
          ${ICONOS.efectivo}
          Efectivo
        </button>
        <button class="btn-estado btn-estado-entregado" data-pago="TRANSFERENCIA">
          ${ICONOS.transferencia}
          Transferencia
        </button>
      </div>
    </div>
  `;
}

function htmlPasoTicket() {
  return `
    <div class="modal-seccion" style="text-align:center;">
      <p style="font-size:13px;color:#6B7280;margin-bottom:12px;">Envía el comprobante al cliente por WhatsApp.</p>
      <div class="modal-acciones" style="grid-template-columns: 1fr;">
        <button class="btn-estado btn-estado-entregado" data-ticket="enviar">
          ${ICONOS.enviar}
          Enviar ticket
        </button>
      </div>
    </div>
  `;
}

function htmlPasoFinal(p) {
  return `
    <div class="modal-seccion" style="text-align:center;padding:20px 0;">
      <div style="font-size:42px;margin-bottom:8px;">🎉</div>
      <p style="font-size:15px;font-weight:700;color:#1B5E20;">¡Pedido completado!</p>
      <p style="font-size:12px;color:#6B7280;margin-top:6px;">${p.id} · $${p.precioTotal}</p>
    </div>
  `;
}

function obtenerHtmlAcciones(p) {
  if (p.estadoEntrega === "ENTREGADO") {
    if (pasoModal === "pago" || !p.metodoPago) {
      pasoModal = "pago";
      return htmlPasoPago();
    }
    if (pasoModal === "ticket" || !p.ticketCompra) {
      pasoModal = "ticket";
      return htmlPasoTicket();
    }
    pasoModal = "final";
    return htmlPasoFinal(p);
  }

  if (p.estadoEntrega === "PENDIENTE" || p.estadoEntrega === "NO_ENCONTRADO") {
    pasoModal = "inicial";
    return htmlPasoInicial(p);
  }

  return "";
}

function renderizarModal() {
  const p = pedidoModalActual;
  if (!p) return;

  const estado = infoEstado(p.estadoEntrega);

  modalCuerpo.innerHTML = `
    <h2 class="modal-titulo">${p.id}</h2>
    <p class="modal-sub">${p.nombre}</p>

    <div class="modal-seccion">
      <div class="modal-fila"><span class="label">Dirección</span><span class="valor">${p.direccion || "—"}</span></div>
      <div class="modal-fila"><span class="label">Colonia</span><span class="valor">${p.colonia || "—"}</span></div>
      <div class="modal-fila"><span class="label">Municipio</span><span class="valor">${p.municipio || "—"}</span></div>
    </div>

    <div class="modal-seccion">
      <div class="modal-fila"><span class="label">Producto</span><span class="valor">${p.cantidad} ${p.tipoHuevo}</span></div>
      <div class="modal-fila"><span class="label">Total</span><span class="valor">$${p.precioTotal}</span></div>
    </div>

    <div class="modal-seccion">
      <div class="modal-fila"><span class="label">Estado</span><span class="valor"><span class="etiqueta ${estado.clase}">${estado.icono}${estado.texto}</span></span></div>
      ${p.metodoPago ? `<div class="modal-fila"><span class="label">Pago</span><span class="valor">${p.metodoPago}</span></div>` : ""}
      ${p.fechaEntrega ? `<div class="modal-fila"><span class="label">Entregado</span><span class="valor">${formatearFecha(p.fechaEntrega)} ${formatearHora(p.fechaEntrega)}</span></div>` : ""}
    </div>

    ${obtenerHtmlAcciones(p)}
  `;
}

function abrirModalDetalle(idPedido) {
  const p = pedidosActuales.find(x => x.id === idPedido);
  if (!p) return;

  pedidoModalActual = p;
  pasoModal = "inicial";
  renderizarModal();
  modalDetalle.classList.remove("hidden");
}

function cerrarModal() {
  modalDetalle.classList.add("hidden");
  pedidoModalActual = null;
  pasoModal = "inicial";
}

// ============================================================================
// DRAWER
// ============================================================================
function abrirDrawer() {
  if (!sesionActual) return;

  const inicial = (sesionActual.repartidor || "?").charAt(0).toUpperCase();
  drawerAvatar.textContent = inicial;
  drawerNombre.textContent = sesionActual.repartidor || "—";
  drawerCorreo.textContent = sesionActual.correo || "—";

  drawerOverlay.classList.remove("hidden");
}

function cerrarDrawer() {
  drawerOverlay.classList.add("hidden");
}

// ============================================================================
// ACCIONES DEL MODAL PEDIDO
// ============================================================================
async function accionarEstado(nuevoEstado) {
  const p = pedidoModalActual;
  if (!p) return;

  if (nuevoEstado !== "ENTREGADO") {
    alert("Este flujo estará disponible pronto.");
    return;
  }

  try {
    const resultado = await API.actualizar(p.id, { Estado_de_entrega: "ENTREGADO" });

    if (!resultado.ok) {
      alert("Error: " + (resultado.error || "no se pudo actualizar."));
      return;
    }

    p.estadoEntrega = "ENTREGADO";
    p.fechaEntrega  = new Date().toISOString();

    pasoModal = "pago";
    renderizarModal();

  } catch (error) {
    console.error(error);
    alert("Error de conexión.");
  }
}

async function accionarPago(metodoPago) {
  const p = pedidoModalActual;
  if (!p) return;

  try {
    const resultado = await API.actualizar(p.id, { Metodo_de_pago: metodoPago });

    if (!resultado.ok) {
      alert("Error: " + (resultado.error || "no se pudo guardar el pago."));
      return;
    }

    p.metodoPago = metodoPago;
    pasoModal = "ticket";
    renderizarModal();

  } catch (error) {
    console.error(error);
    alert("Error de conexión.");
  }
}

async function accionarTicket() {
  const p = pedidoModalActual;
  if (!p) return;

  try {
    const resultado = await API.enviarTicket(p.id);

    if (!resultado.ok) {
      alert("No se pudo enviar el ticket:\n\n" + (resultado.error || "Error desconocido."));
      return;
    }

    p.ticketCompra = "ENVIAR";
    pasoModal = "final";
    renderizarModal();

    await cargarPedidos();

    setTimeout(() => {
      cerrarModal();
      filtroEstado = "ENTREGADO";
      renderizarChips(calcularResumenLocal());
      renderizarLista();
    }, 1200);

  } catch (error) {
    console.error(error);
    alert("Error de conexión.");
  }
}

async function accionarContactar() {
  const p = pedidoModalActual;
  if (!p) return;

  try {
    const resultado = await API.contactarCliente(p.id);

    if (!resultado.ok) {
      alert("No se pudo avisar al cliente:\n\n" + (resultado.error || "Error desconocido."));
      return;
    }

    alert("✅ Se avisó al cliente que estás en su domicilio.");

  } catch (error) {
    console.error(error);
    alert("Error de conexión.");
  }
}

function accionarUbicacionModal() {
  const p = pedidoModalActual;
  if (!p) return;
  abrirUbicacion(p);
}

// ============================================================================
// REFRESCAR PANTALLA
// ============================================================================
function refrescarPantallaActual() {
  if (pantallaActual === "pedidos") {
    cargarPedidos();
  } else if (pantallaActual === "rutas") {
    refrescarRutas();
  } else if (pantallaActual === "caja") {
    cargarCaja();
  } else if (pantallaActual === "mis-compras") {
    cargarMisCompras();
  } else if (pantallaActual === "historial") {
    cargarHistorial();
  } else if (pantallaActual === "rendimiento") {
    cargarRendimiento();
  } else {
    btnRefrescar.style.transform = "rotate(360deg)";
    btnRefrescar.style.transition = "transform 0.5s";
    setTimeout(() => {
      btnRefrescar.style.transform = "";
      btnRefrescar.style.transition = "";
    }, 500);
  }
}

// ============================================================================
// EVENTOS
// ============================================================================
function manejarClicLista(e) {
  const boton = e.target.closest("button[data-accion]");
  if (!boton) return;

  const accion = boton.dataset.accion;
  const id     = boton.dataset.id;

  if (accion === "detalle") {
    abrirModalDetalle(id);
  } else if (accion === "ubicacion") {
    const p = pedidosActuales.find(x => x.id === id);
    if (p) abrirUbicacion(p);
  }
}

modalCuerpo.addEventListener("click", (e) => {
  const btnEstado = e.target.closest("button[data-estado]");
  if (btnEstado) { accionarEstado(btnEstado.dataset.estado); return; }

  const btnPago = e.target.closest("button[data-pago]");
  if (btnPago) { accionarPago(btnPago.dataset.pago); return; }

  const btnTicket = e.target.closest("button[data-ticket]");
  if (btnTicket) { accionarTicket(); return; }

  const btnContactar = e.target.closest("button[data-contactar]");
  if (btnContactar) { accionarContactar(); return; }

  const btnUbiModal = e.target.closest("button[data-ubicacion-modal]");
  if (btnUbiModal) { accionarUbicacionModal(); return; }
});

chipsFiltro.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filtroEstado = chip.dataset.filtro;
  renderizarChips(calcularResumenLocal());
  renderizarLista();
});

chipsCaja.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  cambiarPeriodoCaja(chip.dataset.periodo);
});

if (chipsMisCompras) {
  chipsMisCompras.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    cambiarFiltroMisCompras(chip.dataset.filtro);
  });
}

chipsHistorial.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  cambiarPeriodoHistorial(chip.dataset.periodo);
});

chipsRendimiento.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  cambiarPeriodoRendimiento(chip.dataset.periodo);
});

btnRefrescar.addEventListener("click", refrescarPantallaActual);
btnPerfil.addEventListener("click", abrirDrawer);

btnDrawerCerrar.addEventListener("click", cerrarDrawer);

drawerOverlay.addEventListener("click", (e) => {
  if (e.target === drawerOverlay) cerrarDrawer();
});

document.querySelector(".drawer-panel").addEventListener("click", (e) => {
  const item = e.target.closest("button[data-drawer-item]");
  if (!item) return;
  const accion = item.dataset.drawerItem;

  if (accion === "soporte") {
    const nombre = sesionActual ? sesionActual.repartidor : "un repartidor";
    const mensaje = `Hola, soy ${nombre}. Necesito soporte.`;
    const url = `https://wa.me/${WHATSAPP_SUPERVISOR}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  } else if (accion === "caja") {
    cerrarDrawer();
    mostrarPantalla("caja");
    cargarCaja();
  } else if (accion === "mis-compras") {
    cerrarDrawer();
    mostrarPantalla("mis-compras");
    cargarMisCompras();
  } else if (accion === "historial") {
    cerrarDrawer();
    mostrarPantalla("historial");
    cargarHistorial();
  } else if (accion === "cerrar-sesion") {
    if (!confirm("¿Cerrar sesión?")) return;
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    location.reload();
  }
});

document.querySelectorAll(".footer-nav").forEach(nav => {
  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-nav]");
    if (!btn) return;
    const destino = btn.dataset.nav;

    if (destino === "pedidos") {
      mostrarPantalla("pedidos");
    } else if (destino === "rutas") {
      mostrarPantalla("rutas");
      refrescarRutas();
    } else if (destino === "rendimiento") {
      mostrarPantalla("rendimiento");
      cargarRendimiento();
    }
  });
});

inputBusqueda.addEventListener("input", (e) => {
  filtroBusqueda = e.target.value;
  renderizarLista();
});

inputBusquedaRutas.addEventListener("input", (e) => {
  filtroRutas = e.target.value;
  renderizarRutas();
});

inputBusquedaHist.addEventListener("input", (e) => {
  filtroBusquedaHist = e.target.value;
  renderizarHistorial();
});

listaPedidos.addEventListener("click", manejarClicLista);
btnCerrarModal.addEventListener("click", cerrarModal);

modalDetalle.addEventListener("click", (e) => {
  if (e.target === modalDetalle) cerrarModal();
});

if (btnCerrarModalCompra) {
  btnCerrarModalCompra.addEventListener("click", cerrarModalCompra);
}

if (modalCompra) {
  modalCompra.addEventListener("click", (e) => {
    if (e.target === modalCompra) cerrarModalCompra();
  });
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
function iniciarApp(sesion) {
  sesionActual = sesion;

  document.getElementById("pantalla-login").classList.add("hidden");
  document.getElementById("app-principal").classList.remove("hidden");

  saludoRepartidor.textContent = `Hola, ${sesion.repartidor} 👋`;

  filtroEstado = "PENDIENTE";
  mostrarPantalla("pedidos");
  cargarPedidos();
}

// ============================================================================
// PROCESAR ?pedido=PED-XXX DE LA URL
// ============================================================================
function procesarPedidoDeURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get("pedido");

    if (!pedidoId) return;

    const p = pedidosActuales.find(x => x.id === pedidoId);

    if (!p) {
      console.log("Pedido no encontrado: " + pedidoId);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    abrirModalDetalle(pedidoId);
    window.history.replaceState({}, "", window.location.pathname);

  } catch (e) {
    console.error("Error procesando pedido de URL:", e);
  }
}

// ============================================================================
// AUTO-LOGIN
// ============================================================================
(function autoLogin() {
  try {
    const guardada = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!guardada) return;

    const datos = JSON.parse(guardada);

    if (datos && datos.ok && datos.repartidor) {
      iniciarApp(datos);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Sesión corrupta, la eliminamos.");
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  }
})();