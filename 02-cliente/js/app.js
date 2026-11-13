async function iniciarProcesoOTP(tel, forzar = false) {
  if (!tel || tel.length !== 10) return alert("Ingresa un número válido.");
  
  const btnIngresar = document.getElementById('btn-ingresar');
  if(btnIngresar) { btnIngresar.innerText = "Buscando..."; btnIngresar.disabled = true; }

  try {
    const res = await fetch(`${CONFIG.API_URL}?action=solicitar_codigo_cliente&tel=${tel}&nombre=${encodeURIComponent(window.HB_STATE.nombre)}&forzar=${forzar}`);
    const data = await res.json();
    
    if (data.ok) {
      if (data.yaRegistrado && !forzar) {
        if (data.tienePassword) {
          alert("Ya tienes cuenta con contraseña. Inicia sesión con ella.");
          document.getElementById('login-otp').classList.add('hidden');
          document.getElementById('login-options').classList.remove('hidden');
          return;
        } else { 
          window.HB_STATE.clienteId = data.id; 
          window.HB_STATE.saldoActual = data.saldo; 
          entrarAlDashboard(); 
        }
      } else {
        document.getElementById('texto-codigo').innerText = `¡Hola ${window.HB_STATE.nombre}! Enviamos un código a +52 ${tel}`;
        document.getElementById('pantalla-login').classList.add('hidden'); 
        document.getElementById('pantalla-codigo').classList.remove('hidden');
        document.querySelector('#code-inputs input').focus();
      }
    } else { alert(data.error); }
  } catch (e) { alert("Error de conexión"); }
  finally { if(btnIngresar) { btnIngresar.innerText = "Enviar código por WhatsApp"; btnIngresar.disabled = false; } }
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  window.HB_STATE = {
    clienteId: localStorage.getItem('hb_cliente_id') || "",
    saldoActual: parseFloat(localStorage.getItem('hb_cliente_saldo') || 0),
    nombre: localStorage.getItem('hb_cliente_nombre') || "Cliente",
    telefono: localStorage.getItem('hb_cliente_tel') || "",
    tienePassword: localStorage.getItem('hb_cliente_tiene_pass') === 'true',
    permiteRetiro: localStorage.getItem('hb_permite_retiro') === 'true'
  };

  const pantallaLogin = document.getElementById('pantalla-login');
  const pantallaCodigo = document.getElementById('pantalla-codigo');

  document.getElementById('btn-toggle-otp').addEventListener('click', () => { document.getElementById('login-options').classList.add('hidden'); document.getElementById('login-otp').classList.remove('hidden'); });
  document.getElementById('btn-toggle-pass').addEventListener('click', () => { document.getElementById('login-otp').classList.add('hidden'); document.getElementById('login-options').classList.remove('hidden'); });

  document.getElementById('form-login-pass').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('login-usuario').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const btn = document.getElementById('btn-login-pass');
    btn.innerText = "Entrando..."; btn.disabled = true;

    try {
      const res = await fetch(`${CONFIG.API_URL}?action=login_cliente_password&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(pass)}`);
      const data = await res.json();
      if (data.ok) {
        window.HB_STATE.clienteId = data.id; 
        window.HB_STATE.saldoActual = data.saldo; 
        window.HB_STATE.nombre = data.nombre; 
        window.HB_STATE.telefono = data.tel;
        window.HB_STATE.tienePassword = true;
        window.HB_STATE.permiteRetiro = data.permiteRetiro || false;
        entrarAlDashboard();
      } else { alert(data.error); }
    } catch (e) { alert("Error de conexión"); }
    finally { btn.innerText = "Entrar con Contraseña"; btn.disabled = false; }
  });

  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault(); iniciarProcesoOTP(document.getElementById('input-tel').value.trim());
  });

  const codeInputs = Array.from(document.querySelectorAll('#code-inputs input'));
  codeInputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
      if (inp.value && i < codeInputs.length - 1) codeInputs[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && i > 0) codeInputs[i - 1].focus(); });
  });

  document.getElementById('btn-verificar').addEventListener('click', async () => {
    const codigo = codeInputs.map(i => i.value).join('');
    if (codigo.length !== 6) return alert("Escribe los 6 dígitos.");
    const btn = document.getElementById('btn-verificar'); btn.innerText = "Verificando..."; btn.disabled = true;
    
    try {
      const ciudad = localStorage.getItem('hb_cliente_ciudad_temp') || "Sayula";
      const colonia = localStorage.getItem('hb_cliente_colonia_temp') || "";
      const direccion = localStorage.getItem('hb_cliente_direccion_temp') || "";
      // --- CORRECCIÓN AQUÍ: Recuperamos el ref del localStorage ---
      const refParam = localStorage.getItem('hb_cliente_ref_temp') || "";

      const url = `${CONFIG.API_URL}?action=verificar_codigo_cliente&tel=${window.HB_STATE.telefono}&codigo=${codigo}&nombre=${encodeURIComponent(window.HB_STATE.nombre)}&ciudad=${encodeURIComponent(ciudad)}&colonia=${encodeURIComponent(colonia)}&direccion=${encodeURIComponent(direccion)}&ref=${encodeURIComponent(refParam)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.ok) { 
        window.HB_STATE.clienteId = data.id; 
        window.HB_STATE.saldoActual = data.saldo; 
        window.HB_STATE.tienePassword = data.tienePassword || false;
        
        localStorage.setItem('hb_cliente_ciudad', ciudad);
        localStorage.setItem('hb_cliente_colonia', colonia);
        localStorage.setItem('hb_cliente_direccion', direccion);
        
        entrarAlDashboard(); 
      }
      else { document.getElementById('error-codigo').textContent = data.error; }
    } catch (e) { document.getElementById('error-codigo').textContent = "Error de conexión."; }
    finally { btn.innerText = "Verificar código"; btn.disabled = false; }
  });

  if (urlParams.get('tel')) {
    let telParam = urlParams.get('tel');
    let nombreParam = urlParams.get('nombre') || "Cliente";
    let ciudadParam = urlParams.get('ciudad') || "Sayula";
    let coloniaParam = urlParams.get('colonia') || "";
    let direccionParam = urlParams.get('direccion') || "";
    let refParam = urlParams.get('ref') || ""; // <-- Atrapamos el ref de la URL
    
    localStorage.setItem('hb_cliente_ciudad_temp', ciudadParam);
    localStorage.setItem('hb_cliente_colonia_temp', coloniaParam);
    localStorage.setItem('hb_cliente_direccion_temp', direccionParam);
    localStorage.setItem('hb_cliente_ref_temp', refParam); // <-- LO GUARDAMOS EN LOCALSTORAGE
    
    window.HB_STATE.telefono = telParam;
    window.HB_STATE.nombre = nombreParam;
    
    // Limpiamos la URL para que no vuelva a pedir el OTP si recargan
    window.history.replaceState({}, document.title, window.location.pathname);

    iniciarProcesoOTP(telParam, true);

  } else if (window.HB_STATE.clienteId) {
    entrarAlDashboard();
  } else {
    pantallaLogin.classList.remove('hidden');
  }
});
