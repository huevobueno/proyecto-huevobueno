document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refAfiliado = urlParams.get('ref') || 'DIRECTO';
  
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  if(document.getElementById('cant-carteras')) document.getElementById('cant-carteras').value = cantCarteras;
  if(document.getElementById('cant-cajas')) document.getElementById('cant-cajas').value = cantCajas;
  
  document.addEventListener('preciosListos', () => { actualizarTotal(); });
  setTimeout(actualizarTotal, 500); 

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
    if(!window.HB_PRECIOS) return;
    const total = (cantCarteras * window.HB_PRECIOS.cartera) + (cantCajas * window.HB_PRECIOS.caja);
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
      
      btnSubmit.textContent = "Enviando WhatsApp...";
      btnSubmit.disabled = true;
      btnSubmit.style.opacity = "0.5";
      btnSubmit.style.pointerEvents = "none";

      const total = (cantCarteras * window.HB_PRECIOS.cartera) + (cantCajas * window.HB_PRECIOS.caja);
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
        campana: "General" 
      };

      try {
        const res = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        if (data.ok) {
            // OCULTAMOS EL FORMULARIO Y MOSTRAMOS MENSAJE DE ÉXITO
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
          alert("Error: " + (data.error || "No se pudo enviar el WhatsApp."));
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