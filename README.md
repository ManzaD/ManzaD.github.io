# LifeMOD — RPG de hábitos

Tu vida es el juego: tu héroe sube de nivel cuando cumples hábitos reales y recibe daño cuando caes en malos hábitos. Gacha con pity, mascotas, jefes, campaña, eventos sorpresa, 64 logros, estadísticas y modo hardcore con muerte permanente y Legado.

- **Publicar e instalar en el celular:** ver `INSTRUCCIONES.md`.
- **Fórmulas de balance y decisiones de diseño:** ver `DECISIONES.md`.

## Estructura
```
index.html              página principal
manifest.webmanifest    datos de la PWA
sw.js                   service worker (offline y recordatorios)
css/styles.css          estilos
js/data.js              contenido: clases, hábitos, objetos, jefes, misiones, logros
js/engine.js            motor del juego (lógica pura)
js/art.js               arte SVG (personaje, objetos, mascotas, jefes, íconos)
js/audio.js             sonidos con Web Audio API
js/fx.js                partículas y efectos
js/app.js               estado, guardado, acciones, notificaciones
js/ui.js                pantallas e interfaz
fonts/, icons/          fuentes e íconos locales
tests/                  pruebas (no se necesitan para publicar)
```

## Pruebas
```
node tests/engine.test.js                       # 170 pruebas del motor y simulación del gacha
python3 -m http.server 8765 & python3 tests/e2e.py   # 73 comprobaciones en navegador (requiere Playwright)
```
Sin dependencias ni compilación: es un sitio estático.
