# LifeMOD — Decisiones y fórmulas de balance

Este documento recoge todas las decisiones que tomé donde el encargo no especificaba algo, con las fórmulas exactas que usa el código (`js/engine.js` y `js/data.js`).

## 1. Tecnología

- **Sitio estático sin build**: HTML + CSS + JavaScript plano (sin frameworks ni dependencias). Se abre tal cual en cualquier hosting estático.
- **Guardado**: `localStorage` (clave `lifemod-save-v1`), un único objeto JSON con versión (`v`). Si el navegador bloquea el almacenamiento, el juego sigue en memoria y Ajustes muestra un aviso para exportar respaldo. Se pide `navigator.storage.persist()` para que el navegador no borre los datos.
- **Offline**: service worker con caché de todos los archivos al instalarse (cache-first con actualización en segundo plano). Fuentes incluidas localmente (Dela Gothic One para títulos, M PLUS Rounded 1c para el texto), sin peticiones externas.
- **Arte**: 100% SVG generado por código (personaje por capas, 66 objetos de equipo, 20 mascotas, 8 jefes, 98 íconos de interfaz). Sin imágenes externas. Los PNG de `icons/` se generaron desde un SVG propio solo porque los manifiestos PWA los exigen.
- **Sonido**: sintetizado con Web Audio API (osciladores + ruido + reverberación generada). 15 sonidos, incluido uno distinto por rareza del gacha. Botón de silencio en la barra superior y volumen en Ajustes.
- **Fecha del juego**: el "día" es el día local del dispositivo (medianoche a medianoche). Al abrir la app se procesan todos los días transcurridos, aunque hayan pasado semanas.

## 2. Progresión

| Concepto | Fórmula |
|---|---|
| XP para pasar del nivel *n* al *n+1* | `floor(100 × n^1.5)` → 100, 282, 519, 800, 1118, 1469, 1852… |
| XP para subir un atributo del nivel *n* | `floor(60 × n^1.35)` |
| HP máximo | `100 + 5 × (nivel − 1) + 3 × (Vitalidad − 1)` |
| XP de un hábito | `base × racha × (1 + bonus_atributo + bonus_todo) × (2 si crítico)` |
| Oro de un hábito | `base × racha × (1 + bonus_oro) × (1,5 si crítico)` |
| XP de atributo | igual a la XP ganada, al atributo del hábito |

**Recompensa base por dificultad**

| Dificultad | XP | Oro | Daño (malo) | Curación (Vitalidad) |
|---|---|---|---|---|
| Fácil | 15 | 6 | 6 | 3 |
| Normal | 25 | 10 | 12 | 5 |
| Difícil | 40 | 16 | 20 | 8 |
| Épico | 70 | 28 | 32 | 12 |

**Multiplicador de racha** (por hábito): x1,1 a los 3 · x1,25 a los 7 · x1,35 a los 14 · x1,5 a los 30 · x1,65 a los 60 · x1,8 a los 100. Al llegar a 7, 14, 30, 60 y 100 se ganan 20/35/80/150/300 gemas.

**Golpe crítico**: 8% base (+ clase, equipo y eventos; máximo 50%). Da XP x2 y oro x1,5. Aporta sorpresa en cada toque.

**Atributos con efecto propio** (para que subirlos importe):
- Fuerza: +1% de daño a jefes por nivel.
- Inteligencia: +1% de XP de misiones por nivel.
- Vitalidad: +3 HP máximo por nivel.
- Disciplina: −0,5% de daño recibido por nivel.
- Carisma: +1% de oro por nivel.

**Ritmo estimado**: con 6 hábitos diarios y las misiones del día se ganan unos 300–400 XP diarios → nivel 5 en 4–5 días, nivel 10 en unas 4 semanas.

### Subir de nivel
Cada nivel da `20 + 2 × nivel` gemas, `25 × nivel` de oro y cura 25% del HP máximo.

**Recompensas especiales cada 5 niveles**

