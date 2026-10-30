# Sistema de Cuentas axc (SSO) — Guía de integración

Una sola cuenta para **todas** las páginas de axcStudios. Este documento explica cómo
funciona por dentro y cómo agregar el mismo sistema a cualquier otra página web
(incluso en otros repositorios o dominios github.io).

---

## 1. Qué es

- El jugador crea su cuenta **una vez** (usuario + contraseña + correo).
- Recibe un **código de verificación de 6 dígitos** que llega al **Buzón axc** integrado:
  se descarga del servidor en vivo y **se muestra solo en grande en la pantalla** (y se
  escribe automáticamente). También se intenta entregar al correo real (mejor esfuerzo).
- Al verificarlo, la cuenta queda **guardada en un servidor** (no en la página, no es
  una simulación: los datos viven en un servidor real en la nube).
- Con esa misma cuenta puede **iniciar sesión en cualquier otra página que tenga el
  sistema** (la tienda, los juegos, otras webs del estudio).

## 2. Arquitectura (cómo funciona por dentro)

```
   ┌─────────────────────────────  TU PÁGINA  ─────────────────────────────┐
   │                                                                       │
   │   <script src="…/axc-auth.js">   ← la biblioteca (única)              │
   │   <script src="…/axc-ui.js">     ← interfaz opcional (modales, chips) │
   │                                                                       │
   └──────────┬──────────────────┬──────────────────┬──────────────────────┘
              │                  │                  │
              ▼                  ▼                  ▼
   ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────────┐
   │ textdb.dev     │  │ formsubmit.co   │  │ wss://wsn-c6o3.onrender…  │
   │ (SERVIDOR DE   │  │ (correo real    │  │ (red axc en vivo: tu      │
   │  DATOS, la     │  │  a la dirección │  │  servidor WebSocket)      │
   │  "base de      │  │  del usuario)   │  │ · estado de la red        │
   │  datos")       │  │                 │  │ · presencia ("N en línea")│
   │ · cuentas      │  └─────────────────┘  │ · aviso de cuentas nuevas │
   │ · buzón axc    │  ┌─────────────────┐  │   (mantiene el servidor   │
   └────────────────┘  │ ntfy.sh         │  │    despierto con latidos) │
                       │ (push extra)    │  └───────────────────────────┘
                       └─────────────────┘
```

**El "servidor de cuentas"** es `textdb.dev`: un servicio clave-valor público sin
registro, con CORS abierto. Cada cuenta se guarda como un valor JSON en su propia
clave, más una copia de respaldo:

| Clave (en textdb.dev)      | Contenido                                              |
|----------------------------|--------------------------------------------------------|
| `axcu1:{usuario}`          | registro principal: `{u, m, s, k, i, t, c}`           |
| `axcv1:{usuario}`          | copia de respaldo (por si una clave falla)            |
| `axcm1:{usuario}`          | buzón axc: sobre con el código sellado (15 min)       |

El registro guarda: usuario `u`, correo `m`, salt `s`, hash `k` (PBKDF2-SHA256,
150.000 iteraciones), iteraciones `i`, fecha `t` y checksum `c` (anti-manipulación).
**La contraseña nunca sale del navegador ni se guarda en claro.**

## 3. Flujo de registro (qué pasa realmente)

1. La página llama `AXC.signup({user, mail, pass})`.
2. La biblioteca comprueba en el servidor que el usuario esté libre.
3. Genera el código de 6 dígitos y lo **envía por 4 canales**:
   - **Buzón axc** (canal principal, garantizado): guarda un sobre sellado en
     `axcm1:{usuario}` → la pantalla de verificación lo **descarga del servidor cada
     2 s** y **muestra el código automáticamente en grande, escribiéndolo en los
     campos por ti**. El código viaja sellado con un secreto que solo tiene el
     navegador que hizo el registro. Si el buzón no puede recibir el sobre, la
     biblioteca **avisa del error** (antes lo ocultaba).
   - **Correo real** al buzón del usuario vía `formsubmit.co` (mejor esfuerzo: puede
     estar bloqueado por Cloudflare o pedir activación; el Buzón axc siempre funciona).
   - **ntfy.sh** (push en vivo, si hay cuota disponible).
   - **Tu servidor WebSocket** (si está despierto).
4. El jugador escribe (o ya tiene escrito) el código → `AXC.verify(code)`:
   - comprueba el hash del código (máx. 6 intentos, caduca en 15 min),
   - comprueba que nadie más registró ese usuario mientras tanto,
   - guarda la cuenta en el servidor (clave principal + respaldo),
   - inicia la sesión local automáticamente.

