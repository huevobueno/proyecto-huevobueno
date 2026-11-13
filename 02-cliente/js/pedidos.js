async function cargarPerfilReal() {
    try {
      const res = await fetch(`${CONFIG.API_URL}?action=obtener_perfil_cliente&id=${window.HB_STATE.clienteId}`);
      const data = await res.json();

      if (data.ok) {
        document.getElementById('perfil-nombre').textContent = data.nombre || "-";
        document.getElementById('perfil-tel').textContent = data.tel || "-";
        document.getElementById('perfil-ciudad').textContent = data.ciudad || "-";
        document.getElementById('perfil-colonia').textContent = data.colonia || "-";
        document.getElementById('perfil-direccion').textContent = data.direccion || "-";
        if(data.correo) document.getElementById('perfil-correo').value = data.correo;
        
        localStorage.setItem('hb_cliente_ciudad', data.ciudad || "");
        localStorage.setItem('hb_cliente_colonia', data.colonia || "");
        localStorage.setItem('hb_cliente_direccion', data.direccion || "");

        if (data.saldo !== undefined) {
            window.HB_STATE.saldoActual = Number(data.saldo);
            localStorage.setItem('hb_cliente_saldo', window.HB_STATE.saldoActual);
            actualizarUI();
        }

        window.HB_STATE.tienePassword = data.tienePassword || false;
        localStorage.setItem('hb_cliente_tiene_pass', window.HB_STATE.tienePassword);
        window.HB_STATE.permiteRetiro = data.permiteRetiro || false;
        localStorage.setItem('hb_permite_retiro', window.HB_STATE.permiteRetiro);
        
        const banner = document.getElementById('banner-direccion');
        if (!data.colonia || !data.direccion) banner.classList.remove('hidden');
        else banner.classList.add('hidden');
      }
    } catch (e) { console.log("Error al cargar perfil", e); }
}

