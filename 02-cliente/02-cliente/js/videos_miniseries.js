let seriesGlobales = [];
let capitulosActuales = [];
let capituloActualIndex = -1;

window.cargarMiniseries = async function() {
    const contenedor = document.getElementById('lista-miniseries');
    contenedor.innerHTML = "<p class='text-center'>Cargando miniseries...</p>";
    
    try {
        const resSeries = await fetch(`${CONFIG.API_URL}?action=miniseries`);
        const dataSeries = await resSeries.json();
        
        if (!dataSeries.ok || dataSeries.series.length === 0) {
            contenedor.innerHTML = "<p class='text-center'>No hay miniseries disponibles.</p>";
            return;
        }

        seriesGlobales = dataSeries.series;
        contenedor.innerHTML = "";
        
        for (let i = 0; i < seriesGlobales.length; i++) {
            const serie = seriesGlobales[i];
            
            const resCaps = await fetch(`${CONFIG.API_URL}?action=capitulos&serie=${serie.id}`);
            const dataCaps = await resCaps.json();
            
            let htmlCarrusel = "";
            
            if (dataCaps.ok && dataCaps.capitulos && dataCaps.capitulos.length > 0) {
                capitulosActuales = dataCaps.capitulos; 
                
                let tarjetasHTML = "";
                dataCaps.capitulos.forEach((c, index) => {
                    const esBloqueado = c.requiereAnuncio === 'SI';
                    const icono = esBloqueado ? '🔒' : '▶';
                    const vistaAleatoria = Math.floor(Math.random() * 900) + 100;
                    
                    // CAMBIO: La imagen y el boton de la tarjeta tienen un ID para escuchar el clic
                    tarjetasHTML += `
                    <div class="card-episodio" data-serie="${serie.id}" data-index="${index}">
                        <img src="${c.thumbnail || 'img/logo.png'}" onerror="this.src='img/logo.png'">
                        <span class="badge-ep">EP.${c.numero}</span>
                        <div class="icono-play">${icono}</div>
                        <span class="vistas">▶ ${vistaAleatoria}</span>
                    </div>`;
                });
                
                // CAMBIO: Las flechas usan data-carrusel y data-dir
                htmlCarrusel = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; margin-top:20px;">
                        <h2 style="font-size:1.3rem; font-weight:800; margin:0;">${serie.titulo}</h2>
                        <button class="btn btn-primary btn-ver-serie" data-serie="${serie.id}" data-index="0" style="width:auto; padding:6px 15px; border-radius:20px; font-size:0.85rem;">Ver</button>
                    </div>
                    
                    <div class="carrusel-wrapper">
                        <button class="btn-flecha izq" data-carrusel="carrusel-${serie.id}" data-dir="-1">❮</button>
                        <div id="carrusel-${serie.id}" class="carrusel-horizontal">
                            ${tarjetasHTML}
                        </div>
                        <button class="btn-flecha der" data-carrusel="carrusel-${serie.id}" data-dir="1">❯</button>
                    </div>
                `;
            } else {
                 htmlCarrusel = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; margin-top:20px;">
                        <h2 style="font-size:1.3rem; font-weight:800; margin:0;">${serie.titulo}</h2>
                    </div>
                    <p class='text-center' style="color:#666; margin-bottom:20px;">Próximamente...</p>
                `;
            }
            
            contenedor.innerHTML += htmlCarrusel;
        }
        
    } catch (e) { 
        console.error(e);
        contenedor.innerHTML = "<p class='text-center'>Error al cargar series.</p>"; 
    }
}

window.abrirCapituloSerie = function(idSerie, index) {
    fetch(`${CONFIG.API_URL}?action=capitulos&serie=${idSerie}`)
        .then(res => res.json())
        .then(data => {
            if (data.ok && data.capitulos.length > 0) {
                capitulosActuales = data.capitulos; 
                capituloActualIndex = index;
                const cap = capitulosActuales[index];
                
                document.getElementById('zona-preguntas').classList.add('hidden');
                document.getElementById('zona-capitulo').classList.remove('hidden');
                document.getElementById('video-titulo').innerText = cap.titulo;
                
                document.getElementById('modal-video').classList.add('modo-tiktok');
                document.getElementById('modal-video').classList.remove('hidden');
                
                if (cap.requiereAnuncio === 'SI') {
                    iniciarFlujoAnuncio(cap.url);
                } else {
                    document.getElementById('msg-capitulo-bloqueado').classList.add('hidden');
                    iniciarReproductor(cap.url); 
                }
            }
        });
};

window.onCapituloTerminado = function() {
    document.getElementById('btn-siguiente-capitulo').classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    // Escuchador global para los clics en las tarjetas de episodios y botones "Ver"
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('.card-episodio, .btn-ver-serie');
        if (target) {
            const idSerie = target.getAttribute('data-serie');
            const index = parseInt(target.getAttribute('data-index'));
            if (idSerie !== null && !isNaN(index)) {
                abrirCapituloSerie(idSerie, index);
            }
        }
    });

    // Escuchador global para las flechas de los carruseles
    document.body.addEventListener('click', (e) => {
        const flecha = e.target.closest('.btn-flecha');
        if (flecha && flecha.hasAttribute('data-carrusel')) {
            const idCarrusel = flecha.getAttribute('data-carrusel');
            const dir = parseInt(flecha.getAttribute('data-dir'));
            scrollCarrusel(idCarrusel, dir);
        }
    });

    const btnSiguiente = document.getElementById('btn-siguiente-capitulo');
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            if (capituloActualIndex < capitulosActuales.length - 1) {
                capituloActualIndex++;
                const cap = capitulosActuales[capituloActualIndex];
                document.getElementById('video-titulo').innerText = cap.titulo;
                if (cap.requiereAnuncio === 'SI') {
                    iniciarFlujoAnuncio(cap.url);
                } else {
                    document.getElementById('msg-capitulo-bloqueado').classList.add('hidden');
                    iniciarReproductor(cap.url); 
                }
            } else {
                alert("¡Has terminado esta miniserie!");
                document.getElementById('modal-video').classList.add('hidden');
            }
        });
    }
});