| Nivel | Recompensa |
|---|---|
| 5 | 10 tickets + 3 tickets de mascota + 100 gemas + título «Aventurero» |
| 10 | 10 tickets + Ticket Dorado (Legendario garantizado) + Cofre Épico + 150 gemas |
| 15 | 10 tickets + 150 gemas + skin «Traje de Gala» |
| 20 | 10 tickets + Ticket Dorado + 200 gemas + título «Veterano» |
| 25 | 10 tickets + 200 gemas + aura «Arcoíris» |
| 30 | 10 tickets + Ticket Dorado + 300 gemas + título «Semidiós» |
| 35, 40… | 10 tickets + (100 + 10 × nivel) gemas (+ Ticket Dorado cada 10) |

### Desbloqueos progresivos
Nivel 2: tienda de objetos · Nivel 3: misiones semanales y de Exploración · Nivel 4: Equilibrio, eventos sorpresa y Forja · Nivel 5: gacha de mascotas · Nivel 6: jefes · Nivel 7: banner destacado.
Elegí jefes en el nivel 6 (y no 10) para que lleguen en la primera o segunda semana; con la curva elegida el nivel 10 tarda casi un mes.

## 3. Clases (6)

| Clase | Bonus de XP | Pasiva |
|---|---|---|
| Guerrero | +20% Fuerza | +25% daño a jefes |
| Mago | +20% Inteligencia | +15% XP de misiones |
| Monje | +12% Vitalidad y Disciplina | +50% curación con hábitos de Vitalidad |
| Bardo | +20% Carisma | +15% oro de todas las fuentes |
| Paladín | +12% Disciplina | −20% daño recibido |
| Pícaro | +10% Fuerza y Carisma | +12% probabilidad de crítico |

Cada clase empieza con un arma propia y una selección sugerida de 6 hábitos que se puede cambiar.

### Creación de personaje
- **Paso de clase**: al elegir cada clase se muestra un héroe de muestra **nivel 99** con el equipo legendario/mítico que representa a esa clase (arma, armadura, accesorio, mascota y aura), su título y la lista del equipo. Todo ese equipo se puede conseguir en el gacha, así funciona como meta visible desde el primer minuto. Después se pasa a personalizar al héroe propio, que empieza en nivel 1 con su arma básica.
- **Apariencia** (dos opciones nuevas por apartado, pensadas para cubrir más estilos reales):

| Apartado | Opciones |
|---|---|
| Tono de piel (10) | Porcelana, Clara, Melocotón, Oliva, Trigo, Canela, Cacao, Ébano, Profundo, Élfica |
| Forma de cara (6) | Ovalada, Redonda, Afilada, Ancha, Corazón, Cuadrada |
| Ojos (7) | Brillantes, Afilados, Alegres, Serenos, Felinos, Almendrados, Redondos |
| Color de ojos (10) | Negro, Café, Ámbar, Verde, Azul, Gris, Turquesa, Violeta, Rosa, Rojo |
| Peinado (9) | Corto, Puntiagudo, Largo, Coleta, Bob, Dos coletas, Moño, Rizado / afro, Rapado |
| Color de pelo (12) | Negro, Castaño, Castaño claro, Caoba, Rubio, Pelirrojo, Plateado, Blanco, Rosa, Azul, Verde, Morado |
| Atuendo base (8) | Aventurero, Túnica, Escolar, Ninja, Noble, Deportivo, Casual, Gótico |

Los colores se muestran ordenados de natural a fantasía y cada muestra tiene su nombre. Las opciones nuevas se añadieron al final de las listas internas para que las partidas guardadas no cambien de aspecto.

## 4. Hábitos

- 17 positivos y 12 malos predefinidos (todos los de la lista del encargo), cada uno con atributo y dificultad sugeridos. Asigné: Meditar → Disciplina; Escribir un diario → Inteligencia; Practicar gratitud → Carisma; Trabajar en un proyecto personal → Disciplina (Difícil).
- Hábitos propios: nombre, positivo/malo, atributo, dificultad, frecuencia (diaria / 1–6 veces por semana / única) e ícono (42 a elegir). Se pueden editar, activar/desactivar y borrar; el historial se conserva en estadísticas.
- Cada hábito se cumple como máximo una vez al día. Los malos se pueden registrar varias veces (cada vez hace daño).
- **Deshacer**: tras marcar un hábito o registrar un mal hábito aparece «Deshacer» durante 6 segundos (restaura el estado exacto anterior). Pensado para toques accidentales.
- Hábitos semanales: la racha cuenta cumplimientos y se pierde si la semana (lunes a domingo) acaba sin llegar a la meta. Se ocultan del día al completar la meta semanal.
- Hábitos únicos: no tienen racha y se archivan al cumplirse.

