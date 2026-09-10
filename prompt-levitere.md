# Prompt para Fable Code — Web LEVITERE

## Contexto

Vas a construir la web de **Levitere**, un estudio de vídeo (property films / FPV) con base en Bergen, Noruega. Es una **single-page** muy visual y minimalista, con el contenido como protagonista. Trabajamos en **local (localhost)**; el despliegue a dominio será más adelante, así que no configures hosting, pero **no tomes decisiones que compliquen un futuro deploy estático**.

En la raíz del proyecto tienes:
- `LEVITERE_Web_Build_Brief.pdf` — el brief completo del cliente. **Léelo entero antes de escribir código.** Es la fuente de verdad; si algo de este prompt contradice al brief, gana el brief y me avisas.
- Una carpeta con los **assets reales**: vídeos, logos e imágenes de referencia (capturas de los diseños de Emilio).

## Fase 0 — Inventario, antes de tocar nada

1. Lista recursivamente la carpeta de assets: nombre, extensión, tamaño y, para los vídeos, duración/resolución/códec (usa `ffprobe`).
2. Abre las imágenes de referencia de los diseños (desktop y mobile) y descríbeme lo que ves: composición, proporciones, márgenes, jerarquía tipográfica. Estos diseños mandan sobre cualquier interpretación tuya.
3. Propón un **mapeo assets → secciones** en una tabla:

   | Fichero | Sección | Desktop/Mobile | Uso |

   Las secciones que hay que cubrir son: Hero (Home), Work (4 proyectos: Marbella/Spain, Bergen/Norway, Nordfjord/Norway, Valencia/Spain — numerados 2, 3, 4, 5 en el brief), los 4 vídeos de modal de Work, el carrusel "A Vision Trusted By Leading Brands" (Brann 04.08.26, Frydenbø 30.06.26, W Eiendomsmegling 25.06.26, Strand Properties 06.05.26), y el vídeo de Studio.
4. **Para cada asset que falte o que no puedas asignar con seguridad, pregúntame. No inventes nombres de fichero ni uses placeholders sin decírmelo explícitamente.** Marca claramente qué falta (ej. versiones verticales para mobile).
5. Para en este punto y espérame. No empieces a construir hasta que confirme el mapeo.

## Stack

- **Vite + HTML/CSS/JS vanilla** (TypeScript si lo prefieres). Sin React, sin Next, sin Tailwind, sin GSAP, sin librerías de scroll o carrusel. El sitio tiene una sola página y un puñado de interacciones; una dependencia de animación aquí es peso muerto.
- CSS propio con custom properties. Nada de frameworks de UI.
- Salida final: build estático (`dist/`) desplegable en cualquier CDN.
- `npm run dev` debe levantar en localhost y ser lo único que yo necesite ejecutar.

Estructura de ficheros clara y separada por secciones (ej. `src/styles/`, `src/scripts/hero.js`, `carousel.js`, `work-modal.js`, `nav.js`, `form.js`). Nada de un `main.js` de 800 líneas.

## Reglas globales innegociables (del brief)

