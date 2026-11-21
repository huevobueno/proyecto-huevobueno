document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refAfiliado = urlParams.get('ref') || 'DIRECTO';
  
  let precioCartera = CONFIG.PRECIO_CARTERA_DEFAULT || 85;
  let precioCaja = CONFIG.PRECIO_CAJA_DEFAULT || 650;
  let precioDespensa = CONFIG.PRECIO_DESPENSA_DEFAULT || 200; // NUEVO
  
  let cantCarteras = 1; 
  let cantCajas = 0;
  let cantDespensas = 0; // NUEVO
  let enviandoPedido = false; 

  const selectCiudad = document.getElementById('ciudad');
  const btnSubmit = document.getElementById('btn-submit');
  const formPedido = document.getElementById('pedido-form');

  // Cargar precios dinámicos
  try {
    const res = await fetch(`${CONFIG.API_URL}?action=config_publica`);
    const data = await res.json();
    if (data.ok && data.config) {
      precioCartera = Number(data.config.Precio_Cartera) || precioCartera;
      precioCaja = Number(data.config.Precio_Caja) || precioCaja;
      precioDespensa = Number(data.config.Precio_Despensa) || precioDespensa; // NUEVO
      
      if(document.getElementById('lbl-precio-cartera')) document.getElementById('lbl-precio-cartera').innerText = `$${precioCartera.toFixed(2)}`;
      if(document.getElementById('lbl-precio-caja')) document.getElementById('lbl-precio-caja').innerText = `$${precioCaja.toFixed(2)}`;
      if(document.getElementById('lbl-precio-despensa')) document.getElementById('lbl-precio-despensa').innerText = `$${precioDespensa.toFixed(2)}`; // NUEVO
      
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
    } else if (tipo === 'despensas') { // NUEVO
      cantDespensas = Math.max(0, cantDespensas + cambio);
      document.getElementById('cant-despensas').value = cantDespensas;
      const card = document.getElementById('card-despensas');
      if (cantDespensas > 0) card.classList.add('activo'); else card.classList.remove('activo');
    }
    actualizarTotal();
  };

  function actualizarTotal() {
    const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja) + (cantDespensas * precioDespensa);
    document.getElementById('total-display').textContent = `$${total.toFixed(2)}`;
  }

  if (formPedido) {
    formPedido.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enviandoPedido) return;
      if (cantCarteras === 0 && cantCajas === 0 && cantDespensas === 0) return alert("Selecciona al menos un producto.");

      const ciudad = selectCiudad.value;
      if (!ciudad) return alert("Por favor, selecciona tu ciudad.");

      enviandoPedido = true;
      const btnTextoOriginal = btnSubmit.innerHTML;
      
      btnSubmit.textContent = "Enviando pedido...";
      btnSubmit.disabled = true;
      btnSubmit.style.opacity = "0.5";

      const total = (cantCarteras * precioCartera) + (cantCajas * precioCaja) + (cantDespensas * precioDespensa);
      
      let diaEntrega = "Por confirmar";
      if (ciudad === "Sayula" || ciudad === "Atoyac" || ciudad === "Techaluta") diaEntrega = "Jueves/Viernes";
      else if (ciudad === "Zacoalco") diaEntrega = "Lunes";
      else if (ciudad === "Teocuitatlán") diaEntrega = "Martes";
      
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
        cantDespensas: cantDespensas, // NUEVO
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
          btnSubmit.style.opacity = "1";
          enviandoPedido = false;
        }
      } catch (err) {
        console.error(err);
        alert("Error de conexión. Revisa tu internet.");
        btnSubmit.innerHTML = btnTextoOriginal;
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
        enviandoPedido = false;
      }
    });
  }
});