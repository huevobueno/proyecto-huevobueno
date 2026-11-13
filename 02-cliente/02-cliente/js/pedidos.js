let cantCarteras = 1;
let cantCajas = 0;
let precioCartera = 85; 
let precioCaja = 650;
let isSubmitting = false; 

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resConfig = await fetch(`${CONFIG.API_URL}?action=config_publica`);
        const dataConfig = await resConfig.json();
        if (dataConfig.ok && dataConfig.config) {
            precioCartera = Number(dataConfig.config.Precio_Cartera);
            precioCaja = Number(dataConfig.config.Precio_Caja);
            
            if(document.getElementById('lbl-precio-cartera')) document.getElementById('lbl-precio-cartera').innerText = `$${precioCartera.toFixed(2)}`;
            if(document.getElementById('lbl-precio-caja')) document.getElementById('lbl-precio-caja').innerText = `$${precioCaja.toFixed(2)}`;
            
            actualizarTotalPedido();
        }
    } catch (e) { console.error("Error cargando precios:", e); }

    document.getElementById('btn-menos-carteras').addEventListener('click', () => cambiarCantidad('carteras', -1));
    document.getElementById('btn-mas-carteras').addEventListener('click', () => cambiarCantidad('carteras', 1));
    document.getElementById('btn-menos-cajas').addEventListener('click', () => cambiarCantidad('cajas', -1));
    document.getElementById('btn-mas-cajas').addEventListener('click', () => cambiarCantidad('cajas', 1));

    const btnIrPerfil = document.getElementById('btn-ir-perfil-desde-pedidos');
    if (btnIrPerfil) {
        btnIrPerfil.addEventListener('click', () => {
            document.querySelector('.nav-btn[data-target="screen-perfil"]').click();
        });
    }

    const btnPedir = document.getElementById('btn-pedir-huevo');
    if (btnPedir) {
        btnPedir.addEventListener('click', () => {
            document.querySelector('.nav-btn[data-target="screen-pedidos"]').click();
        });
    }

    document.getElementById('btn-pagar-efectivo').addEventListener('click', async () => {
        if (isSubmitting) return;
        if (cantCarteras === 0 && cantCajas === 0) return alert("Selecciona un producto.");
        
        const idClienteActual = window.HB_STATE.clienteId || localStorage.getItem('hb_cliente_id');
        if (!idClienteActual) return alert("Hubo un problema con tu sesión. Cierra sesión y vuelve a entrar.");

        isSubmitting = true;
        const btn = document.getElementById('btn-pagar-efectivo'); 
        btn.innerText = "Enviando..."; 
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.pointerEvents = "none";
        
        const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
        
        try {
          const url = `${CONFIG.API_URL}?action=crear_pedido_landing&idCliente=${idClienteActual}&cantCarteras=${cantCarteras}&cantCajas=${cantCajas}&total=${total}`;
          const res = await fetch(url); 
          const data = await res.json();
          
          if (data.ok) {
            alert("¡Pedido confirmado! Pagarás en efectivo al recibir.");
            cantCarteras = 1; cantCajas = 0; 
            document.getElementById('cant-carteras').value = 1; 
            document.getElementById('cant-cajas').value = 0;
            actualizarTotalPedido(); 
            cargarPedidos();
            document.querySelector('.nav-btn[data-target="screen-inicio"]').click();
          } else { alert("Error: " + data.error); }
        } catch (e) { 
            alert("Error de conexión al procesar el pedido."); 
        } finally { 
            isSubmitting = false;
            btn.innerText = "Pagar en efectivo al recibir"; 
            btn.disabled = false; 
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        }
    });

    document.getElementById('btn-pagar-saldo').addEventListener('click', async () => {
        if (isSubmitting) return;
        if (!confirm("¿Usar tu saldo para pagar este pedido?")) return;
        
        const idClienteActual = window.HB_STATE.clienteId || localStorage.getItem('hb_cliente_id');
        isSubmitting = true;
        const btn = document.getElementById('btn-pagar-saldo'); 
        btn.innerText = "Procesando..."; 
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.pointerEvents = "none";
        
        const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
        
        try {
          const url = `${CONFIG.API_URL}?action=crear_pedido_con_saldo&id=${idClienteActual}&carteras=${cantCarteras}&cajas=${cantCajas}&total=${total}`;
          const res = await fetch(url); 
          const data = await res.json();
          
          if (data.ok) {
            alert("¡Pedido pagado con tu saldo exitosamente!");
            window.HB_STATE.saldoActual = data.nuevoSaldo; 
            localStorage.setItem('hb_cliente_saldo', window.HB_STATE.saldoActual);
            actualizarUI(); 
            cantCarteras = 1; cantCajas = 0; 
            document.getElementById('cant-carteras').value = 1; 
            document.getElementById('cant-cajas').value = 0;
            actualizarTotalPedido(); 
            cargarPedidos();
            document.querySelector('.nav-btn[data-target="screen-inicio"]').click();
          } else { alert("Error: " + data.error); }
        } catch (e) { 
            alert("Error de conexión al procesar el pedido."); 
        } finally { 
            isSubmitting = false;
            btn.innerText = "Pagar con mi Saldo ($0)"; 
            btn.disabled = false; 
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        }
    });
});