- **Tipografía:** Helvetica. Stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`. Sin webfonts, sin llamadas a Google Fonts.
- **Solo dos tamaños de texto principales:** uno grande y uno pequeño. Defínelos como custom properties (`--fs-lg`, `--fs-sm`) con `clamp()` para el escalado responsive, y **no crees tamaños intermedios ad hoc**.
- **Solo blanco y negro.** Sin grises decorativos salvo los que aparezcan en los diseños de Emilio (ej. el placeholder de un input).
- **Fondo blanco en todo salvo el Home** (hero a pantalla completa con el vídeo).
- Respeta los espacios vacíos y las proporciones de los diseños. El aire es parte del diseño, no un hueco a rellenar.
- **El usuario nunca debe sentirse atrapado.** Todo lo que se abre se cierra fácil y obvio.

## Secciones

Sigue el brief al detalle para el copy (es copy exacto, no lo reescribas, no corrijas su gramática, respeta mayúsculas) y para el comportamiento. Resumen de lo crítico:

**Hero / Home**
- Vídeo horizontal full-screen, autoplay + loop + muted + playsinline.
- Header blanco sobre el hero: `Home — Work — Levitere — Studio — Contact`, con `Levitere` centrado.
- Al scrollear: menú y textos blancos hacen fade-out progresivo; al entrar en fondo blanco aparece la navegación en negro. `Levitere` permanece centrado.
- Los links hacen smooth scroll a su sección.

**Work — desktop**
- Cuatro imágenes con el mismo tamaño base, distribuidas horizontalmente.
- Hover: la imagen bajo el cursor **aumenta claramente**; las **inmediatamente adyacentes aumentan ligeramente**; aparece la localización sobre la imagen (nombre de proyecto + país). Animación suave.
- Click → modal/overlay casi full-screen con el vídeo del proyecto, autoplay + loop.

**Work — mobile**
- Feed vertical, sin hover. Cada imagen ya muestra su proyecto/localización. Imágenes y vídeos mantienen sus proporciones originales. Click → mismo modal.

**Modal (ambos)**
- `×` / `Close` grande y evidente, `Esc` cierra, click fuera cierra.
- Al cerrar, vuelve **exactamente** al punto de scroll anterior (bloquea el scroll del body sin saltos: guarda `scrollY`, `position: fixed` + `top` negativo, restaura al cerrar).
- Focus trap dentro del modal y devolución del foco al elemento que lo abrió.

**A Vision Trusted By Leading Brands**
- Carrusel de 4 vídeos. Estado inicial (sin interacción): cada vídeo se reproduce **una vez** y al terminar pasa automáticamente al siguiente, en ciclo. Usa el evento `ended`, no un `setInterval`.
- En cuanto hay interacción (click en un punto, navegación manual, swipe): se desactiva el avance automático **para siempre en esa sesión**, y el vídeo seleccionado queda en **loop** hasta que el usuario elija otro.
- Puntos abajo centrados: activo destacado, hover → microescala, click → cambia.
- Desktop: nombre de marca + fecha en HTML abajo a la izquierda, superpuesto al vídeo. Mobile: **desaparecen marca y fecha**, se mantienen los puntos, y se añade swipe izquierda/derecha (gestión con eventos `pointer`, con umbral de distancia y bloqueo del scroll vertical solo si el gesto es claramente horizontal).
- Transición entre vídeos suave (crossfade corto).

**Studio**
- Desktop: vídeo a la izquierda, texto a la derecha. Mobile: título, vídeo, texto debajo. Vídeo autoplay + loop. Sin animaciones adicionales.

**Contact**
- Formulario: Name, Email, Add message... con el estilo de línea inferior de los diseños.
- Bloque de información con los precios (NOK 5,900, etc.), copy exacto.
- `Levitere` gigante al final como elemento gráfico (texto real, no imagen, escalado a ancho de viewport).

## Header / navegación

- Desktop: como se ha descrito.
- **Mobile: no hay menú.** Solo `Levitere` arriba. **No añadas menú hamburguesa ni ningún elemento de navegación extra.** La versión mobile es una experiencia continua de scroll tipo feed.

## Vídeos — reglas técnicas

- Nada de players de YouTube/Vimeo. Todo `<video>` nativo, sin controles visibles, sin branding.
- Siempre: `autoplay muted playsinline loop` (loop donde corresponda), `preload` ajustado, atributo `poster`.
- **Genera los posters tú** con ffmpeg (primer frame representativo de cada vídeo) y guárdalos en `public/posters/`.
- Comprueba con `ffprobe` que los vídeos son H.264/AAC en MP4 y con `faststart` (`moov` al principio). Si alguno no lo está, propón el comando ffmpeg para recomprimirlo y **pregúntame antes de tocar los originales** — nunca sobreescribas los ficheros fuente, escribe en una carpeta derivada.
- Lazy loading real: carga solo lo necesario. Hero con máxima prioridad. El resto de vídeos se cargan/reproducen vía `IntersectionObserver`, y se pausan al salir de viewport para no quemar CPU y batería con 9 vídeos a la vez.
- Sonido desactivado por defecto, siempre.
- Sirve versiones distintas para desktop y mobile (vídeo horizontal vs vertical). Usa `<source media="...">` o carga condicional por JS a partir de un `matchMedia`, no ambos vídeos descargados a la vez.

## Animaciones — lista cerrada

Permitidas **solo**: fade del header, smooth scroll, escala de imágenes de Work en desktop, aparición de la localización, apertura/cierre del modal, transición del carrusel, microescala de los puntos.

Prohibidas: WebGL, parallax agresivo, scroll hijacking, 3D, animaciones decorativas, cursores personalizados, transiciones lentas. **Si dudas de si una animación entra, no la pongas.**

Anima solo `transform` y `opacity`. Duraciones cortas (150–350 ms) con easing suave. Respeta `prefers-reduced-motion: reduce` desactivando fades y escalados y dejando el scroll en `auto`.

## Formulario — backend

Al enviar hay que guardar Name, Email, Message y fecha/hora en Google Sheets, y mandar notificación a `leviterestudio@gmail.com`. El usuario **nunca** debe ver Google Forms ni Sheets.

Enfoque: un **Google Apps Script desplegado como Web App** que recibe un POST y escribe en la hoja + `MailApp.sendEmail`. Eso mantiene el sitio 100% estático.

Lo que necesito de ti:
1. El código del Apps Script (`.gs`) en `backend/` con instrucciones de despliegue.
2. En el front, la URL del endpoint leída de `import.meta.env.VITE_FORM_ENDPOINT`, con un `.env.example`. **Si la variable no está definida, en dev debe hacer un mock que loguee el payload y muestre el estado de éxito**, para que yo pueda probar todo el flujo en localhost sin tener el script desplegado.
3. Validación en cliente (campos requeridos, email con formato), estado de envío (deshabilitar botón, evitar doble submit), y manejo de error visible pero sobrio.
4. Al enviar con éxito: mostrar `Thank you. We'll be in touch shortly.` **sin redirección**, reemplazando el formulario in situ.

## Calidad

- HTML semántico, un `<section id>` por sección para el smooth scroll.
- Accesibilidad: `alt` en imágenes, labels reales en el formulario (visualmente ocultos si el diseño no los muestra), navegación por teclado en modal y carrusel, foco visible.
- Probado a 1440, 1024 y 375 px de ancho como mínimo, y en Safari iOS (el autoplay y el `playsinline` son donde más se rompe).
- Sin errores ni warnings en consola.
- `README.md` con: cómo arrancar, estructura de carpetas, cómo sustituir un vídeo, y cómo desplegar el Apps Script.

## Cómo quiero que trabajes

Por fases, parando al final de cada una para que yo revise en el navegador:

1. Inventario de assets + mapeo (párate y pregunta).
2. Scaffold + reglas globales de CSS + header/navegación + Hero.
3. Work desktop + mobile + modal.
4. Carrusel Leading Brands.
5. Studio + Contact + formulario.
6. Pasada de optimización de vídeo, accesibilidad y responsive.

En cada fase, dime qué decisiones has tomado que no estaban en el brief. Si el brief es ambiguo o los diseños de Emilio contradicen algo, **pregunta en vez de elegir por tu cuenta**.
