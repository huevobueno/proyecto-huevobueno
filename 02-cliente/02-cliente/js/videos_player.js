let bunnyPlayer = null;
let duracionVideo = 30;
let videoActualId = "";
let tiempoActualReal = 0;

window.iniciarReproductor = function(url, duracionDB) {
    const iframe = document.getElementById('video-iframe'); 
    // Forzamos a que el video no venga muteado
    let urlLimpia = url.replace(/muted=true/gi, 'muted=false').replace(/muted=1/gi, 'muted=false');
    iframe.src = urlLimpia;
    
    if (bunnyPlayer) { bunnyPlayer = null; }
    
    // Duracion oficial que dice la base de datos (Cher)
    duracionVideo = duracionDB || 30; 
    tiempoActualReal = 0;

    const btnValidar = document.getElementById('btn-validar-video'); 
    btnValidar.disabled = true; 
    btnValidar.innerText = "▶️ Dale Play al video"; 
    
    bunnyPlayer = new playerjs.Player(iframe);
    
    bunnyPlayer.on('ready', () => {
        bunnyPlayer.setVolume(100);
        bunnyPlayer.unmute();
        bunnyPlayer.play();
    });

    // ESCUCHAMOS EL TIEMPO REAL DEL VIDEO
    bunnyPlayer.on('timeupdate', (data) => {
        // playerjs devuelve el tiempo en data.seconds o data.seconds
        if (data && data.seconds !== undefined) {
            tiempoActualReal = Math.floor(data.seconds);
            
            // Si estamos en modo preguntas (Recompensas)
            if (!document.getElementById('zona-preguntas').classList.contains('hidden')) {
                const restantes = duracionVideo - tiempoActualReal;
                
                if (restantes > 0) {
                    btnValidar.innerText = `Esperando video (${restantes}s)...`;
                } else {
                    btnValidar.disabled = false; 
                    btnValidar.innerText = `Validar y Ganar`; 
                }
            }
        }
    });

    bunnyPlayer.on('pause', () => { 
        if (!document.getElementById('zona-preguntas').classList.contains('hidden') && tiempoActualReal < duracionVideo) { 
            btnValidar.innerText = "Video pausado..."; 
        } 
    });

    bunnyPlayer.on('ended', () => { 
        // Si el video termina, habilitamos el botón sin importar nada
        if (!document.getElementById('zona-preguntas').classList.contains('hidden')) {
            btnValidar.disabled = false; 
            btnValidar.innerText = `Validar y Ganar`; 
        } else {
            if (typeof window.onCapituloTerminado === 'function') {
                window.onCapituloTerminado();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-cerrar-video').addEventListener('click', () => {
        document.getElementById('modal-video').classList.add('hidden'); 
        document.getElementById('video-iframe').src = ""; 
        document.getElementById('modal-video').classList.remove('modo-tiktok');
        if (bunnyPlayer) { bunnyPlayer.pause(); }
    });
});