document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refAfiliado = urlParams.get('ref') || 'DIRECTO';
  
  let precioCartera = 75;
  let precioCaja = 650;
  let cantCarteras = 1; 
  let cantCajas = 0;
  let enviandoPedido = false; 

  const btnSubmit = document.getElementById('btn-submit');
  const formPedido = document.getElementById('pedido-form');

  // Cargar precios dinámicos (Ahora con URLSearchParams para evitar CORS)
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: new URLSearchParams({ action: "config_publica" })
    });
    const data = await res.json();
    
    if (data.ok && data.config) {
      precioCartera = Number(data.config.Precio_Cartera) || precioCartera;
      precioCaja = Number(data.config.Precio_Caja) || precioCaja;
      
      if(document.getElementById('lbl-precio-cartera')) document.getElementById('lbl-precio-cartera').innerText = `$${precioCartera.toFixed(2)}`;
      if(document.getElementById('lbl-precio-caja')) document.getElementById('lbl-precio-caja').innerText = `$${precioCaja.toFixed(2)}`;
      if(document.getElementById('heroPrice')) document.getElementById('heroPrice').innerText = `$${precioCartera.toFixed(0)}`;
      
      actualizarTotal();
    }
  } catch (e) { console.error("Error cargando precios:", e); }

  window.cambiarCantidad = (tipo, cambio) => {
    if (tipo === 'carteras') {
      cantCarteras = Math.max(0, cantCarteras + cambio);
      document.getElementById('cant-carteras').value = cantCarteras;
      const card = document.getElementById('card-carteras');
      if (cantCarteras > 0) card.classList.add('activo'); else card.classList.remove('activo');
    } else if (tipo === 'cajas') {
      cantCajas = Math.max(0, cantCajas + cambio);
      document.getElementById('cant-cajas').value = cantCajas;
      const card = document.getElementById('card-cajas');
      if (cantCajas > 0) card.classList.add('activo'); else card.classList.remove('activo');
    }
    actualizarTotal();
  };

  function actualizarTotal() {
    const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
    if(document.getElementById('total-display')) {
        document.getElementById('total-display').textContent = `$${total.toFixed(2)}`;
    }
  }

  if (formPedido) {
    formPedido.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enviandoPedido) return;
      if (cantCarteras === 0 && cantCajas === 0) return alert("Selecciona al menos un producto.");

      enviandoPedido = true;
      const btnTextoOriginal = btnSubmit.innerHTML;
      
      btnSubmit.textContent = "Enviando WhatsApp...";
      btnSubmit.disabled = true;

      const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
      const ciudad = "Sayula"; 
      const diaEntrega = "Jueves"; 
      const campana = "Sayula";
      
      const colonia = document.getElementById('colonia').value.trim();
      const direccion = document.getElementById('direccion').value.trim();
      const nombre = document.getElementById('nombre').value.trim();
      const tel = document.getElementById('tel').value.trim();

      // Enviamos con URLSearchParams en lugar de JSON
      const payload = new URLSearchParams({
        action: "enviar_confirmacion_whatsapp", 
        ciudad: ciudad,
        diaEntrega: diaEntrega,
        nombre: nombre,
        tel: tel,
        colonia: colonia,
        direccion: direccion,
        cantCarteras: cantCarteras,
        cantCajas: cantCajas,
        total: total,
        ref: refAfiliado,
        campana: campana
      });

      try {
        const res = await fetch(CONFIG.API_URL, {
          method: 'POST',
          body: payload
        });
        
        const data = await res.json();

        if (data.ok) {
            formPedido.style.display = 'none';
            const exitoDiv = document.createElement('div');
            exitoDiv.style.padding = '40px 20px';
            exitoDiv.style.textAlign = 'center';
            exitoDiv.style.backgroundColor = '#F0FAF4';
            exitoDiv.style.borderRadius = '16px';
            exitoDiv.style.border = '2px solid #0E5C3F';
            exitoDiv.innerHTML = `
                <h2 style="color: #0E5C3F; margin-bottom: 15px;">¡Ya casi terminamos!</h2>
                <p style="font-size: 1.2rem; color: #333; margin-bottom: 10px;">Hemos enviado un mensaje a tu WhatsApp.</p>
                <p style="font-size: 1rem; color: #666;">Por favor, abre tu WhatsApp y presiona el botón <strong>"Confirmar Pedido"</strong> para completar tu orden.</p>
            `;
            formPedido.parentNode.appendChild(exitoDiv);
        } else {
          alert("Error del servidor: " + (data.error || "No se pudo procesar el pedido."));
          btnSubmit.innerHTML = btnTextoOriginal;
          btnSubmit.disabled = false;
          enviandoPedido = false;
        }
      } catch (err) {
        console.error(err);
        alert("Error de conexión. Revisa tu internet.");
        btnSubmit.innerHTML = btnTextoOriginal;
        btnSubmit.disabled = false;
        enviandoPedido = false;
      }
    });
  }
});