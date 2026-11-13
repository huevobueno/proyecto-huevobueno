document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refAfiliado = urlParams.get('ref') || 'DIRECTO';
  
  let precioCartera = 85;
  let precioCaja = 850;
  let cantCarteras = 1; 
  let cantCajas = 0;
  let enviandoPedido = false; 

  const btnSubmit = document.getElementById('btn-submit');
  const formPedido = document.getElementById('pedido-form');

  // Cargar precios dinámicos desde Google Sheets (Super Admin)
  try {
    const res = await fetch(`${CONFIG.API_URL}?action=config_publica`);
    const data = await res.json();
    if (data.ok && data.config) {
      precioCartera = Number(data.config.Precio_Cartera) || precioCartera;
      precioCaja = Number(data.config.Precio_Caja) || precioCaja;
      
      // Actualizamos los precios en la pantalla
      document.getElementById('lbl-precio-cartera').innerText = `$${precioCartera.toFixed(2)}`;
      document.getElementById('lbl-precio-caja').innerText = `$${precioCaja.toFixed(2)}`;
      document.getElementById('heroPrice').innerText = `$${precioCartera.toFixed(0)}`;
      
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
    document.getElementById('total-display').textContent = `$${total.toFixed(2)}`;
  }

  if (formPedido) {
    formPedido.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enviandoPedido) return;
      if (cantCarteras === 0 && cantCajas === 0) return alert("Selecciona al menos un producto.");

      enviandoPedido = true;
      const btnTextoOriginal = btnSubmit.innerHTML;
      
      btnSubmit.textContent = "Enviando pedido...";
      btnSubmit.disabled = true;

      const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
      
      // FORZADO PARA ZACOALCO
      const ciudad = "Zacoalco"; 
      const diaEntrega = "Lunes"; 
      
      const colonia = document.getElementById('colonia').value.trim();
      const direccion = document.getElementById('direccion').value.trim();
      const nombre = document.getElementById('nombre').value.trim();
      const tel = document.getElementById('tel').value.trim();

      const payload = {
        action: "crear_pedido_landing",
        ciudad: ciudad,
        diaEntrega: diaEntrega,
        nombre: nombre,
        tel: tel,
        colonia: colonia,
        direccion: direccion,
        cantCarteras: cantCarteras,
        cantCajas: cantCajas,
        total: total,
        ref: refAfiliado
      };

      try {
        const res = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        if (data.ok) {
          const params = new URLSearchParams({
            folio: data.idPedido,
            total: total,
            tel: payload.tel,
            nombre: payload.nombre,
            ciudad: payload.ciudad,
            colonia: payload.colonia,
            direccion: payload.direccion,
            diaEntrega: diaEntrega,
            ref: refAfiliado
          }).toString();
          
          window.location.href = `../gracias.html?${params}`;
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