function cambiarCantidad(tipo, cambio) {
    if (tipo === 'carteras') {
        cantCarteras = Math.max(0, cantCarteras + cambio);
        document.getElementById('cant-carteras').value = cantCarteras;
    } else if (tipo === 'cajas') {
        cantCajas = Math.max(0, cantCajas + cambio);
        document.getElementById('cant-cajas').value = cantCajas;
    }
    actualizarTotalPedido();
}

function actualizarTotalPedido() {
    const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
    const totalEl = document.getElementById('pedido-total');
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-MX')}.00`;
    
    const btnEfectivo = document.getElementById('btn-pagar-efectivo');
    const btnSaldo = document.getElementById('btn-pagar-saldo');
    const msgFaltante = document.getElementById('msg-saldo-faltante');
    
    if (total === 0) { 
        if(btnEfectivo) btnEfectivo.disabled = true; 
        if(btnSaldo) btnSaldo.classList.add('hidden'); 
        if(msgFaltante) msgFaltante.classList.add('hidden'); 
        return; 
    }
    if(btnEfectivo) btnEfectivo.disabled = false;
    
    if (window.HB_STATE.saldoActual >= total) { 
        if(btnSaldo) btnSaldo.classList.remove('hidden'); 
        if(msgFaltante) msgFaltante.classList.add('hidden'); 
    } else { 
        if(btnSaldo) btnSaldo.classList.add('hidden'); 
        if(msgFaltante) {
            msgFaltante.classList.remove('hidden'); 
            msgFaltante.textContent = `Te faltan $${(total - window.HB_STATE.saldoActual).toFixed(2)} para pagar con saldo.`; 
        }
    }
}

async function cargarPedidos() {
    const contenedor = document.getElementById('lista-pedidos');
    if (!contenedor) return;
    
    // Mostrar cargando
    contenedor.innerHTML = "<p class='text-center'>Cargando pedidos...</p>";
    
    try {
        const id = window.HB_STATE.clienteId;
        const tel = window.HB_STATE.telefono;
        
        if (!id && !tel) {
            contenedor.innerHTML = "<p class='text-center'>Error: Sesión no válida. Cierra sesión y vuelve a entrar.</p>";
            return;
        }

        const res = await fetch(`${CONFIG.API_URL}?action=mis_pedidos&id=${id || ''}&tel=${tel || ''}`);
        const data = await res.json();
        
        if (data.ok && data.pedidos && data.pedidos.length > 0) {
            contenedor.innerHTML = "";
            data.pedidos.forEach(p => {
              const fecha = p.fecha; // Ya viene formateada del backend
              let prodTxt = [];
              if (p.carteras > 0) prodTxt.push(`${p.carteras} Cartera(s)`);
              if (p.cajas > 0) prodTxt.push(`${p.cajas} Caja(s)`);
              let productosFinal = prodTxt.join(' + ');
              let estadoTexto = p.estado === 'PAGADO_SALDO' ? 'PAGADO CON SALDO' : 'PENDIENTE EFECTIVO';
              let colorEstado = p.estado === 'PAGADO_SALDO' ? '#0E5C3F' : '#F39C12';
              
              contenedor.innerHTML += `
                <div class="pedido-card">
                    <div class="pedido-header">
                        <span>${fecha}</span>
                        <span style="color:${colorEstado}; font-weight:800;">${estadoTexto}</span>
                    </div>
                    <div><strong>${p.cliente}</strong></div>
                    <div style="font-size:0.9rem; color:#666;">${productosFinal}</div>
                    <div class="pedido-total" style="text-align:right; margin-top:5px;">$${p.total.toFixed(2)}</div>
                </div>`;
            });
        } else { 
            contenedor.innerHTML = "<p class='text-center'>Aún no tienes pedidos registrados.</p>"; 
        }
    } catch (e) { 
        console.error(e);
        contenedor.innerHTML = "<p class='text-center'>Error de conexión al cargar pedidos.</p>"; 
    }
}