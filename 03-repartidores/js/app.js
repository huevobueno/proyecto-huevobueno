/**
 * ============================================================================
 * APP - Orquestador principal e inicialización
 * ============================================================================
 */

window.sesionActual = null;
window.pantallaActual = "pedidos";

// --- Lógica del Drawer ---
function abrirDrawer() {
  if (!window.sesionActual) return;
  document.getElementById("drawer-avatar").textContent = (window.sesionActual.repartidor || "?").charAt(0).toUpperCase();
  document.getElementById("drawer-nombre").textContent = window.sesionActual.repartidor || "—";
  document.getElementById("drawer-correo").textContent = window.sesionActual.correo || "—";
  document.getElementById("drawer-overlay").classList.remove("hidden");
}
function cerrarDrawer() { document.getElementById("drawer-overlay").classList.add("hidden"); }

if (document.getElementById("btn-perfil")) document.getElementById("btn-perfil").addEventListener("click", abrirDrawer);
if (document.getElementById("btn-drawer-cerrar")) document.getElementById("btn-drawer-cerrar").addEventListener("click", cerrarDrawer);
if (document.getElementById("drawer-overlay")) document.getElementById("drawer-overlay").addEventListener("click", (e) => { if (e.target === document.getElementById("drawer-overlay")) cerrarDrawer(); });

if (document.querySelector(".drawer-panel")) {
  document.querySelector(".drawer-panel").addEventListener("click", (e) => {
    const item = e.target.closest("button[data-drawer-item]"); if (!item) return;
    const accion = item.dataset.drawerItem;
    if (accion === "soporte") {
      const url = `https://wa.me/${WHATSAPP_SUPERVISOR}?text=${encodeURIComponent(`Hola, soy ${window.sesionActual ? window.sesionActual.repartidor : "un repartidor"}. Necesito soporte.`)}`;
      window.open(url, "_blank");
    } else if (accion === "caja") { cerrarDrawer(); mostrarPantalla("caja"); cargarCaja(); }
    else if (accion === "mis-compras") { cerrarDrawer(); mostrarPantalla("mis-compras"); cargarMisCompras(); }
    else if (accion === "historial") { cerrarDrawer(); mostrarPantalla("historial"); cargarHistorial(); }
    else if (accion === "cerrar-sesion") { if (confirm("¿Cerrar sesión?")) { localStorage.removeItem(CONFIG.STORAGE_KEY); location.reload(); } }
  });
}

// --- Navegación Footer ---
if (document.querySelector(".footer-nav")) {
  document.querySelector(".footer-nav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-nav]"); if (!btn) return;
    const destino = btn.dataset.nav;
    if (destino === "pedidos") { mostrarPantalla("pedidos"); cargarPedidos(); }
    else if (destino === "rutas") { mostrarPantalla("rutas"); refrescarRutas(); }
    else if (destino === "rendimiento") { mostrarPantalla("rendimiento"); cargarRendimiento(); }
  });
}

if (document.getElementById("btn-refrescar")) {
  document.getElementById("btn-refrescar").addEventListener("click", () => {
    if (window.pantallaActual === "pedidos") cargarPedidos();
    else if (window.pantallaActual === "rutas") refrescarRutas();
    else if (window.pantallaActual === "caja") cargarCaja();
    else if (window.pantallaActual === "mis-compras") cargarMisCompras();
    else if (window.pantallaActual === "historial") cargarHistorial();
    else if (window.pantallaActual === "rendimiento") cargarRendimiento();
  });
}

// --- Inicialización ---
function iniciarApp(sesion) {
  window.sesionActual = sesion;
  document.getElementById("pantalla-login").classList.add("hidden");
  document.getElementById("app-principal").classList.remove("hidden");
  document.getElementById("saludo-repartidor").textContent = `Hola, ${sesion.repartidor} 👋`;
  window.filtroEstado = "PENDIENTE";
  mostrarPantalla("pedidos");
  cargarPedidos();
}

(function autoLogin() {
  try {
    const guardada = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!guardada) return;
    const datos = JSON.parse(guardada);
    if (datos && datos.ok && datos.repartidor) iniciarApp(datos);
    else localStorage.removeItem(CONFIG.STORAGE_KEY);
  } catch (e) { localStorage.removeItem(CONFIG.STORAGE_KEY); }
})();