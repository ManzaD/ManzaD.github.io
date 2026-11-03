# LifeMOD — Cómo publicarla e instalarla en tu celular

Para instalar LifeMOD como app necesitas publicarla en internet una vez (gratis). Después funciona sin conexión y tus datos se guardan solo en tu teléfono.

## 1. Publicarla (elige una opción, 5 minutos)

### Opción A: Netlify Drop (la más fácil, sin cuenta de programador)
1. Descomprime `lifemod.zip`. Obtendrás la carpeta `lifemod`.
2. Entra en **app.netlify.com/drop** desde el computador.
3. Arrastra la carpeta `lifemod` a la página.
4. Netlify te da un enlace del tipo `https://nombre-al-azar.netlify.app`. Ábrelo en el celular.
   (Crea una cuenta gratuita si quieres que el enlace no caduque y poder cambiarle el nombre.)

### Opción B: GitHub Pages
1. Crea un repositorio nuevo en GitHub (por ejemplo `lifemod`).
2. Sube **el contenido** de la carpeta `lifemod` (que `index.html` quede en la raíz del repositorio).
3. Ve a **Settings → Pages**, en «Branch» elige `main` y la carpeta `/ (root)`, y guarda.
4. En un minuto tendrás la app en `https://TU-USUARIO.github.io/lifemod/`.

> La app debe abrirse por `https://`. Si abres `index.html` haciendo doble clic, el juego funciona, pero no se podrá instalar ni usar sin conexión.

## 2. Instalarla en el celular

**Android (Chrome)**
1. Abre el enlace en Chrome.
2. Toca el menú ⋮ → **Instalar aplicación** (o «Agregar a la pantalla principal»). En algunos teléfonos aparece un aviso automático o un botón «Instalar» en la pantalla de Inicio de LifeMOD.
3. Abre LifeMOD desde su ícono.

**iPhone / iPad (Safari)**
1. Abre el enlace en **Safari** (no en Chrome ni en otra app).
2. Toca el botón **Compartir** (cuadrado con flecha hacia arriba).
3. Elige **Agregar a inicio** y confirma.
4. Abre LifeMOD desde su ícono.

**Computador (Chrome o Edge)**: haz clic en el ícono de instalar que aparece en la barra de direcciones.

Después de abrirla una vez, funciona sin internet.

## 3. Recordatorios
En **Más → Ajustes → Recordatorios**, actívalos, concede el permiso y elige tus horas. Como LifeMOD no usa servidores:
- En Android y PC llegan mientras la app está abierta o en segundo plano (con la app instalada, Chrome puede enviar además un aviso periódico).
- En iPhone necesitas iOS 16.4 o superior y la app instalada en la pantalla de inicio; los avisos solo llegan si la app sigue abierta o suspendida.

## 4. Tus datos y respaldos
Todo se guarda solo en ese dispositivo y en ese navegador. Si borras los datos del navegador o cambias de teléfono, perderías tu progreso, así que de vez en cuando:
- **Más → Ajustes → Respaldo → Descargar archivo** (o «Compartir» / «Copiar respaldo»).
- Para recuperarlo: **Importar archivo** o **Pegar respaldo**.

La versión instalada en el teléfono y la que abras en el computador son independientes: usa el respaldo para pasar tu partida de uno a otro.

## 5. Actualizar la app
Si cambias archivos, vuelve a subir la carpeta. Para que los teléfonos descarguen la nueva versión, cambia el texto `lifemod-v1.1.0` en la primera línea de `sw.js` (por ejemplo a `lifemod-v1.1.1`).

## 6. Herramientas de prueba
En Ajustes, toca 7 veces la línea «LifeMOD v1.1» del final: aparecen botones para avanzar días, subir de nivel o recibir daño. Sirven para ver la muerte, el Ritual de Resurrección o los jefes sin esperar. Alteran tu partida; úsalos en una partida de prueba.
