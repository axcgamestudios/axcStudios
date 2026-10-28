/* axc-ui.js — Interfaz de usuario del sistema de cuentas + instalación (compartida)
   Requiere: axc-auth.js. Usado por index.html, store.html, axcos.html, player.html */
window.AXC_UI = (function () {
  'use strict';
  if (window.AXC_UI) return window.AXC_UI;
  const $ = (s, r) => (r || document).querySelector(s);
  const AXC = window.AXC;

  /* ================== ESTILOS ================== */
  const CSS = `
.axcui-root{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(4,5,10,.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;transition:opacity .25s}
.axcui-root.open{display:flex;opacity:1}
.axcui-card{position:relative;width:100%;max-width:430px;max-height:92vh;overflow:auto;background:linear-gradient(165deg,#101322 0%,#0b0d18 60%,#0c101f 100%);border:1px solid rgba(255,255,255,.09);border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 0 1px rgba(46,124,246,.10),0 0 70px rgba(46,124,246,.12);padding:24px;transform:translateY(16px) scale(.97);transition:transform .35s cubic-bezier(.16,1,.3,1)}
.axcui-root.open .axcui-card{transform:none}
.axcui-x{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#cfd6e4;font-size:15px;cursor:pointer;transition:.2s}
.axcui-x:hover{background:rgba(255,255,255,.1)}
.axcui-logo{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.axcui-logo img{width:38px;height:38px;border-radius:11px}
.axcui-logo b{font-family:'Space Grotesk',sans-serif;font-size:19px;letter-spacing:.2px}
.axcui-logo span{color:#38e8ff;font-size:11px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;display:block;margin-top:-2px}
.axcui-tabs{display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:4px;margin-bottom:18px}
.axcui-tab{flex:1;padding:9px;border:0;border-radius:9px;background:transparent;color:rgba(245,246,247,.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:.25s}
.axcui-tab.on{background:#2e7cf6;color:#fff;box-shadow:0 4px 18px rgba(46,124,246,.4)}
.axcui-f{margin-bottom:12px}
.axcui-f label{display:block;font-size:12px;font-weight:600;color:rgba(245,246,247,.55);margin-bottom:6px;letter-spacing:.3px}
.axcui-f input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.04);color:#f5f6f7;font-size:15px;outline:none;transition:.25s;font-family:inherit}
.axcui-f input:focus{border-color:#2e7cf6;background:rgba(46,124,246,.07);box-shadow:0 0 0 3px rgba(46,124,246,.18)}
.axcui-btn{width:100%;padding:13px;border:0;border-radius:13px;background:linear-gradient(135deg,#2e7cf6,#1b5fd9);color:#fff;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:.25s;box-shadow:0 8px 26px rgba(46,124,246,.35);display:flex;align-items:center;justify-content:center;gap:8px}
.axcui-btn:hover{transform:translateY(-1px);box-shadow:0 12px 32px rgba(46,124,246,.5);filter:brightness(1.08)}
.axcui-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
.axcui-btn.ghost{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);box-shadow:none;color:#dfe5f0}
.axcui-btn.ok{background:linear-gradient(135deg,#18c964,#0e9e4c);box-shadow:0 8px 26px rgba(24,201,100,.35)}
.axcui-err{display:none;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.35);color:#ff9db3;padding:10px 12px;border-radius:11px;font-size:13px;margin-bottom:12px;line-height:1.45}
.axcui-ok{background:rgba(24,201,100,.08);border:1px solid rgba(24,201,100,.3);color:#7ff0b0;padding:10px 12px;border-radius:11px;font-size:13px;margin-bottom:12px;line-height:1.5}
.axcui-note{font-size:12.5px;color:rgba(245,246,247,.5);line-height:1.55;margin-top:10px}
.axcui-link{color:#38e8ff;cursor:pointer;text-decoration:underline;text-underline-offset:3px;background:none;border:0;padding:0;font:inherit}
.axcui-otp{display:flex;gap:8px;justify-content:center;margin:6px 0 14px}
.axcui-otp input{width:46px;height:54px;text-align:center;font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fff;outline:none;transition:.2s}
.axcui-otp input:focus{border-color:#38e8ff;box-shadow:0 0 0 3px rgba(56,232,255,.2);transform:translateY(-2px)}
.axcui-mail{border:1px solid rgba(56,232,255,.25);background:linear-gradient(160deg,rgba(56,232,255,.06),rgba(46,124,246,.04));border-radius:16px;padding:14px;margin:14px 0}
.axcui-mail-h{display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:.4px;color:#9fe8ff;margin-bottom:10px}
.axcui-mail-h .dot{width:8px;height:8px;border-radius:50%;background:#38e8ff;animation:axcui-blink 1.1s infinite}
@keyframes axcui-blink{50%{opacity:.15}}
.axcui-mail-b{font-size:13px;color:rgba(245,246,247,.75);line-height:1.6}
.axcui-mail-b b{color:#fff}
.axcui-dots{display:flex;gap:14px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.07);flex-wrap:wrap}
.axcui-dot{display:flex;align-items:center;gap:6px;font-size:11.5px;color:rgba(245,246,247,.5)}
.axcui-dot i{width:8px;height:8px;border-radius:50%;background:#5a6274;display:inline-block}
.axcui-dot.on i{background:#18c964;box-shadow:0 0 8px rgba(24,201,100,.8)}
.axcui-dot.wait i{background:#f5b942}
.axcui-steps{margin:14px 0}
.axcui-step{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start}
.axcui-step-n{flex:0 0 26px;height:26px;border-radius:9px;background:rgba(46,124,246,.15);border:1px solid rgba(46,124,246,.4);color:#7fb5ff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif}
.axcui-step p{font-size:13.5px;color:rgba(245,246,247,.78);line-height:1.55;margin:1px 0 0}
.axcui-step strong{color:#fff}
.axcui-toast{position:fixed;top:18px;left:50%;transform:translate(-50%,-90px);z-index:1200;background:#101527;border:1px solid rgba(56,232,255,.3);color:#e8f4ff;padding:12px 20px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 16px 50px rgba(0,0,0,.55);transition:transform .45s cubic-bezier(.16,1,.3,1);max-width:88vw;text-align:center}
.axcui-toast.show{transform:translate(-50%,0)}
.axcui-chip{display:flex;align-items:center;gap:9px;padding:8px 14px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#f5f6f7;font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:.25s;white-space:nowrap}
.axcui-chip:hover{background:rgba(46,124,246,.16);border-color:rgba(46,124,246,.5)}
.axcui-ava{width:26px;height:26px;border-radius:9px;background:linear-gradient(135deg,#2e7cf6,#38e8ff);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#04101f;text-transform:uppercase}
.axcui-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:190px;background:#0e1220;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:8px;box-shadow:0 18px 50px rgba(0,0,0,.6);display:none;z-index:60}
.axcui-menu.open{display:block}
.axcui-menu button{width:100%;text-align:left;padding:10px 12px;border:0;background:transparent;color:#dfe5f0;font-size:13.5px;border-radius:10px;cursor:pointer;font-family:inherit}
.axcui-menu button:hover{background:rgba(255,77,109,.14);color:#ffb3c2}
.axcui-menu .info{padding:8px 12px 6px;font-size:11.5px;color:rgba(245,246,247,.45);border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:6px;line-height:1.5}
.axcui-hint{font-size:12px;color:#f5b942;background:rgba(245,185,66,.08);border:1px solid rgba(245,185,66,.25);border-radius:11px;padding:9px 12px;margin-bottom:12px;line-height:1.5}
@media (max-width:520px){.axcui-otp input{width:40px;height:48px;font-size:21px}.axcui-card{padding:20px}}
`;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ================== DOM base ================== */
  const div = (id) => {
    const d = document.createElement('div');
    d.id = id; d.className = 'axcui-root';
    d.addEventListener('click', e => { if (e.target === d) closeModal(d); });
    document.body.appendChild(d);
    return d;
  };
  const authRoot = div('axc-auth-modal');
  const instRoot = div('axc-install-modal');
  const toastEl = document.createElement('div');
  toastEl.className = 'axcui-toast'; document.body.appendChild(toastEl);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (authRoot.classList.contains('open')) closeAuth(); if (instRoot.classList.contains('open')) closeInstall(); }
  });
  function openModal(m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal(m) { m.classList.remove('open'); if (!authRoot.classList.contains('open') && !instRoot.classList.contains('open')) document.body.style.overflow = ''; }

  /* ================== TOAST ================== */
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 3600);
  }

  /* ================== INSTALACIÓN PWA ================== */
  let deferredPrompt = null;
  let instCfg = { app: 'main', name: 'axcStudios', icon: 'images/icon-192.png' };
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.querySelectorAll('[data-axc-install-ready]').forEach(b => b.classList.add('ready'));
  });
  addEventListener('appinstalled', () => {
    deferredPrompt = null;
    toast('🎉 App instalada. ¡Búscala en tu escritorio o pantalla de inicio!');
    dispatchEvent(new CustomEvent('axc:pulse'));
    closeInstall();
  });

  async function nativeInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') toast('Instalando ' + instCfg.name + '…'); } catch (e) { }
      deferredPrompt = null;
      return true;
    }
    openInstall();
    return false;
  }

  function uaDevice() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'desktop';
  }
  const INSTALL_STEPS = {
    desktop: [
      { t: 'En <strong>Chrome</strong> o <strong>Edge</strong>, mira la barra de direcciones: aparece el icono de instalar <strong>⤓</strong>. Púlsalo y elige <strong>«Instalar página como aplicación»</strong>.' },
      { t: 'Si no lo ves: menú <strong>⋮</strong> → <strong>«Aplicaciones» / «Instalar página como aplicación»</strong>.' },
      { t: 'La app quedará en tu escritorio y menú de inicio, como cualquier programa. Se abre a pantalla completa, sin barra del navegador.' }
    ],
    android: [
      { t: 'En <strong>Chrome</strong>, toca el menú <strong>⋮</strong> de arriba a la derecha.' },
      { t: 'Pulsa <strong>«Instalar aplicación»</strong> (o «Añadir a pantalla de inicio»).' },
      { t: 'Confirma: el icono quedará junto a tus demás apps y se abre a pantalla completa.' }
    ],
    ios: [
      { t: 'Abre esta página en <strong>Safari</strong> (las apps solo se instalan desde Safari en iPhone/iPad).' },
      { t: 'Toca el botón <strong>Compartir</strong> (cuadrado con flecha hacia arriba).' },
      { t: 'Elige <strong>«Añadir a pantalla de inicio»</strong> y confirma. axcStudios quedará como una app real.' }
    ]
  };

  function openInstall(cfg) {
    if (cfg) instCfg = Object.assign(instCfg, cfg);
    const dev = uaDevice();
    instRoot.innerHTML = `
      <div class="axcui-card">
        <button class="axcui-x" data-close>✕</button>
        <div class="axcui-logo"><img src="${instCfg.icon}" alt=""><div><b>Instalar ${instCfg.name}</b><span>app nativa del navegador</span></div></div>
        <div class="axcui-ok" id="axcInstNative" style="display:none"></div>
        <div class="axcui-steps">${INSTALL_STEPS[dev].map((s, i) => `<div class="axcui-step"><div class="axcui-step-n">${i + 1}</div><p>${s.t}</p></div>`).join('')}</div>
        <button class="axcui-btn" id="axcInstBtn">⚡ Instalar ${instCfg.name} ahora</button>
        <p class="axcui-note">El botón azul usa la instalación nativa del navegador (la misma de la tienda, sin tiendas). Si no está disponible todavía, usa los pasos de arriba: el navegador la activa unos segundos después de cargar la página.</p>
      </div>`;
    const nb = $('#axcInstBtn', instRoot);
    const upd = () => {
      const n = $('#axcInstNative', instRoot);
      if (deferredPrompt) {
        n.style.display = 'block';
        n.innerHTML = '✅ Tu navegador ya validó la app: el botón de abajo abrirá el <b>diálogo nativo de instalación</b>.';
        nb.textContent = '⚡ Instalar ' + instCfg.name + ' ahora';
      } else {
        n.style.display = 'block';
        n.innerHTML = '⏳ Tu navegador todavía está validando la app (puede tardar unos segundos). Mientras, puedes usar los pasos manuales.';
        nb.textContent = '🔄 Reintentar instalación nativa';
      }
    };
    upd();
    nb.addEventListener('click', nativeInstall);
    $('[data-close]', instRoot).addEventListener('click', () => closeInstall());
    openModal(instRoot);
  }
  function closeInstall() { closeModal(instRoot); }
  /* ================== MODAL DE CUENTAS ================== */
  let mailPoll = null, resendT = null, resendLeft = 0, closable = true;

  function closeAuth() {
    clearInterval(mailPoll); clearTimeout(resendT);
    closeModal(authRoot);
  }

  function dots() {
    const st = AXC.state;
    const db = st.db === true ? '<span class="axcui-dot on"><i></i>Servidor de cuentas</span>'
      : st.db === false ? '<span class="axcui-dot"><i style="background:#ff4d6d"></i>Servidor caído</span>'
        : '<span class="axcui-dot wait"><i></i>Conectando servidor…</span>';
    const ws = st.ws === 'online' ? '<span class="axcui-dot on"><i></i>Red axc en vivo</span>'
      : st.ws === 'connecting' ? '<span class="axcui-dot wait"><i></i>Red axc conectando…</span>'
        : '<span class="axcui-dot"><i></i>Red axc dormida</span>';
    const ma = '<span class="axcui-dot on"><i></i>Correo directo</span>';
    return `<div class="axcui-dots">${db}${ws}${ma}</div>`;
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function viewAuth(mode) {
    mode = mode || 'login';
    authRoot.innerHTML = `
      <div class="axcui-card">
        <button class="axcui-x" data-close>✕</button>
        <div class="axcui-logo"><img src="images/icon-192.png" alt="axcStudios"><div><b>Cuenta axc</b><span>una cuenta · todas las páginas</span></div></div>
        <div class="axcui-tabs" id="axcTabs">
          <button class="axcui-tab" data-t="login">Iniciar sesión</button>
          <button class="axcui-tab" data-t="signup">Crear cuenta</button>
        </div>
        <div id="axcView"></div>
        ${dots()}
      </div>`;
    $('[data-close]', authRoot).addEventListener('click', () => { if (closable) closeAuth(); });
    $('#axcTabs', authRoot).querySelectorAll('.axcui-tab').forEach(b => b.addEventListener('click', () => showTab(b.dataset.t)));
    function showTab(t) {
      $('#axcTabs', authRoot).querySelectorAll('.axcui-tab').forEach(b => b.classList.toggle('on', b.dataset.t === t));
      if (t === 'login') viewLogin(); else viewSignup1();
    }
    function viewLogin() {
      $('#axcView', authRoot).innerHTML = `
        <div class="axcui-err" id="axcErr"></div>
        <div class="axcui-f"><label>Usuario</label><input id="axcLu" autocomplete="username" spellcheck="false"></div>
        <div class="axcui-f"><label>Contraseña</label><input id="axcLp" type="password" autocomplete="current-password"></div>
        <button class="axcui-btn" id="axcLb">Entrar →</button>
        <p class="axcui-note">La misma cuenta funciona en <strong>todas las páginas de axcStudios</strong> (tienda, juegos y cualquier web con el sistema axc).</p>`;
      const go = async () => {
        const btn = $('#axcLb', authRoot); btn.disabled = true; btn.textContent = 'Verificando…';
        const r = await AXC.login({ user: $('#axcLu', authRoot).value, pass: $('#axcLp', authRoot).value });
        btn.disabled = false; btn.textContent = 'Entrar →';
        if (r.ok) { toast('¡Bienvenido, ' + r.user + '! Sesión iniciada'); dispatchEvent(new CustomEvent('axc:pulse')); closeAuth(); }
        else { const e = $('#axcErr', authRoot); e.style.display = 'block'; e.textContent = r.error; if (/no existe/i.test(r.error)) showTab('signup'); }
      };
      $('#axcLb', authRoot).addEventListener('click', go);
      $('#axcView', authRoot).addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') go(); });
      $('#axcLu', authRoot).focus();
    }
    function viewSignup1() {
      clearInterval(mailPoll);
      $('#axcView', authRoot).innerHTML = `
        <div class="axcui-err" id="axcErr"></div>
        <div class="axcui-f"><label>Usuario <span style="opacity:.5">(3-16, letras/números/_)</span></label><input id="axcSu" autocomplete="username" spellcheck="false" placeholder="tu_nombre"></div>
        <div class="axcui-f"><label>Correo <span style="opacity:.5">(recibirás el código)</span></label><input id="axcSm" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com"></div>
        <div class="axcui-f"><label>Contraseña <span style="opacity:.5">(mínimo 6)</span></label><input id="axcSp" type="password" autocomplete="new-password"></div>
        <button class="axcui-btn" id="axcSb">📨 Enviar código de verificación</button>
        <p class="axcui-note">Te llegará un código de 6 dígitos: a tu correo <strong>y</strong> al <strong>Buzón axc</strong> integrado (llega siempre, se descarga del servidor en el siguiente paso). Tu contraseña se guarda cifrada (PBKDF2, nunca en claro).</p>`;
      const go = async () => {
        const btn = $('#axcSb', authRoot); btn.disabled = true; btn.textContent = 'Enviando código…';
        const r = await AXC.signup({
          user: $('#axcSu', authRoot).value,
          mail: $('#axcSm', authRoot).value,
          pass: $('#axcSp', authRoot).value
        });
        btn.disabled = false; btn.textContent = '📨 Enviar código de verificación';
        if (r.ok) viewSignup2(r); else { const e = $('#axcErr', authRoot); e.style.display = 'block'; e.textContent = r.error; }
      };
      $('#axcSb', authRoot).addEventListener('click', go);
      $('#axcView', authRoot).addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') go(); });
      $('#axcSu', authRoot).focus();
    }
    function viewSignup2(info) {
      resendLeft = 0;
      $('#axcView', authRoot).innerHTML = `
        <div class="axcui-ok">📨 Código enviado a <b>${esc(info.mail)}</b>. Comprueba tu correo (mira <b>spam</b>) o usa el <b>Buzón axc</b> de abajo, que lo descarga del servidor automáticamente.</div>
        <div class="axcui-mail">
          <div class="axcui-mail-h"><span class="dot"></span>✉ BUZÓN AXC · descarga automática</div>
          <div class="axcui-mail-b" id="axcMailB">Descargando correo del servidor…</div>
        </div>
        <div class="axcui-f"><label>Escribe el código de 6 dígitos</label>
          <div class="axcui-otp" id="axcOtp">${[0, 1, 2, 3, 4, 5].map(i => `<input maxlength="1" inputmode="numeric" data-i="${i}">`).join('')}</div>
        </div>
        <div class="axcui-err" id="axcErr"></div>
        <button class="axcui-btn" id="axcVb">✓ Verificar y crear cuenta</button>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="axcui-btn ghost" id="axcRb" style="font-size:13.5px">Reenviar código</button>
          <button class="axcui-btn ghost" id="axcCb" style="font-size:13.5px">Cambiar datos</button>
        </div>`;
      /* OTP */
      const otp = $('#axcOtp', authRoot);
      const inputs = [...otp.querySelectorAll('input')];
      inputs.forEach((inp, i) => {
        inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && i < 5) inputs[i + 1].focus(); });
        inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus(); });
        inp.addEventListener('paste', e => {
          e.preventDefault();
          const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
          d.split('').forEach((c, j) => { if (inputs[j]) inputs[j].value = c; });
          if (inputs[d.length]) inputs[Math.min(d.length, 5)].focus();
        });
      });
      inputs[0].focus();
      const code = () => inputs.map(i => i.value).join('');

      /* buzón: descarga del servidor */
      async function pollMail() {
        const m = await AXC.fetchMail();
        const b = $('#axcMailB', authRoot);
        if (!b) return;
        if (m) {
          b.innerHTML = `📬 <b>Correo entrante descargado</b><br>
            De: <b>${esc(m.from)}</b> · Para: <b>${esc(m.to)}</b><br>
            Asunto: <b>${esc(m.subject)}</b> · ${new Date(m.ts).toLocaleTimeString()}<br>
            <button class="axcui-btn ok" id="axcApply" style="margin-top:10px;padding:9px">👁 Mostrar el código y aplicarlo</button>`;
          const ap = $('#axcApply', authRoot);
          if (ap) ap.addEventListener('click', () => {
            String(m.code).split('').forEach((c, j) => { if (inputs[j]) inputs[j].value = c; });
            toast('Código aplicado desde el Buzón axc ✓');
            doVerify();
          });
          clearInterval(mailPoll); mailPoll = null;
        } else {
          b.innerHTML = '<span style="opacity:.65">Descargando correo del servidor…</span>';
        }
      }
      clearInterval(mailPoll);
      mailPoll = setInterval(() => { if (authRoot.classList.contains('open')) pollMail(); }, 4000);
      pollMail();

      async function doVerify() {
        const btn = $('#axcVb', authRoot); btn.disabled = true; btn.textContent = 'Verificando…';
        const r = await AXC.verify(code());
        btn.disabled = false; btn.textContent = '✓ Verificar y crear cuenta';
        if (r.ok) {
          clearInterval(mailPoll); mailPoll = null;
          toast('🎉 ¡Cuenta creada, ' + r.user + '! Sesión iniciada');
          dispatchEvent(new CustomEvent('axc:pulse'));
          closeAuth();
        } else {
          const e = $('#axcErr', authRoot); e.style.display = 'block'; e.textContent = r.error;
        }
      }
      $('#axcVb', authRoot).addEventListener('click', doVerify);
      $('#axcCb', authRoot).addEventListener('click', () => { clearInterval(mailPoll); viewSignup1(); });
      $('#axcRb', authRoot).addEventListener('click', async () => {
        if (resendLeft > 0) return;
        const r = await AXC.sendCode();
        if (r.ok) {
          resendLeft = 60;
          const b = $('#axcRb', authRoot);
          const tick = () => {
            if (resendLeft <= 0) { clearTimeout(resendT); b.textContent = 'Reenviar código'; b.disabled = false; return; }
            b.textContent = 'Reenviar en ' + resendLeft + 's'; b.disabled = true; resendLeft--;
            resendT = setTimeout(tick, 1000);
          };
          tick();
          clearInterval(mailPoll); mailPoll = setInterval(() => { if (authRoot.classList.contains('open')) pollMail(); }, 4000); pollMail();
          toast('Código reenviado ✓');
        } else { const e = $('#axcErr', authRoot); e.style.display = 'block'; e.textContent = r.error; }
      });
    }
    showTab(mode);
  }

  function openAuth(mode, opts) {
    closable = !(opts && opts.locked);
    viewAuth(mode);
    openModal(authRoot);
  }

  /* ================== CHIP DE CUENTA ================== */
  let chipEl = null, menuEl = null;
  function mountChip(el) {
    chipEl = typeof el === 'string' ? $(el) : el;
    if (!chipEl) return;
    renderChip();
    AXC.on('auth', renderChip);
  }
  function renderChip() {
    if (!chipEl) return;
    const u = AXC.state.user;
    if (menuEl) { menuEl.remove(); menuEl = null; }
    if (!u) {
      chipEl.innerHTML = `<button class="axcui-chip" id="axcChipBtn">👤 Iniciar sesión</button>`;
      $('#axcChipBtn').addEventListener('click', () => openAuth('login'));
      return;
    }
    chipEl.style.position = 'relative';
    chipEl.innerHTML = `<button class="axcui-chip" id="axcChipBtn"><span class="axcui-ava">${esc(u.u[0])}</span>${esc(u.u)} ▾</button>`;
    menuEl = document.createElement('div');
    menuEl.className = 'axcui-menu';
    menuEl.innerHTML = `<div class="info">Sesión: <b>${esc(u.u)}</b><br>${esc(u.m || '')}<br><span style="opacity:.6">Cuenta válida en todas las páginas axc</span></div>
      <button id="axcLogout">Cerrar sesión</button>`;
    chipEl.appendChild(menuEl);
    $('#axcChipBtn').addEventListener('click', e => { e.stopPropagation(); menuEl.classList.toggle('open'); });
    document.addEventListener('click', () => menuEl.classList.remove('open'));
    $('#axcLogout').addEventListener('click', () => { AXC.logout(); toast('Sesión cerrada'); menuEl.classList.remove('open'); });
  }

  /* ================== INIT ================== */
  const handlers = { onAuth: null, onPresence: null, onStatus: null };
  async function init(opts) {
    opts = opts || {};
    Object.assign(instCfg, opts.install || {});
    Object.assign(handlers, opts);
    /* primero registrar los handlers, luego arrancar (para no perder el evento
       de sesión restaurada al cargar la página) */
    AXC.on('auth', u => { renderChip(); if (handlers.onAuth) handlers.onAuth(u); });
    AXC.on('presence', n => { if (handlers.onPresence) handlers.onPresence(n); });
    AXC.on('status', s => { const d = authRoot.querySelector('.axcui-dots'); if (d && authRoot.classList.contains('open')) d.outerHTML = dots(); if (handlers.onStatus) handlers.onStatus(s); });
    AXC.on('pulse', () => dispatchEvent(new CustomEvent('axc:pulse')));
    AXC.on('mailpush', () => { /* si el WS empuja el código, la vista lo descarga al refrescar */ });
    if (opts.chip) mountChip(opts.chip);
    await AXC.init(opts.axc || {});
    renderChip();
    if (handlers.onAuth) handlers.onAuth(AXC.state.user);
    return AXC.state;
  }

  return {
    init, toast,
    openAuth, closeAuth,
    openInstall, closeInstall, nativeInstall,
    mountChip,
    canPlay: () => !!AXC.state.user && AXC.standalone(),
    standalone: () => AXC.standalone(),
    installReady: () => !!deferredPrompt,
    uaDevice
  };
})();