async function cargarMovimientos() {
    const contenedor = document.getElementById('lista-billetera');
    contenedor.innerHTML = "<p class='text-center'>Cargando...</p>";
    try {
      const res = await fetch(`${CONFIG.API_URL}?action=historial_saldo&id=${window.HB_STATE.clienteId}`);
      const data = await res.json();
      
      if (data.ok && data.movimientos) {
        const resumen = data.resumen || { ventas: 0, referidos: 0, videos: 0 };
        
        // --- 1. CONSTRUIR LAS TARJETAS DE RESUMEN ---
        let htmlResumen = `
          <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 15px; margin-bottom: 10px; scrollbar-width: none;">
              <div style="background: #E8F5E9; padding: 15px; border-radius: 12px; min-width: 130px; flex-shrink: 0; border: 1px solid #C8E6C9;">
                  <div style="font-size: 0.75rem; color: #2E7D32; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">🛒 Ventas</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: #1B5E20;">$${resumen.ventas.toFixed(2)}</div>
              </div>
              <div style="background: #FFF3E0; padding: 15px; border-radius: 12px; min-width: 130px; flex-shrink: 0; border: 1px solid #FFE0B2;">
                  <div style="font-size: 0.75rem; color: #E65100; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">👥 Referidos</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: #BF360C;">$${resumen.referidos.toFixed(2)}</div>
              </div>
              <div style="background: #E3F2FD; padding: 15px; border-radius: 12px; min-width: 130px; flex-shrink: 0; border: 1px solid #BBDEFB;">
                  <div style="font-size: 0.75rem; color: #0D47A1; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">🎬 Videos</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: #1A237E;">$${resumen.videos.toFixed(2)}</div>
              </div>
          </div>
        `;

        // --- 2. CONSTRUIR LA LISTA DETALLADA ---
        let htmlMovs = "";
        if (data.movimientos.length > 0) {
            data.movimientos.forEach(m => {
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
            htmlMovs = "<p class='text-center' style='color:#666; margin-top:20px;'>Aún no tienes movimientos registrados.</p>";
        }

        contenedor.innerHTML = htmlResumen + htmlMovs;
      } else { contenedor.innerHTML = "<p class='text-center'>No hay movimientos aún.</p>"; }
    } catch (e) { 
        console.error(e);
        contenedor.innerHTML = "<p class='text-center'>Error al cargar.</p>"; 
    }
}

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
      const res = await fetch(`${CONFIG.API_URL}?action=historial_retiros&id=${window.HB_STATE.clienteId}`);
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

async function cargarComprasBilletera() {
    const contenedor = document.getElementById('lista-pedidos-billetera');
    try {
      const id = window.HB_STATE.clienteId;
      const tel = window.HB_STATE.telefono;
      const res = await fetch(`${CONFIG.API_URL}?action=mis_pedidos&id=${id}&tel=${tel}`);
      const data = await res.json();
      if (data.ok && data.pedidos.length > 0) {
        contenedor.innerHTML = "";
        data.pedidos.forEach(p => {
          const fecha = new Date(p.fecha).toLocaleDateString();
          let prodTxt = [];
          if (p.carteras > 0) prodTxt.push(`${p.carteras} Cartera(s)`);
          if (p.cajas > 0) prodTxt.push(`${p.cajas} Caja(s)`);
          let productosFinal = prodTxt.join(' + ');
          let estadoTexto = p.estado === 'PAGADO_SALDO' ? 'PAGADO CON SALDO' : 'PENDIENTE EFECTIVO';
          let colorEstado = p.estado === 'PAGADO_SALDO' ? '#0E5C3F' : '#F39C12';
          
          contenedor.innerHTML += `
            <div class="pedido-card" style="background:#fff; padding:15px; border-radius:12px; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <div class="pedido-header" style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.8rem; color:#666;">
                    <span>${fecha}</span>
                    <span style="color:${colorEstado}; font-weight:800;">${estadoTexto}</span>
                </div>
                <div><strong>${p.cliente}</strong></div>
                <div style="font-size:0.9rem; color:#666;">${productosFinal}</div>
                <div class="pedido-total" style="text-align:right; margin-top:5px; font-weight:bold; color:#0E5C3F;">$${p.total.toFixed(2)}</div>
            </div>`;
        });
      } else { contenedor.innerHTML = "<p class='text-center'>No tienes compras registradas.</p>"; }
    } catch (e) { contenedor.innerHTML = "<p class='text-center'>Error al cargar.</p>"; }
}

async function cargarReferidos() {
    const contenedor = document.getElementById('lista-referidos');
    contenedor.innerHTML = "<p class='text-center'>Cargando referidos...</p>";
    try {
      const res = await fetch(`${CONFIG.API_URL}?action=obtener_referidos&id=${window.HB_STATE.clienteId}`);
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

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-billetera');
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

    document.getElementById('btn-guardar-perfil').addEventListener('click', async () => {
        const correo = document.getElementById('perfil-correo').value.trim();
        const pass = document.getElementById('perfil-password').value.trim();
        if (!correo || !pass) return alert("Llena ambos campos.");
        const btn = document.getElementById('btn-guardar-perfil');
        btn.innerText = "Guardando..."; btn.disabled = true;
        try {
          const res = await fetch(`${CONFIG.API_URL}?action=actualizar_credenciales_cliente&id=${window.HB_STATE.clienteId}&correo=${encodeURIComponent(correo)}&password=${encodeURIComponent(pass)}`);
          const data = await res.json();
          if (data.ok) { 
            alert("¡Datos guardados de forma segura! Ahora puedes cerrar sesión e iniciar con tu correo."); 
            window.HB_STATE.tienePassword = true;
            localStorage.setItem('hb_cliente_tiene_pass', 'true');
            document.getElementById('perfil-password').value = ''; 
            cargarPerfilReal(); 
          }
          else { alert(data.error); }
        } catch (e) { alert("Error de conexión"); }
        finally { btn.innerText = "Guardar Correo y Contraseña"; btn.disabled = false; }
    });

    document.getElementById('btn-guardar-banco').addEventListener('click', async () => {
        const clabe = document.getElementById('perfil-clabe').value.trim();
        const banco = document.getElementById('perfil-banco').value.trim();
        const titular = document.getElementById('perfil-titular').value.trim();
        if (!clabe || !banco || !titular) return alert("Llena todos los datos bancarios.");
        const btn = document.getElementById('btn-guardar-banco');
        btn.innerText = "Guardando..."; btn.disabled = true;
        try {
          const res = await fetch(`${CONFIG.API_URL}?action=actualizar_datos_bancarios&id=${window.HB_STATE.clienteId}&clabe=${encodeURIComponent(clabe)}&banco=${encodeURIComponent(banco)}&titular=${encodeURIComponent(titular)}`);
          const data = await res.json();
          if (data.ok) { alert("¡Datos bancarios guardados!"); }
          else { alert(data.error); }
        } catch (e) { alert("Error de conexión"); }
        finally { btn.innerText = "Guardar Datos Bancarios"; btn.disabled = false; }
    });

    document.querySelectorAll('.btn-compartir').forEach(btn => {
        btn.addEventListener('click', () => {
          const inputId = btn.getAttribute('data-link');
          const mensajeBase = btn.getAttribute('data-msg');
          const link = document.getElementById(inputId).value;
          const texto = mensajeBase + link;
          window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        });
    });

    document.getElementById('btn-solicitar-retiro').addEventListener('click', async () => {
        if (!confirm("¿Estás seguro de solicitar tu retiro? Se transferirá a tu cuenta bancaria.")) return;
        const btn = document.getElementById('btn-solicitar-retiro'); 
        btn.innerText = "Procesando..."; btn.disabled = true;
        try {
          const res = await fetch(`${CONFIG.API_URL}?action=solicitar_retiro&id=${window.HB_STATE.clienteId}`);
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

    document.getElementById('menu-logout').addEventListener('click', () => { 
        if(!window.HB_STATE.tienePassword) {
          alert("⚠️ ATENCIÓN: Para poder volver a entrar en el futuro, primero debes crear tu correo y contraseña en esta sección.");
          document.querySelector('.nav-btn[data-target="screen-perfil"]').click();
          cerrarMenu();
          return;
        }
        if(confirm("¿Cerrar sesión?")) { localStorage.clear(); window.location.href = window.location.pathname; } 
    });
    document.getElementById('menu-soporte').addEventListener('click', () => { window.open(`https://wa.me/523325110628?text=Hola,%20necesito%20ayuda`, '_blank'); });
});
