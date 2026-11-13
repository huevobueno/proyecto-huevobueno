let videosRecompensaGlobales = [];
let respuestaSeleccionada = "";
let recompensaActual = 0;

window.cargarVideosRecompensa = async function() {
    const contenedor = document.getElementById('lista-videos-recompensa');
    contenedor.innerHTML = "<p class='text-center' style='width:100%;'>Cargando videos...</p>";
    
    try {
        const idCliente = window.HB_STATE && window.HB_STATE.clienteId ? window.HB_STATE.clienteId : "SIN_ID";
        const res = await fetch(`${CONFIG.API_URL}?action=videos_recompensa&id=${idCliente}`);
        const data = await res.json();
        
        if (data.ok && data.videos && data.videos.length > 0) {
            videosRecompensaGlobales = data.videos; 
            contenedor.innerHTML = "";
            
            data.videos.forEach((v, index) => {
                contenedor.innerHTML += `
                <div class="card-recompensa">
                    <img src="${v.thumbnail}" onerror="this.src='img/logo.png'">
                    <div class="info">
                        <h4>${v.titulo}</h4>
                        <button class="btn btn-primary" onclick="abrirVideoRecompensa(${index})">Ver y Ganar</button>
                    </div>
                </div>`;
            });
            if(data.limite) document.getElementById('video-limite-txt').innerText = `Has visto ${data.vistosHoy} de ${data.limite} videos hoy.`;
        } else { 
            contenedor.innerHTML = `<p class='text-center' style='width:100%;'>${data.mensaje || "No hay videos nuevos disponibles hoy."}</p>`; 
        }
    } catch (e) { 
        contenedor.innerHTML = "<p class='text-center' style='width:100%; color:red;'>Error al cargar videos.</p>"; 
    }
}

window.abrirVideoRecompensa = function(index) {
    const videoObj = videosRecompensaGlobales[index];
    videoActualId = videoObj.id; 
    recompensaActual = videoObj.recompensa || 2.00;
    respuestaSeleccionada = "";
    
    document.getElementById('zona-preguntas').classList.remove('hidden');
    document.getElementById('zona-capitulo').classList.add('hidden');
    document.getElementById('video-titulo').innerText = videoObj.titulo;
    document.getElementById('video-pregunta').innerText = videoObj.pregunta;
    document.getElementById('modal-video').classList.remove('modo-tiktok');
    
    const opcionesContainer = document.getElementById('opciones-container'); 
    opcionesContainer.innerHTML = "";
    videoObj.opciones.forEach(opc => {
      const btn = document.createElement('button'); 
      btn.className = "btn btn-block"; 
      btn.style.backgroundColor = "#f0f0f0"; 
      btn.style.color = "#333"; 
      btn.style.border = "2px solid #ddd"; 
      btn.innerText = opc;
      btn.onclick = () => { 
          Array.from(opcionesContainer.children).forEach(b => { b.style.backgroundColor = "#f0f0f0"; b.style.borderColor = "#ddd"; }); 
          btn.style.backgroundColor = "#ffe0b2"; 
          btn.style.borderColor = "#F39C12"; 
          respuestaSeleccionada = opc; 
      };
      opcionesContainer.appendChild(btn);
    });
    
    document.getElementById('modal-video').classList.remove('hidden'); 
    
    // Enviamos la duración que dice la base de datos al reproductor
    iniciarReproductor(videoObj.url, videoObj.duracion);
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-validar-video').addEventListener('click', async () => {
        if (!respuestaSeleccionada) return alert("Selecciona una respuesta.");
        const btn = document.getElementById('btn-validar-video'); 
        btn.innerText = "Validando..."; 
        btn.disabled = true;
        
        try {
          // Usamos tiempoActualReal (la variable global del reproductor)
          const res = await fetch(`${CONFIG.API_URL}?action=validar_video&id=${window.HB_STATE.clienteId}&video=${videoActualId}&respuesta=${encodeURIComponent(respuestaSeleccionada)}&tiempo=${tiempoActualReal}`);
          const data = await res.json();
          
          if (data.ok) {
            window.HB_STATE.saldoActual = data.nuevoSaldo; 
            localStorage.setItem('hb_cliente_saldo', window.HB_STATE.saldoActual); 
            actualizarUI(); 
            document.getElementById('modal-video').classList.add('hidden'); 
            alert(`¡Felicidades! Has ganado $${data.recompensa.toFixed(2)}`);
            cargarVideosRecompensa();
          } else { 
              alert(data.error); 
              btn.innerText = `Validar y Ganar $${recompensaActual.toFixed(2)}`; 
              btn.disabled = false; 
          }
        } catch (e) { alert("Error de conexión."); }
    });
});