## 4. Flujo de inicio de sesión

1. `AXC.login({user, pass})` descarga el registro del servidor
   (con respaldo y, si el servidor no responde, la caché local del dispositivo).
2. Calcula PBKDF2(contraseña, salt) en el navegador y lo compara con el hash.
3. Si coincide (y el checksum anti-manipulación es válido) → sesión creada.

La **sesión** es un token local por origen (`localStorage`, 30 días, protegido con
MAC). "Por origen" significa: cada dominio recuerda la sesión por separado (así
funciona la web), pero **las credenciales son las mismas en todos lados**.

## 5. Cómo agregar el sistema a OTRA página (3 pasos)

### Paso 1 — Carga las bibliotecas

En cualquier página (de este repo u **otro dominio**):

```html
<script src="https://axcgamestudios.github.io/axcStudios/axc-auth.js"></script>
<!-- Opcional: interfaz ya hecha (modal de cuenta, toasts, instalación) -->
<script src="https://axcgamestudios.github.io/axcStudios/axc-ui.js"></script>
```

### Paso 2 — Inicia y conecta tu interfaz

Con la interfaz incluida (recomendado):

```html
<div id="accountChip"></div>  <!-- aquí aparece el botón "Iniciar sesión" / el avatar -->

<script>
AXC_UI.init({
  chip: '#accountChip',          // chip de cuenta (opcional)
  onAuth: (usuario) => {         // se llama al iniciar/cerrar sesión
    if (usuario) mostrarJuego();
    else mostrarLogin();
  }
});

// Para pedir cuenta antes de jugar:
function jugar() {
  if (!AXC.state.user) return AXC_UI.openAuth('login');   // o 'signup'
  // …aquí tu juego…
}
</script>
```

**Solo con la biblioteca** (sin la interfaz, para páginas propias):

```html
<script>
AXC.init();                       // conecta servidor + red + restaura sesión

AXC.on('auth', usuario => {       // evento de sesión
  document.body.classList.toggle('logueado', !!usuario);
});

const r = await AXC.login({ user: 'axc_fan', pass: '••••••' });
if (r.ok) console.log('¡Hola ' + r.user + '!');

const r2 = await AXC.signup({ user: 'nuevo', mail: 'x@y.com', pass: '••••••' });
// r2.ok → ahora pedir el código:
const sobre = await AXC.fetchMail();     // buzón axc (o el jugador lo lee en su correo)
const r3 = await AXC.verify(sobre.code);
</script>
```

### Paso 3 — Listo

La cuenta creada en axcStudios funciona en tu página (y al revés) porque **todas
las páginas hablan con el mismo servidor de cuentas central**.

## 6. API completa (`AXC`)

| Método | Qué hace |
|---|---|
| `AXC.init(opts?)` | Arranca: restaura sesión, conecta servidor y red. Llamar 1 vez. |
| `AXC.state` | `{ user, ws, db, presence }` — estado actual. |
| `AXC.signup({user, mail, pass})` | Registra y envía el código. → `{ok, step:'code'}` |
| `AXC.sendCode()` | Reenvía el código (mismo código hasta caducar). |
| `AXC.fetchMail()` | Descarga el sobre del buzón axc → `{from, to, subject, code}` o `null`. |
| `AXC.verify(code)` | Verifica el código y crea la cuenta + sesión. |
| `AXC.login({user, pass})` | Inicia sesión. → `{ok, user, offline?}` |
| `AXC.logout()` | Cierra la sesión en esta página. |
| `AXC.on(ev, cb)` | Eventos: `auth`, `ready`, `status`, `presence`, `sync`, `signup`, `pulse`, `mailpush`. |
| `AXC.standalone()` | `true` si la página corre como app instalada (PWA). |
| `AXC.pending` | Registro en espera de verificación (o `null`). |

De `AXC_UI` (interfaz): `init`, `openAuth('login'|'signup')`, `closeAuth`,
`openInstall({app,name,icon})`, `nativeInstall()`, `toast(msg)`, `canPlay()`,
`standalone()`, `mountChip(el)`, `uaDevice()`, **`launchGame(juego, tarjeta?)`**
(abre el juego DENTRO de la página a pantalla completa, con animación FLIP desde la
 Tarjeta y pantalla de carga con motion graphics) y `closeGame()`.

## 7. Las reglas de acceso de las páginas axcStudios

**Instalar la app es OPCIONAL**: todo corre en la página. El único candado real es la sesión.

