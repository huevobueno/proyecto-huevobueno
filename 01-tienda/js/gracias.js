document.addEventListener('DOMContentLoaded', async () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const urlParams = new URLSearchParams(window.location.search);
    const folio = urlParams.get('folio') || "PENDIENTE_CONFIRMACION";
    const tel = urlParams.get('tel') || "";
    const nombre = urlParams.get('nombre') || "amigo";
    const ciudad = urlParams.get('ciudad') || "";
    const colonia = urlParams.get('colonia') || "";
    const direccion = urlParams.get('direccion') || "";
    const dia = urlParams.get('diaEntrega') || "Próximamente";
    const total = urlParams.get('total') || "0";
    const ref = urlParams.get('ref') || "";

    // Pintar datos
    document.getElementById('nombre-cliente').textContent = nombre.split(' ')[0]; 
    document.getElementById('resumen-destino').textContent = ciudad ? `${ciudad} (${colonia})` : "-";
    document.getElementById('resumen-direccion').textContent = direccion || "-";
    document.getElementById('resumen-dia').textContent = dia;
    document.getElementById('exito-total').textContent = `$${total}`;

    // CONFIRMACIÓN SILENCIOSA Y SALTO A LA PWA
    if (folio === "PENDIENTE_CONFIRMACION" && tel) {
        const folioElement = document.getElementById('exito-folio');
        folioElement.textContent = "Confirmando...";

        try {
            // 1. El backend guarda pedido y crea la cuenta
            await fetch(`${CONFIG.API_URL}?action=confirmar_pedido_definitivo&tel=${tel}&folio=${folio}`);
            
            folioElement.textContent = "Confirmado ✅";

            // 2. Redirigimos a la PWA de clientes pasándole los datos.
            // Como el usuario ya fue creado en el backend, la PWA lo dejará entrar directo (sin OTP).
            const baseUrlPwa = "../02-cliente/index.html";
            const urlDestino = `${baseUrlPwa}?tel=${encodeURIComponent(tel)}` +
                               `&nombre=${encodeURIComponent(nombre)}` +
                               `&ciudad=${encodeURIComponent(ciudad)}` +
                               `&colonia=${encodeURIComponent(colonia)}` +
                               `&direccion=${encodeURIComponent(direccion)}` +
                               `&ref=${encodeURIComponent(ref)}` +
                               `&auto_login=true`; // Flag para que la PWA sepa que ya está creado

            // Redirigimos automáticamente después de 1.5 segundos (para que vea que se confirmó)
            setTimeout(() => {
                window.location.href = urlDestino;
            }, 1500);

        } catch (e) {
            console.error("Error al confirmar:", e);
            folioElement.textContent = "Error de conexión";
        }
    } else {
        document.getElementById('exito-folio').textContent = folio;
    }
});