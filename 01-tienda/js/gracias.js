document.addEventListener('DOMContentLoaded', () => {
    // 1. Llenar el año del footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Leer los datos que vienen en la URL de gracias.html
    const urlParams = new URLSearchParams(window.location.search);
    
    const folio = urlParams.get('folio') || "HB-ERROR";
    const tel = urlParams.get('tel') || "";
    const nombre = urlParams.get('nombre') || "amigo";
    const ciudad = urlParams.get('ciudad') || "";
    const colonia = urlParams.get('colonia') || "";
    const direccion = urlParams.get('direccion') || "";
    const dia = urlParams.get('diaEntrega') || "Próximamente";
    const total = urlParams.get('total') || "0";
    const ref = urlParams.get('ref') || "";

    // 3. Pintar los datos en la pantalla de gracias
    document.getElementById('nombre-cliente').textContent = nombre.split(' ')[0]; 
    document.getElementById('exito-folio').textContent = folio;
    document.getElementById('resumen-destino').textContent = ciudad ? `${ciudad} (${colonia})` : "-";
    document.getElementById('resumen-direccion').textContent = direccion || "-";
    document.getElementById('resumen-dia').textContent = dia;
    document.getElementById('exito-total').textContent = `$${total}`;

    // 4. LÓGICA DEL BOTÓN DE ACTIVAR CUENTA (EL QUE FALLA)
    const btnPwa = document.getElementById('btn-pwa');
    
    if (btnPwa) {
        btnPwa.addEventListener('click', () => {
            if (!tel) {
                alert("Hubo un error recuperando tu número. Por favor contacta a soporte.");
                return;
            }

            // Ruta hacia la PWA Naranja (ajusta los '../' según tu estructura de carpetas)
            // Si la tienda está en 01-tienda, sube un nivel y entra a 02-pwa-cliente
            const baseUrlPwa = "../02-cliente/index.html";
            
            // Construimos la URL con TODOS los datos que necesitamos que el perfil tenga
            const urlDestino = `${baseUrlPwa}?tel=${encodeURIComponent(tel)}` +
                               `&nombre=${encodeURIComponent(nombre)}` +
                               `&ciudad=${encodeURIComponent(ciudad)}` +
                               `&colonia=${encodeURIComponent(colonia)}` +
                               `&direccion=${encodeURIComponent(direccion)}` +
                               `&ref=${encodeURIComponent(ref)}`;

            // Redirigimos al usuario a la PWA de Clientes
            window.location.href = urlDestino;
        });
    }
});