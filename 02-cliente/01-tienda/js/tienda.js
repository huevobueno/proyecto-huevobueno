document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refAfiliado = urlParams.get('ref') || 'DIRECTO';
  
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let precioCartera = CONFIG.PRECIO_CARTERA_DEFAULT || 85;
  let precioCaja = CONFIG.PRECIO_CAJA_DEFAULT || 650;
  let cantCarteras = 1; 
  let cantCajas = 0;
  let enviandoPedido = false; 

  const selectCiudad = document.getElementById('ciudad');
  const btnSubmit = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-text');
  const formPedido = document.getElementById('pedido-form');

  function actualizarTextoBoton() {
    if (!selectCiudad || !btnText) return;
    const ciudad = selectCiudad.value;
    let dia = "TU RUTA";

    if (ciudad === "Sayula" || ciudad === "Atoyac" || ciudad === "Techaluta") dia = "JUEVES O VIERNES";
    else if (ciudad === "Zacoalco") dia = "LUNES";
    else if (ciudad === "Teocuitatlán" || ciudad === "Teocuitatlan") dia = "MARTES";

    btnText.textContent = `SÍ, QUIERO MI HUEVO FRESCO EL ${dia}`;
  }

  if (selectCiudad) selectCiudad.addEventListener('change', actualizarTextoBoton);
  actualizarTextoBoton();

  try {
    const res = await fetch(`${CONFIG.API_URL}?action=config_publica`);
    const data = await res.json();
    if (data.ok && data.config) {
      precioCartera = Number(data.config.Precio_Cartera) || precioCartera;
      precioCaja = Number(data.config.Precio_Caja) || precioCaja;
      
      if(document.getElementById('lbl-precio-cartera')) document.getElementById('lbl-precio-cartera').innerHTML = `$${precioCartera} <small>c/u</small>`;
      if(document.getElementById('lbl-precio-caja')) document.getElementById('lbl-precio-caja').innerHTML = `$${precioCaja} <small>c/u</small>`;
      actualizarTotal();
    }
  } catch (e) { console.error("Error cargando precios:", e); }

  if(document.getElementById('cant-carteras')) document.getElementById('cant-carteras').value = cantCarteras;
  if(document.getElementById('cant-cajas')) document.getElementById('cant-cajas').value = cantCajas;
  actualizarTotal();

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
        document.getElementById('total-display').textContent = `$${total.toLocaleString('es-MX')}`;
    }
  }

  if (formPedido) {
    formPedido.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enviandoPedido) return;
      if (cantCarteras === 0 && cantCajas === 0) return alert("Selecciona al menos un producto.");

      enviandoPedido = true;
      const btnTextoOriginal = btnSubmit.innerHTML;
      
      // --- BLOQUEO EXTREMO DEL BOTÓN ---
      btnSubmit.textContent = "Enviando pedido...";
      btnSubmit.disabled = true;
      btnSubmit.style.opacity = "0.5";
      btnSubmit.style.pointerEvents = "none";
      // ---------------------------------

      const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja);
      const ciudad = selectCiudad.value;
      const colonia = document.getElementById('colonia').value.trim();
      const direccion = document.getElementById('direccion').value.trim();
      const nombre = document.getElementById('nombre').value.trim();
      const tel = document.getElementById('tel').value.trim();

      let diaEntrega = "Por confirmar";
      if (ciudad === "Sayula" || ciudad === "Atoyac" || ciudad === "Techaluta") diaEntrega = "Jueves/Viernes";
      else if (ciudad === "Zacoalco") diaEntrega = "Lunes";
      else if (ciudad === "Teocuitatlán") diaEntrega = "Martes";

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
          
          window.location.href = `gracias.html?${params}`;
        } else {
          alert("Error del servidor: " + (data.error || "No se pudo procesar el pedido."));
          btnSubmit.innerHTML = btnTextoOriginal;
          btnSubmit.disabled = false;
          btnSubmit.style.opacity = "1";
          btnSubmit.style.pointerEvents = "auto";
          enviandoPedido = false;
        }
      } catch (err) {
        console.error(err);
        alert("Error de conexión con Google Apps Script.");
        btnSubmit.innerHTML = btnTextoOriginal;
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
        btnSubmit.style.pointerEvents = "auto";
        enviandoPedido = false;
      }
    });
  }
});