## 5. Daño, muerte y Legado (modo hardcore)

- **Daño** = `daño_base × (1 − defensa)`, mínimo 1. Defensa = clase + equipo + Disciplina, máximo 60%.
- **Regeneración**: hábitos de Vitalidad curan según su dificultad (+50% Monje); algunas mascotas y objetos curan HP extra en cada hábito; el **Día Perfecto** cura 15% del HP máximo; al terminar cada día se recupera un 5% (descanso). Pociones en la tienda (máx. 3 + 1 grande al día).
- **Día Perfecto** = todos los hábitos diarios activos cumplidos **y** al menos 3 hábitos cumplidos ese día. Da 15 gemas + 15% HP. Exigí el mínimo de 3 para que no baste con tener un solo hábito diario.
- **Romper una racha no hace daño**: solo reinicia el multiplicador. El «Amuleto de Racha» (tienda, máx. 3) protege todas las rachas un día que falles.
- **Advertencias**: barra de HP pulsante y aviso rojo en Inicio por debajo del 25%, aviso emergente al recibir daño en esa zona.
- **Muerte (HP = 0)**: pierde 1 nivel (la XP del nivel vuelve a 0), queda **Caído**: no gana XP, oro, tiradas, compras, bono diario ni avance de misiones. Puede seguir marcando hábitos (cuentan para rachas, estadísticas y el Ritual). Inicio cambia: personaje fantasma en gris, tumba, cielo apagado.
- **Ritual de Resurrección**: 7 días seguidos que cumplan el Día Perfecto **sin ningún mal hábito**. Cuenta desde el día siguiente a la muerte y cada día se evalúa al terminar. Un mal hábito reinicia el progreso a 0 al instante. Al completarlo: revive con 50% de HP y el título «Renacido». La mascota mítica Fénix Eterno acorta el ritual a 5 días (si está equipada).
- **Muerte permanente**: si al terminar el día 14 tras la muerte no se completó el ritual. Se pierden personaje, objetos, gemas, oro, skins y títulos. Se conservan los hábitos (son tu vida real, con las rachas en 0), el historial de estadísticas y el **Legado**:
  - todos los logros obtenidos;
  - +5% de XP permanente por cada héroe caído (máximo +15%);
  - un objeto conmemorativo único: «Lápida de [nombre]» (accesorio Legendario: +3% XP, −5% daño), que el nuevo héroe trae equipado;
  - el «Salón del Legado» con los héroes caídos.

## 6. Gacha

- **Costo**: 50 gemas por tirada, 450 por ×10. Los tickets se usan antes que las gemas.
- **Gemas solo jugando**: niveles, misiones, cofres, logros, rachas, Día Perfecto, bono diario, jefes y eventos. No hay dinero real.
- **Regalo inicial**: 10 tickets (una tirada ×10 gratis), 300 gemas y 200 de oro.
- **Probabilidades base**: Común 60% · Raro 28% · Épico 9% · Legendario 2,7% · Mítico 0,3%.
- **Pity** (contador propio por banner, visible en pantalla):
  - si llevas 9 tiradas sin Épico o superior, la 10.ª es Épico+ garantizado;
  - si llevas 79 sin Legendario o superior, la 80.ª es Legendario+ garantizado (90% Legendario, 10% Mítico, según sus pesos).
- **Banner destacado** (rota cada semana entre 8 combinaciones): cada Legendario tiene 50% de ser el destacado; si pierdes el 50/50, el siguiente Legendario es el destacado garantizado. Los Épicos tienen 50% de ser uno de los 3 destacados.
- **Duplicados → polvo estelar**: Común 5 · Raro 15 · Épico 50 · Legendario 200 · Mítico 500. El polvo sirve para la **Forja** (mejorar objetos hasta +5; cada nivel +20% a todos sus bonus; costo `base_rareza × (nivel+1)`, base 10/25/60/150/300) y para el **Canje de polvo** (tickets, Cofre Legendario por 900, skin y título exclusivos).
- **Ticket Dorado**: un Legendario garantizado. **Cofre Épico**: Épico o superior.

