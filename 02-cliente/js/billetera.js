window.movimientosGlobales = [];
window.filtroMovimientoActual = "todos";

// --- SECCIÓN: MOVIMIENTOS ---
async function cargarMovimientos() {
    const contenedor = document.getElementById('lista-billetera');
    contenedor.innerHTML = "<p class='text-center'>Cargando...</p>";
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "historial_saldo", id: window.HB_STATE.clienteId })
      });
      const data = await res.json();
      
      if (data.ok && data.movimientos) {
        window.movimientosGlobales = data.movimientos;
        window.filtroMovimientoActual = "todos";
        renderizarMovimientos();
      } else { contenedor.innerHTML = "<p class='text-center'>No hay movimientos aún.</p>"; }
    } catch (e) { 
        console.error(e);
        contenedor.innerHTML = "<p class='text-center'>Error al cargar.</p>"; 
    }
}

function renderizarMovimientos() {
    const contenedor = document.getElementById('lista-billetera');
    if (!window.movimientosGlobales || window.movimientosGlobales.length === 0) {
        contenedor.innerHTML = "<p class='text-center'>No hay movimientos aún.</p>";
        return;
    }

    let totalVentas = 0, totalReferidos = 0, totalVideos = 0;
    window.movimientosGlobales.forEach(m => {
        if (m.categoria === "venta") totalVentas += m.monto;
        if (m.categoria === "referido") totalReferidos += m.monto;
        if (m.categoria === "video") totalVideos += m.monto;
    });

    const estiloTarjeta = (categoria, bg, text, icon, titulo, total) => {
        const activo = window.filtroMovimientoActual === categoria;
        const borde = activo ? `2px solid ${text}` : '1px solid #ddd';
        const sombra = activo ? 'box-shadow: 0 4px 8px rgba(0,0,0,0.1);' : '';
        return `
            <div onclick="filtrarMovimientos('${categoria}')" style="background: ${bg}; padding: 15px; border-radius: 12px; min-width: 130px; flex-shrink: 0; border: ${borde}; cursor: pointer; transition: all 0.2s; ${sombra}">
                <div style="font-size: 0.75rem; color: ${text}; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">${icon} ${titulo}</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: ${text};">$${total.toFixed(2)}</div>
            </div>
        `;
    };

    let htmlResumen = `
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 15px; margin-bottom: 10px; scrollbar-width: none;">
            ${estiloTarjeta('venta', '#E8F5E9', '#2E7D32', '🛒', 'Ventas', totalVentas)}
            ${estiloTarjeta('referido', '#FFF3E0', '#E65100', '👥', 'Referidos', totalReferidos)}
            ${estiloTarjeta('video', '#E3F2FD', '#0D47A1', '🎬', 'Videos', totalVideos)}
        </div>
    `;

    let listaFiltrada = window.movimientosGlobales;
    if (window.filtroMovimientoActual !== "todos") {
        listaFiltrada = window.movimientosGlobales.filter(m => m.categoria === window.filtroMovimientoActual);
    }

    let htmlMovs = "";
    if (listaFiltrada.length > 0) {
        listaFiltrada.forEach(m => {
            let icono = "💸";
            if (m.categoria === "venta") icono = "🛒";
            else if (m.categoria === "referido") icono = "👥";
            else if (m.categoria === "video") icono = "🎬";
            else if (m.categoria === "bienvenida") icono = "🎁";
            else if (m.categoria === "compra") icono = "🥚";

            const colorMonto = m.tipo === 'ingreso' ? '#0E5C3F' : '#C62828';
            const signo = m.tipo === 'ingreso' ? '+' : '-';
            
            const dateObj = new Date(m.fecha);
            const fechaStr = isNaN(dateObj) ? m.fecha : dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

            htmlMovs += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 1.2rem; background: #F3F4F6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${icono}</div>
                        <div>
                            <div style="font-weight: 700; color: #1F2937; font-size: 0.9rem;">${m.concepto}</div>
                            <div style="font-size: 0.8rem; color: #6B7280;">${m.detalle || ''} <span style="opacity:0.5;">•</span> ${fechaStr}</div>
                        </div>
                    </div>
                    <div style="font-weight: 800; color: ${colorMonto}; font-size: 1.1rem;">${signo}$${m.monto.toFixed(2)}</div>
                </div>
            `;
        });
    } else {
        htmlMovs = "<p class='text-center' style='color:#666; margin-top:20px;'>No hay movimientos en esta categoría.</p>";
    }

    contenedor.innerHTML = htmlResumen + htmlMovs;
}

window.filtrarMovimientos = function(categoria) {
    if (window.filtroMovimientoActual === categoria) {
        window.filtroMovimientoActual = "todos";
    } else {
        window.filtroMovimientoActual = categoria;
    }
    renderizarMovimientos();
}

// --- SECCIÓN: RETIROS ---
async function cargarRetiros() {
    const contenedor = document.getElementById('lista-retiros');
    contenedor.innerHTML = "<p class='text-center'>Cargando...</p>";
    
    if (window.HB_STATE.permiteRetiro) {
        document.getElementById('seccion-retiro').classList.remove('hidden');
        document.getElementById('msg-no-retiro').classList.add('hidden');
    } else {
        document.getElementById('seccion-retiro').classList.add('hidden');
        document.getElementById('msg-no-retiro').classList.remove('hidden');
    }

    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "historial_retiros", id: window.HB_STATE.clienteId })
      });
      const data = await res.json();
      if (data.ok && data.retiros.length > 0) {
        contenedor.innerHTML = "";
        data.retiros.forEach(r => {
          const colorEstado = r.estado === 'PENDIENTE' ? '#856404' : '#0E5C3F';
          const bgEstado = r.estado === 'PENDIENTE' ? '#FFF3CD' : '#D4EDDA';
          
          contenedor.innerHTML += `
            <div class="movimiento" style="display:flex; justify-content:space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                    <span class="concepto" style="font-weight:bold; display:block;">Retiro solicitado</span>
                    <span class="fecha" style="font-size:0.8rem; color:#888;">${r.fecha}</span>
                </div>
                <div style="text-align: right;">
                    <div class="monto" style="font-weight:bold;">$${r.monto.toFixed(2)}</div>
                    <span style="font-size:0.7rem; font-weight:bold; background:${bgEstado}; color:${colorEstado}; padding:2px 6px; border-radius:4px;">${r.estado}</span>
                </div>
            </div>`;
        });
      } else { contenedor.innerHTML = "<p class='text-center'>Aún no has solicitado retiros.</p>"; }
    } catch (e) { contenedor.innerHTML = "<p class='text-center'>Error al cargar.</p>"; }
}

// --- SECCIÓN: COMPRAS ---
async function cargarComprasBilletera() {
    const contenedor = document.getElementById('lista-pedidos-billetera');
    contenedor.innerHTML = "<p class='text-center'>Cargando compras...</p>";
    try {
      const id = window.HB_STATE.clienteId;
      const tel = window.HB_STATE.telefono;
      
      const res = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: "mis_pedidos", id: id || "", tel: tel || "" })
      });
      const data = await res.json();
      
      if (data.ok && data.pedidos.length > 0) {
        contenedor.innerHTML = "";
        data.pedidos.forEach(p => {
          let prodTxt = [];
          if (p.carteras > 0) prodTxt.push(`${p.carteras} Cartera(s)`);
          if (p.cajas > 0) prodTxt.push(`${p.cajas} Caja(s)`);
          if (p.despensas > 0) prodTxt.push(`${p.despensas} Despensa(s)`);
          let productosFinal = prodTxt.join(' + ');
          
          let estadoTexto = "";
          let colorEstado = "";
          if (p.estado === 'PAGADO_SALDO') { estadoTexto = 'PAGADO CON SALDO'; colorEstado = '#0E5C3F'; } 
          else if (p.estado === 'ENTREGADO') { estadoTexto = 'ENTREGADO'; colorEstado = '#0E5C3F'; } 
          else if (p.estado === 'CANCELADO') { estadoTexto = 'CANCELADO'; colorEstado = '#C62828'; } 
          else { estadoTexto = 'PENDIENTE EFECTIVO'; colorEstado = '#F39C12'; }
          
          contenedor.innerHTML += `
            <div class="pedido-card" style="background:#fff; padding:15px; border-radius:12px; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <div class="pedido-header" style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.8rem; color:#666;">
                    <span>${p.fecha}</span>
                    <span style="color:${colorEstado}; font-weight:800;">${estadoTexto}</span>
                </div>
                <div><strong>${p.cliente}</strong></div>
                <div style="font-size:0.9rem; color:#666;">${productosFinal}</div>
                <div class="pedido-total" style="text-align:right; margin-top:5px; font-weight:bold; color:#0E5C3F;">$${p.total.toFixed(2)}</div>
            </div>`;
        });
      } else if (data.ok && (!data.pedidos || data.pedidos.length === 0)) { 
          contenedor.innerHTML = "<p class='text-center'>No tienes compras registradas.</p>"; 
      } else {
          console.error("Error del backend:", data);
          contenedor.innerHTML = `<p class='text-center' style='color:red;'>Error: ${data.error || 'No se pudo cargar.'}</p>`; 
      }
    } catch (e) { 
        console.error(e);
        contenedor.innerHTML = "<p class='text-center'>Error al cargar.</p>"; 
    }
}

// --- SECCIÓN: REFERIDOS ---
async function cargarReferidos() {
    const contenedor = document.getElementById('lista-referidos');
    contenedor.innerHTML = "<p class='text-center'>Cargando referidos...</p>";
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "obtener_referidos", id: window.HB_STATE.clienteId })
      });
      const data = await res.json();
      
      if (data.ok) {
        if (data.referidos.length > 0) {
          const montoBono = data.bonoReferido || 10;
          contenedor.innerHTML = `
            <div style="text-align:center; margin-bottom: 15px; font-weight: bold; color: #0E5C3F; font-size: 1.1rem;">
              Has invitado a ${data.total} persona(s) 🎉
            </div>`;
          data.referidos.forEach(r => {
            const fecha = new Date(r.fecha).toLocaleDateString();
            contenedor.innerHTML += `
              <div class="movimiento" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                  <div>
                      <span class="concepto" style="font-weight:bold; display:block;">${r.nombre}</span>
                      <span class="fecha" style="display:block; font-size:0.8rem; color:#888;">Se unió el ${fecha}</span>
                  </div>
                  <div style="color: #25D366; font-weight: bold;">+ $${montoBono.toFixed(2)}</div>
              </div>`;
          });
        } else {
          contenedor.innerHTML = "<p class='text-center'>Aún no has invitado a nadie. ¡Comparte tu link!</p>";
        }
      } else { contenedor.innerHTML = "<p class='text-center'>Error al cargar.</p>"; }
    } catch (e) { contenedor.innerHTML = "<p class='text-center'>Error de conexión.</p>"; }
}

// --- INICIALIZACIÓN DE PESTAÑAS DE LA BILLETERA ---
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-billetera');
    if (tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.style.background = '#eee'; t.style.color = '#333'; });
            document.querySelectorAll('#screen-billetera > div[id^="contenedor-"]').forEach(c => c.classList.add('hidden'));
            
            tab.style.background = '#F39C12'; 
            tab.style.color = '#fff';
            
            if (tab.id === 'tab-movimientos') {
                document.getElementById('contenedor-movimientos').classList.remove('hidden');
                cargarMovimientos();
            } else if (tab.id === 'tab-retiros') {
                document.getElementById('contenedor-retiros').classList.remove('hidden');
                cargarRetiros();
            } else if (tab.id === 'tab-compras') {
                document.getElementById('contenedor-compras').classList.remove('hidden');
                cargarComprasBilletera();
            } else if (tab.id === 'tab-referidos') {
                document.getElementById('contenedor-referidos').classList.remove('hidden');
                cargarReferidos();
            }
        });
    });

    document.getElementById('btn-solicitar-retiro').addEventListener('click', async () => {
        if (!confirm("¿Estás seguro de solicitar tu retiro? Se transferirá a tu cuenta bancaria.")) return;
        const btn = document.getElementById('btn-solicitar-retiro'); 
        btn.innerText = "Procesando..."; btn.disabled = true;
        try {
          const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "solicitar_retiro", id: window.HB_STATE.clienteId })
          });
          const data = await res.json();
          if (data.ok) {
            alert(data.mensaje);
            window.HB_STATE.saldoActual = 0;
            localStorage.setItem('hb_cliente_saldo', 0);
            actualizarUI();
            cargarRetiros(); 
          } else { alert(data.error); }
        } catch (e) { alert("Error de conexión"); }
        finally { btn.innerText = "Solicitar Retiro"; btn.disabled = false; }
    });
});