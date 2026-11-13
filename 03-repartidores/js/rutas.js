/**
 * ============================================================================
 * RUTAS - Lógica de la pantalla de rutas
 * ============================================================================
 */

window.filtroRutas = "";

function renderizarRutas() {
  const listaRutas = document.getElementById("lista-rutas");
  const colonias = window.sesionActual.colonias || [];
  const filtro = window.filtroRutas.toLowerCase().trim();

  // CORRECCIÓN: Buscamos en c.ciudad en lugar de c.municipio
  const filtradas = !filtro ? colonias : colonias.filter(c => (c.colonia || "").toLowerCase().includes(filtro) || (c.ciudad || "").toLowerCase().includes(filtro));

  if (!filtradas.length) { listaRutas.innerHTML = `<p class="vacio">No se encontraron colonias.</p>`; return; }

  listaRutas.innerHTML = filtradas.map(c => `
    <div class="ruta-card">
      <div class="ruta-card-icono"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></div>
      <div class="ruta-card-info">
        <div class="ruta-card-nombre">${c.colonia || "—"}</div>
        <!-- CORRECCIÓN: Pintamos c.ciudad en lugar de c.municipio -->
        <div class="ruta-card-municipio">${c.ciudad || "—"}${c.codigoPostal ? " · CP " + c.codigoPostal : ""}</div>
        <div class="ruta-card-footer"><span class="ruta-card-dia">${c.diaEntrega || "Sin día"}</span><span class="ruta-card-precios">⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</span></div>
      </div>
    </div>
  `).join("");
}

async function refrescarRutas() {
  if (!window.sesionActual) return;
  const listaRutas = document.getElementById("lista-rutas");
  listaRutas.innerHTML = `<p class="cargando">Cargando rutas...</p>`;

  try {
    const r = await API.misRutas(window.sesionActual.correo);
    if (r.ok && r.colonias) {
      window.sesionActual.colonias = r.colonias;
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(window.sesionActual));
    }
  } catch (error) { console.error(error); }

  document.getElementById("header-subtitulo").textContent = PANTALLAS.rutas.subtitulo();
  window.filtroRutas = ""; document.getElementById("input-busqueda-rutas").value = "";
  renderizarRutas();
}

if (document.getElementById("input-busqueda-rutas")) {
  document.getElementById("input-busqueda-rutas").addEventListener("input", (e) => { window.filtroRutas = e.target.value; renderizarRutas(); });
}