**Verificación por simulación** (`tests/engine.test.js`):
- 1.000.000 de tiradas sin pity: 60,02% / 28,01% / 8,96% / 2,71% / 0,30% (todas dentro del margen).
- 2.000.000 de tiradas reales con pity: nunca hubo más de 10 tiradas sin Épico+ ni más de 80 sin Legendario+; tras perder el 50/50 el siguiente Legendario siempre fue el destacado.
- **Tasa real con pity** (mostrada en la app): Común 56,81% · Raro 26,49% · Épico 12,43% · Legendario 3,85% · Mítico 0,42%.

## 7. Objetos, equipo y mascotas

- 5 rarezas con colores (gris, azul, morado, dorado, arcoíris animado).
- 3 ranuras de equipo (arma, armadura, accesorio) + 1 mascota. Todo se dibuja sobre el personaje: el arma en la mano, la armadura cambia el atuendo, los accesorios (capas, alas, halo, coronas, cuernos, gafas…) se superponen, la mascota flota a su lado.
- Pool del gacha: 24 armas, 19 armaduras, 16 accesorios, 17 mascotas. Incluye un **equipo legendario por clase** (Armadura del Titán, Túnica del Archimago, Gi del Loto Eterno, Casaca del Virtuoso, Armadura Sagrada, Manto de las Sombras, más Báculo del Loto, Martillo del Juicio, Colmillo Umbrío, Diadema de la Musa, Capa del Sombrío y Alas Seráficas). Exclusivos de misiones (no salen en el gacha): 9 objetos y mascotas + la lápida del Legado.
- Bonus posibles: XP por atributo, XP de todo, oro, defensa, crítico, regeneración de HP, daño a jefes y acortar el ritual (solo Fénix).
- Skins (7 atuendos + 3 auras) y 20 títulos cosméticos, con su origen visible.
- Inventario con filtros por tipo y rareza, contador de colección y vista de bonificaciones totales activas.

## 8. Misiones

| Tipo | Cómo funciona | Recompensas |
|---|---|---|
| Diarias | 3 al día elegidas al azar entre 9 plantillas que se adaptan a tus hábitos activos (p. ej. nunca pide 5 hábitos si tienes 3). Puedes cambiar 1 al día. | XP, oro y uno de: gemas (60%), polvo (25%) o ticket (15%). Reclamar las 3 abre el **cofre diario** (30 gemas + objeto o polvo). |
| Semanales | 3 cada lunes, más difíciles. | XP, oro, 60–100 gemas, tickets o polvo. Cofre semanal: 3 tickets + 100 gemas + 50 polvo. |
| Exploración | 2 a la vez, cambian cada 3 días, apuntan a tus atributos más descuidados. Son «prueba algo nuevo» (se confirman con «¡Lo hice!») o «crea un hábito nuevo de X y cúmplelo 2 veces». | XP + XP extra del atributo descuidado + gemas + polvo. A las 5: **Capa del Explorador** (exclusiva). |
| Equilibrio | Ganar `80 + 15 × nivel` XP en tu atributo más bajo. Una a la vez. | XP, oro, gemas, polvo. A las 3: **Medalla del Equilibrio** (exclusiva). |
| Campaña | 10 capítulos con la historia de Lumi y la Bruma de los Vicios. Cada uno tiene 2 objetivos ligados a tu progreso real (nivel, hábitos, rachas, jefes, días limpios…). | Objetos y mascotas exclusivos, skins, títulos, gemas, Ticket Dorado. |
| Jefes | 8 jefes temáticos (Rey Slime de la Pereza, Gólem del Sofá, Hidra de Notificaciones…). Daño = XP del hábito × (1 + bonus de jefe). Un mal hábito lo cura (2 × XP base de su dificultad). Tienes 4–7 días; si escapa, puedes reintentar al día siguiente. Tras el 8.º vuelven más fuertes (+50% por ciclo). | Gemas, oro, tickets y premios únicos (título, Corona del Matajefes, aura Llamas Doradas). |
| Eventos sorpresa | Desde el nivel 4, cada día hay 35% de que aparezca uno (el primero es seguro). 8 eventos de 6–24 h: potenciadores (XP x1,5 de un atributo, oro x2, lluvia de gemas, +15% crítico, tienda −40%) o desafíos (Desafío Relámpago, atrapar al Slime Dorado, Festival de Sakura). | Tickets, gemas, mascota exclusiva Slime Dorado, skin Yukata de Festival. |

