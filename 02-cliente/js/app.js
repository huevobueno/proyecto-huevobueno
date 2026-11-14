let deferredPrompt;

window.cambiarTabVideos = function(tab) {
    const btnRec = document.getElementById('tab-recompensa');
    const btnMin = document.getElementById('tab-miniseries');
    const contRec = document.getElementById('contenedor-recompensa');
    const contMin = document.getElementById('contenedor-miniseries');

    if (!btnRec || !btnMin || !contRec || !contMin) return;

    if (tab === 'recompensa') {
        btnRec.style.background = '#F39C12'; btnRec.style.color = '#fff';
        btnMin.style.background = '#eee'; btnMin.style.color = '#333';
        contRec.classList.remove('hidden'); contMin.classList.add('hidden');
        if (typeof cargarVideosRecompensa === 'function') cargarVideosRecompensa();
    } else {
        btnMin.style.background = '#F39C12'; btnMin.style.color = '#fff';
        btnRec.style.background = '#eee'; btnRec.style.color = '#333';
        contMin.classList.remove('hidden'); contRec.classList.add('hidden');
        if (typeof cargarMiniseries === 'function') cargarMiniseries();
    }
};

window.scrollCarrusel = function(idContenedor, direccion) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
    const tarjeta = contenedor.querySelector('.card-recompensa') || contenedor.querySelector('.card-episodio');
    if (!tarjeta) return;
    const anchoTarjeta = tarjeta.offsetWidth + 15; 
    contenedor.scrollBy({ left: anchoTarjeta * direccion, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', () => {
    // Navegación Footer
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            btn.classList.add('active'); 
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Menú Hamburguesa
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    document.getElementById('btn-menu').addEventListener('click', () => { sidebar.classList.add('active'); sidebarOverlay.classList.remove('hidden'); });
    window.cerrarMenu = function() { sidebar.classList.remove('active'); sidebarOverlay.classList.add('hidden'); }
    document.getElementById('btn-cerrar-menu').addEventListener('click', cerrarMenu);
    sidebarOverlay.addEventListener('click', cerrarMenu);

    document.querySelectorAll('#sidebar .sidebar-list li[data-target]').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            if(target) {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById(target).classList.add('active');
                cerrarMenu();
                if (target === 'screen-billetera' && typeof cargarMovimientos === 'function') cargarMovimientos();
            }
        });
    });

    // Pestañas de videos
    const tabRec = document.getElementById('tab-recompensa');
    const tabMin = document.getElementById('tab-miniseries');
    if (tabRec) tabRec.addEventListener('click', () => cambiarTabVideos('recompensa'));
    if (tabMin) tabMin.addEventListener('click', () => cambiarTabVideos('miniseries'));

    // Flechas de recompensas
    const flechaIzq = document.getElementById('btn-flecha-rec-izq');
    const flechaDer = document.getElementById('btn-flecha-rec-der');
    if (flechaIzq) flechaIzq.addEventListener('click', () => scrollCarrusel('lista-videos-recompensa', -1));
    if (flechaDer) flechaDer.addEventListener('click', () => scrollCarrusel('lista-videos-recompensa', 1));

    // Instalar APP
    const btnInstalar = document.getElementById('btn-instalar-app');
    const yaInstalada = localStorage.getItem('hb_app_instalada');
    if (btnInstalar && !yaInstalada) btnInstalar.classList.remove('hidden');

    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

    if (btnInstalar) {
        btnInstalar.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    btnInstalar.classList.add('hidden');
                    localStorage.setItem('hb_app_instalada', 'true');
                }
                deferredPrompt = null;
            } else {
                alert("Para instalar, abre el menú de tu navegador y selecciona 'Agregar a la pantalla de inicio'.");
                localStorage.setItem('hb_app_instalada', 'true');
                btnInstalar.classList.add('hidden');
            }
        });
    }

    window.addEventListener('appinstalled', () => {
        if (btnInstalar) btnInstalar.classList.add('hidden');
        localStorage.setItem('hb_app_instalada', 'true');
    });
});

window.entrarAlDashboard = function() {
    localStorage.setItem('hb_cliente_tel', window.HB_STATE.telefono); 
    localStorage.setItem('hb_cliente_id', window.HB_STATE.clienteId); 
    localStorage.setItem('hb_cliente_nombre', window.HB_STATE.nombre);
    localStorage.setItem('hb_cliente_saldo', window.HB_STATE.saldoActual);
    localStorage.setItem('hb_cliente_tiene_pass', window.HB_STATE.tienePassword);
    localStorage.setItem('hb_permite_retiro', window.HB_STATE.permiteRetiro);

    document.getElementById('pantalla-login').classList.add('hidden'); 
    document.getElementById('pantalla-codigo').classList.add('hidden'); 
    document.getElementById('app-principal').classList.remove('hidden');
    
    actualizarUI(); 
    if (typeof cambiarTabVideos === 'function') cambiarTabVideos('recompensa'); 
    if (typeof cargarPedidos === 'function') cargarPedidos(); 
    if (typeof cargarPerfilReal === 'function') cargarPerfilReal(); 
    if (typeof actualizarTotalPedido === 'function') actualizarTotalPedido();
}

window.actualizarUI = function() {
    const uiSaldo = document.getElementById('ui-saldo');
    const headerSaldo = document.getElementById('header-saldo');
    const sidebarNombre = document.getElementById('sidebar-nombre');
    
    if (uiSaldo) uiSaldo.textContent = `$${window.HB_STATE.saldoActual.toFixed(2)}`;
    if (headerSaldo) headerSaldo.textContent = `$${window.HB_STATE.saldoActual.toFixed(2)}`;
    if (sidebarNombre) sidebarNombre.textContent = window.HB_STATE.nombre;
    
    // --- CORRECCIÓN DE RUTAS (SIN Ñ) ---
    const baseUrl = window.location.href.split('/02-cliente/')[0];
    const linkZac = `${baseUrl}/01-tienda/01-campana-zac/index.html?ref=${window.HB_STATE.clienteId}`;
    const linkSay = `${baseUrl}/01-tienda/02-campana-say/index.html?ref=${window.HB_STATE.clienteId}`;

    const btnZac = document.getElementById('btn-copiar-zac');
    if (btnZac) {
        btnZac.onclick = () => {
            navigator.clipboard.writeText(linkZac).then(() => {
                const textoOriginal = btnZac.innerHTML;
                btnZac.innerHTML = "✅ ¡Copiado! Pégalo en tu grupo";
                setTimeout(() => btnZac.innerHTML = textoOriginal, 3000);
            }).catch(err => {
                alert("No se pudo copiar. Aquí está tu link: " + linkZac);
            });
        };
    }

    const btnSay = document.getElementById('btn-copiar-say');
    if (btnSay) {
        btnSay.onclick = () => {
            navigator.clipboard.writeText(linkSay).then(() => {
                const textoOriginal = btnSay.innerHTML;
                btnSay.innerHTML = "✅ ¡Copiado! Pégalo en tu grupo";
                setTimeout(() => btnSay.innerHTML = textoOriginal, 3000);
            }).catch(err => {
                alert("No se pudo copiar. Aquí está tu link: " + linkSay);
            });
        };
    }

    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilTel = document.getElementById('perfil-tel');
    
    if (perfilNombre) perfilNombre.textContent = window.HB_STATE.nombre;
    if (perfilTel) perfilTel.textContent = window.HB_STATE.telefono;
}