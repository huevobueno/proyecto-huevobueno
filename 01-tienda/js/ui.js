// ui.js - Maneja los textos dinámicos y precios (Página General)
window.HB_PRECIOS = {
    cartera: CONFIG.PRECIO_CARTERA_DEFAULT,
    caja: CONFIG.PRECIO_CAJA_DEFAULT,
    suelto: CONFIG.PRECIO_SUELTO_DEFAULT,
    kilo: CONFIG.PRECIO_KILO_DEFAULT
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // CAMBIO: Petición POST para evitar CORS
        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "config_publica" })
        });
        const data = await res.json();
        
        if (data.ok && data.config) {
            window.HB_PRECIOS.cartera = Number(data.config.Precio_Cartera) || window.HB_PRECIOS.cartera;
            window.HB_PRECIOS.caja = Number(data.config.Precio_Caja) || window.HB_PRECIOS.caja;
            window.HB_PRECIOS.suelto = Number(data.config.Precio_Tiendita_Suelto) || window.HB_PRECIOS.suelto;
            window.HB_PRECIOS.kilo = Number(data.config.Precio_Tiendita_Kilo) || window.HB_PRECIOS.kilo;
        }
    } catch (e) {
        console.error("Usando precios por defecto, error al conectar:", e);
    }

    actualizarTextosHTML();
});

function actualizarTextosHTML() {
    const p = window.HB_PRECIOS;
    
    const unitarioCartera = p.cartera / 30;
    const unitarioKilo = p.kilo / 16;
    const ahorroPorCartera = (p.suelto * 30) - p.cartera;
    const ahorroMes = ahorroPorCartera * 4;

    const formato = (num) => `$${Number(num).toFixed(2)}`;

    if(document.getElementById('ui-txt-suelto')) document.getElementById('ui-txt-suelto').textContent = formato(p.suelto);
    if(document.getElementById('ui-txt-suelto2')) document.getElementById('ui-txt-suelto2').textContent = formato(p.suelto);
    if(document.getElementById('ui-txt-unitario')) document.getElementById('ui-txt-unitario').textContent = formato(unitarioCartera);
    if(document.getElementById('ui-txt-unitario2')) document.getElementById('ui-txt-unitario2').textContent = formato(unitarioCartera);
    if(document.getElementById('ui-txt-kilo')) document.getElementById('ui-txt-kilo').textContent = formato(p.kilo);
    if(document.getElementById('ui-txt-kilo-unitario')) document.getElementById('ui-txt-kilo-unitario').textContent = formato(unitarioKilo);
    if(document.getElementById('ui-txt-cartera')) document.getElementById('ui-txt-cartera').textContent = formato(p.cartera);

    if(document.getElementById('ui-card-suelto')) document.getElementById('ui-card-suelto').textContent = formato(p.suelto);
    if(document.getElementById('ui-card-kilo')) document.getElementById('ui-card-kilo').textContent = formato(p.kilo);
    if(document.getElementById('ui-card-kilo2')) document.getElementById('ui-card-kilo2').textContent = formato(p.kilo);
    if(document.getElementById('ui-card-kilo-unitario')) document.getElementById('ui-card-kilo-unitario').textContent = formato(unitarioKilo);
    if(document.getElementById('ui-card-cartera')) document.getElementById('ui-card-cartera').textContent = formato(p.cartera);
    if(document.getElementById('ui-card-unitario')) document.getElementById('ui-card-unitario').textContent = formato(unitarioCartera);

    if(document.getElementById('ui-ahorro-cartera')) document.getElementById('ui-ahorro-cartera').textContent = `$${Math.round(ahorroPorCartera)}`;
    if(document.getElementById('ui-ahorro-mes')) document.getElementById('ui-ahorro-mes').textContent = `$${Math.round(ahorroMes)}`;

    if(document.getElementById('lbl-precio-cartera')) document.getElementById('lbl-precio-cartera').innerHTML = `$${p.cartera} <small>c/u</small>`;
    if(document.getElementById('lbl-precio-caja')) document.getElementById('lbl-precio-caja').innerHTML = `$${p.caja} <small>c/u</small>`;

    const event = new Event('preciosListos');
    document.dispatchEvent(event);
}