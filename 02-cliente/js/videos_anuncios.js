async function iniciarFlujoAnuncio(urlCapitulo) {
    const msgBloqueado = document.getElementById('msg-capitulo-bloqueado');
    const btnSiguiente = document.getElementById('btn-siguiente-capitulo');
    
    msgBloqueado.innerText = "Cargando anuncio...";
    msgBloqueado.classList.remove('hidden');
    btnSiguiente.classList.add('hidden');

    try {
        const res = await fetch(`${CONFIG.API_URL}?action=obtener_anuncio`);
        const data = await res.json();
        
        if (data.ok && data.anuncio) {
            msgBloqueado.innerText = `Anuncio de: ${data.anuncio.comercio}`;
            
            // Reproducimos el anuncio en el mismo iframe
            iniciarReproductor(data.anuncio.urlMedia);
            
            // Cuando el anuncio termine, reproducimos el capítulo
            const checkAnuncioTerminado = setInterval(() => {
                if (segundosTranscurridos >= duracionVideo && bunnyPlayer) {
                    // Hacemos una pausa breve y cargamos el capítulo
                    clearInterval(checkAnuncioTerminado);
                    msgBloqueado.innerText = "¡Anuncio visto! Reproduciendo capítulo...";
                    
                    setTimeout(() => {
                        msgBloqueado.classList.add('hidden');
                        iniciarReproductor(urlCapitulo);
                    }, 1500);
                }
            }, 1000);

        } else {
            // Si no hay anuncios disponibles, lo dejamos pasar
            msgBloqueado.innerText = "No hay anuncios disponibles. Pasando directo al capítulo...";
            setTimeout(() => {
                msgBloqueado.classList.add('hidden');
                iniciarReproductor(urlCapitulo);
            }, 1500);
        }
    } catch (e) {
        msgBloqueado.innerText = "Error al cargar anuncio. Pasando al capítulo...";
        setTimeout(() => {
            msgBloqueado.classList.add('hidden');
            iniciarReproductor(urlCapitulo);
        }, 1500);
    }
}