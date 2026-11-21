// tracking.js - Maestro (Funciona para General, Zacoalco y Sayula)
(function() {
    // 1. ID de Sesión
    let sessionId = sessionStorage.getItem('hb_session_id');
    if (!sessionId) {
        sessionId = 'SESS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem('hb_session_id', sessionId);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const refAfiliado = urlParams.get('ref') || 'DIRECTO';
    const TRACKING_URL = "https://script.google.com/macros/s/AKfycbwVfkd-OVwCg35EWc0liv1NtoZAO-pqJS6n5By_hOTbty5Il2lkRlPJWFtQOt--MM6_Tg/exec";
    
    // Detecta el nombre real del archivo (index.html, index-zac.html, gracias.html, etc.)
    let landingActual = window.location.pathname.split('/').pop() || 'index.html';

    function enviarEvento(evento, detalle = "") {
        const payload = {
            action: "track_event",
            id_sesion: sessionId,
            ref: refAfiliado,
            evento: evento,
            detalle: detalle,
            landing: landingActual // <-- Aquí se guardará "index-zac.html"
        };

        fetch(TRACKING_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }).catch(e => console.log("Tracking error:", e));
    }

    // --- EVENTOS GLOBALES ---
    enviarEvento('pageview');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    enviarEvento('dispositivo', isMobile ? 'Celular' : 'PC');

    // --- EVENTOS DE INDEX (Ventas) ---
    if (landingActual !== 'gracias.html') {
        
        // Scroll
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            let scrollTop = window.scrollY || document.documentElement.scrollTop;
            let docHeight = document.body.scrollHeight - window.innerHeight;
            let scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent >= 50 && maxScroll < 50) { maxScroll = 50; enviarEvento('scroll_50'); }
            if (scrollPercent >= 90 && maxScroll < 90) { maxScroll = 90; enviarEvento('scroll_90'); }
        });

        // Formulario (Solo se activa cuando cambia el valor, sin fantasmas)
        const campos = ['ciudad', 'nombre', 'tel', 'colonia', 'direccion'];
        campos.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    if (input.value.trim() !== '') enviarEvento('campo_llenado', id);
                });
            }
        });

        // Calculadora (Detecta ambas clases: general y zacoalco)
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.qty-btn') || e.target.closest('.qty-btn-custom');
            if (btn) {
                const parentId = btn.closest('.producto-card')?.id || btn.closest('.prod-item')?.id || 'desconocido';
                const accion = btn.textContent.trim() === '+' ? 'sumar' : 'restar';
                const producto = parentId.includes('cartera') ? 'cartera' : 'caja';
                enviarEvento('clic_calculadora', `${accion}_${producto}`);
            }
        });

        // Botón de Enviar
        const btnSubmit = document.getElementById('btn-submit');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', () => {
                enviarEvento('clic_boton_enviar_pedido', 'Intento de envío');
            });
        }
    }

    // --- EVENTOS DE GRACIAS ---
    if (landingActual === 'gracias.html') {
        const tel = urlParams.get('tel');
        const folio = urlParams.get('folio');
        
        if (tel && folio) {
            const payloadVenta = {
                action: "track_venta",
                id_sesion: sessionId,
                ref: urlParams.get('ref') || 'DIRECTO',
                nombre: urlParams.get('nombre') || '',
                whatsapp: tel,
                ciudad: urlParams.get('ciudad') || '',
                colonia: urlParams.get('colonia') || '',
                producto: urlParams.get('diaEntrega') || 'Huevo', 
                total: urlParams.get('total') || '0',
                estado: folio === 'PENDIENTE_CONFIRMACION' ? 'PRUEBA' : 'CONFIRMADO'
            };

            fetch(TRACKING_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payloadVenta)
            }).catch(e => console.log("Tracking Venta error:", e));
        }

        window.addEventListener('DOMContentLoaded', () => {
            const btnPwa = document.getElementById('btn-pwa');
            if (btnPwa) {
                btnPwa.addEventListener('click', () => enviarEvento('clic_cta_pwa', 'El usuario quiere ser afiliado'));
            }
        });
    }
})();