| Contenido | Sin sesión | Con sesión (navegador o app instalada) |
|---|---|---|
| Studio (pestaña principal) | ✔ visible | ✔ |
| Catálogo de la tienda | 🔒 candado | ✔ |
| Jugar (botón Jugar) | 🔒 | ▶ **juega aquí mismo**, a pantalla completa, con animación de lanzamiento |

Si quieres las apps en tu escritorio (opcional), las 2 se instalan desde el mismo repo
(mismo sitio, links propios):

| App | Link | Manifest |
|---|---|---|
| axcStudios (estudio) | `…/axcStudios/` | `manifest.webmanifest` |
| axcStudios Games (tienda) | `…/axcStudios/store.html` | `manifest-store.webmanifest` |

## 8. Seguridad y límites (léelo)

- **Contraseñas**: PBKDF2-SHA256 con 150.000 iteraciones y salt aleatorio. Nunca
  salen del navegador en claro.
- **Nivel del sistema**: es un sistema real y funcional, pero **aficionado**:
  el almacén de datos es un servicio público, así que cualquiera que sepa el
  esquema de claves podría, en teoría, escribir en él. El checksum `c` detecta
  manipulaciones triviales. **No guardes aquí datos sensibles reales.**
- **FormSubmit** entrega correo real, pero es un servicio gratuito: puede
  tardar o pedir activación la primera vez. El Buzón axc es el canal garantizado.
- **Tu servidor WebSocket (wss://wsn-c6o3.onrender.com)**: está en Render
  gratuito, así que **se duerme** tras un rato sin tráfico y **tarda hasta ~2-3
  minutos en despertar**. La biblioteca lo reintenta para siempre (con pausas
  crecientes) y muestra "conectando…" mientras tanto. Mientras hay pestañas
  abiertas, los latidos cada 25 s lo mantienen despierto. Habla un protocolo
  binario propio (envía un frame `03 …` de bienvenida); la biblioteca le envía
  sus mensajes JSON de la red axc y los ignora sin romper nada.
- **ntfy.sh** tiene cuota diaria por IP; si se agota, simplemente se omite.
- **Cuenta borrada**: las cuentas viven en claves públicas; no hay borrado
  remoto. Para "empezar de cero" se usa otro nombre de usuario.

## 9. Problemas y soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| "No se pudo conectar con el servidor de cuentas" | textdb.dev caído o sin internet | Reintentar; el login funciona con caché local si ya iniciaste sesión en ese dispositivo |
| El correo no llega | FormSubmit bloqueado por Cloudflare / primera vez / spam | El **Buzón axc** muestra el código automáticamente en la pantalla (siempre llega); el correo es solo un extra |
| "El servidor de correo axc no respondió" | textdb.dev no pudo guardar el sobre | Esperar unos segundos y pulsar **Reenviar código** |
| "Red axc dormida" | El servidor de Render está hibernando | Esperar: reconecta solo (hasta 2-3 min) |
| El usuario ya existe | Alguien lo registró | Elegir otro nombre (3-16 letras/números/_) |

## 10. Archivos del sistema

```
axc-auth.js               ← biblioteca del sistema (el corazón, portable)
axc-ui.js                 ← interfaz (modal liquid glass con Buzón axc v2, reproductor
                             de juegos en página, glow del cursor, instalación opcional)
games-data.js             ← catálogo de juegos (compartido)
index.html                ← estudio (2 pestañas: Studio / tienda)
store.html                ← Tienda (manifest propio, juegos corren en la página)
player.html               ← reproductor directo de un juego (enlace #id del juego)
manifest*.webmanifest     ← 2 manifests (una app = un manifest + un link)
sw.js                     ← service worker (para instalar como app, opcional)
cuenta-demo.html          ← ejemplo mínimo de integración (cópialo)
```

## 11. Ideas de evolución

- **Correo desde un servidor propio**: añadir a `axc-auth.js` un canal con
  Brevo/SendGrid (clave API en un mini-backend) y el código llegaría siempre al
  correo sin activaciones. La estructura de canales ya está preparada.
- **Tu WS como relay real**: si actualizas el servidor de Render para reenviar
  mensajes entre clientes (broadcast), la presencia y los avisos en vivo se
  activan solos: la biblioteca ya habla el protocolo `{axc:1,t:'hi'|'sync'|'code'…}`.
- **Panel de usuarios**: `GET https://textdb.dev/api/data/axcu1:{usuario}` para
  cualquier usuario conocido (o mantener un índice en otra clave).
