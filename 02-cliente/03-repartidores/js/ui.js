/**
 * ============================================================================
 * UI - Constantes, Helpers y Elementos Compartidos
 * ============================================================================
 */

const WHATSAPP_SUPERVISOR = "523325110628";

const PANTALLAS = {
  pedidos: { titulo: "Pedidos", subtitulo: () => "Llevamos huevos frescos a tu comunidad" },
  rutas: { titulo: "Mis rutas", subtitulo: () => `${(window.sesionActual && window.sesionActual.colonias) ? window.sesionActual.colonias.length : 0} colonia(s) activa(s)` },
  rendimiento: { titulo: "Rendimiento", subtitulo: () => "Tu comportamiento de ventas" },
  caja: { titulo: "Mis finanzas", subtitulo: () => "Tus ingresos y compras" },
  "mis-compras": { titulo: "Mis compras", subtitulo: () => "Tus compras a HuevoBueno" },
  historial: { titulo: "Historial de pedidos", subtitulo: () => "Tus pedidos entregados" }
};

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
  huevera: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="34" width="52" height="18" rx="4" fill="#D2B48C"/><ellipse cx="18" cy="30" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/><ellipse cx="32" cy="28" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/><ellipse cx="46" cy="30" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/><ellipse cx="25" cy="40" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/><ellipse cx="39" cy="40" rx="8" ry="10" fill="#FFF8E7" stroke="#E8D5B7" stroke-width="1"/></svg>`
};

function formatearHora(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const horas = d.getHours(), minutos = d.getMinutes().toString().padStart(2, "0");
    const ampm = horas >= 12 ? "p.m." : "a.m.", hora12 = (horas % 12) || 12;
    return `${hora12}:${minutos} ${ampm}`;
  } catch (e) { return "—"; }
}

function formatearFecha(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
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

function formatearMoneda(n) { return "$" + (Number(n) || 0).toLocaleString("es-MX"); }

function escaparHTML(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function infoEstado(estado) {
  switch (estado) {
    case "PENDIENTE": return { texto: "Pendiente", clase: "etiqueta-pendiente", icono: ICONOS.reloj };
    case "ENTREGADO": return { texto: "Entregado", clase: "etiqueta-entregado", icono: ICONOS.check };
    case "CANCELADO": return { texto: "Cancelado", clase: "etiqueta-cancelado", icono: ICONOS.x };
    case "NO_ENCONTRADO": return { texto: "No encontrado", clase: "etiqueta-noencontrado", icono: ICONOS.alerta };
    default: return { texto: estado || "—", clase: "etiqueta-pendiente", icono: ICONOS.reloj };
  }
}

function abrirUbicacion(p) {
  // CORRECCIÓN AQUÍ: Cambiamos p.municipio por p.ciudad
  const partes = [p.direccion, p.colonia, p.ciudad, "Jalisco", "México"].filter(Boolean).join(", ");
  window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(partes), "_blank");
}

function mostrarPantalla(nombre) {
  window.pantallaActual = nombre;
  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("hidden"));
  const seccion = document.getElementById("pantalla-" + nombre);
  if (seccion) seccion.classList.remove("hidden");

  const config = PANTALLAS[nombre];
  if (config) {
    document.getElementById("header-titulo").textContent = config.titulo;
    document.getElementById("header-subtitulo").textContent = config.subtitulo();
  }
  document.querySelectorAll(".footer-btn").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.nav === nombre);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}