HP del jefe = `HP_base × (1 + 0,05 × (nivel − 6)) × (1 + 0,5 × ciclo)`.

## 9. Tiendas

- **Tienda de objetos** (oro, rota cada día de forma determinista): Poción de Vida siempre, 3 consumibles al azar (Gran Poción, Amuleto de Racha, Elixir +25% XP 24 h, Ticket, Bolsa de 60 gemas), 2 equipos Común/Raro/Épico (150/450/1.300 de oro) y a veces una skin.
- **Recompensas reales**: 8 de ejemplo editables (episodio 200, café 250, postre 300, 1 h de videojuegos 400, comida favorita 800, cine 1.500, capricho 2.500, día libre 5.000). Se pueden crear, editar y borrar; cada canje pide confirmación y queda en el historial «Canjeadas».

## 10. Logros, estadísticas y otros

- **64 logros** (10 secretos: Tocado por la Suerte, Inmaculado, Polvo Eres, El Regreso, Hasta la Próxima Vida, Búho Nocturno, Madrugador, Día Oscuro, Al Borde y Viajero del Tiempo), todos con recompensa. Los logros desbloqueados con el héroe muerto guardan su premio para el siguiente héroe.
- **Estadísticas**: indicadores totales, XP por día (14 días), XP por semana (8 semanas), hábitos cumplidos vs. malos hábitos por día, radar de atributos (hoy vs. hace 30 días), calendario tipo mapa de calor (18 semanas, marca días perfectos y días con malos hábitos), rachas actuales y mejores, malos hábitos más registrados. Las gráficas tienen tooltip al tocar o pasar el ratón. La paleta se validó para daltonismo (azul/rojo y ámbar/lavanda).
- **Bono diario** por entrar, ciclo de 7 días.
- **Recordatorios**: notificaciones locales a las horas elegidas si hay hábitos pendientes. Como no hay servidor, solo llegan con la app abierta o en segundo plano; con la app instalada en Chrome Android se registra además una sincronización periódica (el sistema decide cuándo). En iPhone requieren iOS 16.4+ y la app instalada en la pantalla de inicio. La app lo explica en Ajustes.
- **Herramientas de prueba**: tocando 7 veces la línea de versión en Ajustes aparecen botones para avanzar días, subir de nivel, recibir daño, etc. Sirven para probar la muerte y el ritual sin esperar días reales; están ocultas para no tentar a hacer trampa.

## 11. Pruebas realizadas

- `node tests/engine.test.js`: **170 pruebas** del motor (fórmulas, rachas, muerte, ritual, Fénix, muerte permanente y Legado, gacha con 3.000.000 de tiradas simuladas, pity, 50/50, costos, misiones de los 7 tipos, jefes, tiendas, equipo, respaldo, paso de 45 días, hábitos propios, contenido mínimo).
- `python3 tests/e2e.py`: **73 comprobaciones** en Chrome real con pantalla de celular (390×844) usando la interfaz: creación, hábitos, deshacer, subida de nivel, gacha ×10 y mascotas, pity, equipo visible, todas las misiones, jefe derrotado, tiendas, gestión de hábitos, gráficas, logros, persistencia tras recargar, exportar (archivo y portapapeles) e importar (texto y archivo), daño, advertencias, muerte, estado Caído, ritual completo, resurrección, muerte permanente con Legado, textos en español, sin desbordes a 360 px ni en escritorio, service worker activo, instalable sin errores, funcionamiento sin conexión y **cero errores en consola**.
