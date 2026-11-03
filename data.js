/* LifeMOD — contenido del juego (datos estáticos) */
(function (G) {
  'use strict';
  const D = {};

  D.VERSION = 1;

  D.ATTRS = {
    fue: { n: 'Fuerza', short: 'FUE', c: '#ff5a5f', c2: '#b8283a', ic: 'dumbbell', d: 'Ejercicio y actividad física' },
    int: { n: 'Inteligencia', short: 'INT', c: '#4da3ff', c2: '#1f5fbf', ic: 'book', d: 'Estudio, lectura y aprendizaje' },
    vit: { n: 'Vitalidad', short: 'VIT', c: '#3ddc84', c2: '#16935a', ic: 'heart', d: 'Sueño, alimentación e hidratación' },
    dis: { n: 'Disciplina', short: 'DIS', c: '#ffb020', c2: '#c27406', ic: 'shield', d: 'Constancia, rutinas y productividad' },
    car: { n: 'Carisma', short: 'CAR', c: '#ff6ec7', c2: '#c0368f', ic: 'people', d: 'Relaciones, comunicación y vida social' }
  };
  D.ATTR_KEYS = ['fue', 'int', 'vit', 'dis', 'car'];

  D.DIFF = {
    facil: { n: 'Fácil', xp: 15, gold: 6, dmg: 6, heal: 3, c: '#7fd6a4' },
    normal: { n: 'Normal', xp: 25, gold: 10, dmg: 12, heal: 5, c: '#7fb8ff' },
    dificil: { n: 'Difícil', xp: 40, gold: 16, dmg: 20, heal: 8, c: '#c58bff' },
    epico: { n: 'Épico', xp: 70, gold: 28, dmg: 32, heal: 12, c: '#ffc94d' }
  };
  D.DIFF_KEYS = ['facil', 'normal', 'dificil', 'epico'];

  D.RARITY = [
    { id: 'comun', n: 'Común', c: '#a9b3c6', c2: '#5d6780', w: 60, dust: 5, upg: 10, star: 1 },
    { id: 'raro', n: 'Raro', c: '#3fa0ff', c2: '#1b4fa8', w: 28, dust: 15, upg: 25, star: 2 },
    { id: 'epico', n: 'Épico', c: '#b45cff', c2: '#6420b0', w: 9, dust: 50, upg: 60, star: 3 },
    { id: 'legendario', n: 'Legendario', c: '#ffc12e', c2: '#b8740a', w: 2.7, dust: 200, upg: 150, star: 4 },
    { id: 'mitico', n: 'Mítico', c: '#ff5ad1', c2: '#5a2bd6', w: 0.3, dust: 500, upg: 300, star: 5 }
  ];

  D.STREAK_TIERS = [[100, 1.8], [60, 1.65], [30, 1.5], [14, 1.35], [7, 1.25], [3, 1.1]];
  D.STREAK_GEMS = { 7: 20, 14: 35, 30: 80, 60: 150, 100: 300 };

  D.CLASSES = {
    guerrero: { n: 'Guerrero', ic: 'sword', weapon: 'sword', c: '#ff5a5f', b: { xp: { fue: 0.2 }, boss: 0.25 },
      pas: 'Furia: +25% de daño a jefes', bon: '+20% XP de Fuerza', d: 'Forja su cuerpo como acero. Brilla contra los jefes.' },
    mago: { n: 'Mago', ic: 'staff', weapon: 'staff', c: '#4da3ff', b: { xp: { int: 0.2 }, mission: 0.15 },
      pas: 'Erudición: +15% XP de misiones', bon: '+20% XP de Inteligencia', d: 'Convierte cada página en poder arcano.' },
    monje: { n: 'Monje', ic: 'lotus', weapon: 'staff', c: '#3ddc84', b: { xp: { vit: 0.12, dis: 0.12 }, heal: 0.5 },
      pas: 'Serenidad: +50% de curación con hábitos de Vitalidad', bon: '+12% XP de Vitalidad y Disciplina', d: 'Cuerpo en calma, mente de hierro.' },
    bardo: { n: 'Bardo', ic: 'music', weapon: 'lute', c: '#ff6ec7', b: { xp: { car: 0.2 }, gold: 0.15 },
      pas: 'Encanto: +15% de oro de todas las fuentes', bon: '+20% XP de Carisma', d: 'Su voz abre puertas y bolsillos.' },
    paladin: { n: 'Paladín', ic: 'shield', weapon: 'hammer', c: '#ffb020', b: { xp: { dis: 0.12 }, def: 0.2 },
      pas: 'Égida: −20% de daño recibido por malos hábitos', bon: '+12% XP de Disciplina', d: 'Un muro sagrado contra las tentaciones.' },
    picaro: { n: 'Pícaro', ic: 'dagger', weapon: 'dagger', c: '#a78bfa', b: { xp: { fue: 0.1, car: 0.1 }, crit: 0.12 },
      pas: 'Fortuna: +12% de probabilidad de golpe crítico (XP x2)', bon: '+10% XP de Fuerza y Carisma', d: 'La suerte favorece a los audaces.' }
  };
  /* Héroe de muestra al elegir clase: nivel 99 con equipo legendario de su clase */
  D.CLASS_SHOWCASE = {
    guerrero: { eq: { weapon: 'w_excalibur', armor: 'r_titan', accessory: 'x_matajefes', pet: 'x_obsidiana' }, aura: 'au_llamas', title: 'Matadioses', look: { skin: 4, face: 5, eyes: 1, eyeColor: 6, hair: 1, hairColor: 3, outfit: 0 } },
    mago: { eq: { weapon: 'w_archimago', armor: 'r_archimago', accessory: 'a_estrellas', pet: 'p_leviatan' }, aura: 'au_estelar', title: 'Archimago Eterno', look: { skin: 0, face: 2, eyes: 3, eyeColor: 2, hair: 2, hairColor: 6, outfit: 1 } },
    monje: { eq: { weapon: 'w_loto', armor: 'r_loto', accessory: 'a_halo', pet: 'p_fenix' }, aura: 'au_arcoiris', title: 'Iluminado', look: { skin: 8, face: 0, eyes: 5, eyeColor: 9, hair: 8, hairColor: 0, outfit: 3 } },
    bardo: { eq: { weapon: 'w_orfeo', armor: 'r_virtuoso', accessory: 'a_musa', pet: 'p_kirin' }, aura: 'au_estelar', title: 'Voz de las Estrellas', look: { skin: 5, face: 4, eyes: 2, eyeColor: 4, hair: 7, hairColor: 11, outfit: 4 } },
    paladin: { eq: { weapon: 'w_juicio', armor: 'r_sagrada', accessory: 'a_serafin', pet: 'p_dragon' }, aura: 'au_arcoiris', title: 'Escudo del Reino', look: { skin: 1, face: 3, eyes: 0, eyeColor: 0, hair: 4, hairColor: 2, outfit: 4 } },
    picaro: { eq: { weapon: 'w_colmillo', armor: 'r_sombra', accessory: 'a_capasombra', pet: 'p_tanuki' }, aura: 'au_estelar', title: 'Fantasma de Medianoche', look: { skin: 6, face: 2, eyes: 4, eyeColor: 7, hair: 3, hairColor: 0, outfit: 3 } }
  };
  D.CLASS_KEYS = ['guerrero', 'mago', 'monje', 'bardo', 'paladin', 'picaro'];

  /* Apariencia */
  D.LOOK = {
    // Las opciones nuevas se añaden al final para no cambiar el aspecto de partidas guardadas; *Order define el orden en pantalla.
    skin: ['#ffe3cf', '#f8cfae', '#eab48a', '#d29a6a', '#b07548', '#8a5534', '#64391f', '#dbe8ff', '#c9a27a', '#4a2818'],
    skinNames: ['Porcelana', 'Clara', 'Melocotón', 'Trigo', 'Canela', 'Cacao', 'Ébano', 'Élfica', 'Oliva', 'Profundo'],
    skinOrder: [0, 1, 2, 8, 3, 4, 5, 6, 9, 7],
    face: ['ovalada', 'redonda', 'afilada', 'ancha', 'corazon', 'cuadrada'],
    faceNames: ['Ovalada', 'Redonda', 'Afilada', 'Ancha', 'Corazón', 'Cuadrada'],
    eyes: ['brillantes', 'afilados', 'alegres', 'serenos', 'felinos', 'almendrados', 'redondos'],
    eyesNames: ['Brillantes', 'Afilados', 'Alegres', 'Serenos', 'Felinos', 'Almendrados', 'Redondos'],
    eyeColor: ['#3a7bff', '#20b46c', '#8b4dff', '#ff4f7b', '#d09020', '#6a4428', '#e0372f', '#1fc6d6', '#7d8aa0', '#2a1c18'],
    eyeColorNames: ['Azul', 'Verde', 'Violeta', 'Rosa', 'Ámbar', 'Café', 'Rojo', 'Turquesa', 'Gris', 'Negro'],
    eyeColorOrder: [9, 5, 4, 1, 0, 8, 7, 2, 3, 6],
    hair: ['corto', 'puntiagudo', 'largo', 'coleta', 'bob', 'dosColetas', 'mono', 'rizado', 'rapado'],
    hairNames: ['Corto', 'Puntiagudo', 'Largo', 'Coleta', 'Bob', 'Dos coletas', 'Moño', 'Rizado / afro', 'Rapado'],
    hairColor: ['#2b2238', '#6b3e26', '#f2c94c', '#d6452f', '#ff8fc8', '#3d7dff', '#c9d1e6', '#3fbf7f', '#8f5bff', '#f6f3ff', '#a8743f', '#7a2a24'],
    hairColorNames: ['Negro', 'Castaño', 'Rubio', 'Pelirrojo', 'Rosa', 'Azul', 'Plateado', 'Verde', 'Morado', 'Blanco', 'Castaño claro', 'Caoba'],
    hairColorOrder: [0, 1, 10, 11, 2, 3, 6, 9, 4, 5, 7, 8],
    outfit: ['aventurero', 'tunica', 'escolar', 'ninja', 'noble', 'deportivo', 'casual', 'gotico'],
    outfitNames: ['Aventurero', 'Túnica', 'Escolar', 'Ninja', 'Noble', 'Deportivo', 'Casual', 'Gótico']
  };
  D.OUTFIT_LOOK = {
    aventurero: { st: 'tunic', c1: '#3f9b5a', c2: '#7a4a2a', tr: '#f2c14e' },
    tunica: { st: 'robe', c1: '#3b5bdb', c2: '#f1e6c8', tr: '#ffd25e' },
    escolar: { st: 'coat', c1: '#25335e', c2: '#f4f4f8', tr: '#e8394b' },
    ninja: { st: 'kimono', c1: '#2d2a3e', c2: '#53476e', tr: '#e8394b' },
    noble: { st: 'coat', c1: '#a8243a', c2: '#f6e7c1', tr: '#ffcf4a' },
    deportivo: { st: 'tunic', c1: '#ff7a2f', c2: '#2a2f45', tr: '#ffffff' },
    casual: { st: 'tunic', c1: '#e8e2d6', c2: '#3b5a8f', tr: '#c9a46a' },
    gotico: { st: 'coat', c1: '#1c1424', c2: '#6a1a2e', tr: '#b9b4c8' }
  };

  /* Hábitos predefinidos */
  D.HABITS = [
    { id: 'ejercicio', n: 'Hacer ejercicio', type: 'good', a: 'fue', d: 'normal', ic: 'dumbbell' },
    { id: 'caminar', n: 'Caminar 30 min', type: 'good', a: 'fue', d: 'facil', ic: 'shoe' },
    { id: 'leer', n: 'Leer', type: 'good', a: 'int', d: 'facil', ic: 'book' },
    { id: 'estudiar', n: 'Estudiar', type: 'good', a: 'int', d: 'normal', ic: 'grad' },
    { id: 'meditar', n: 'Meditar', type: 'good', a: 'dis', d: 'facil', ic: 'lotus' },
    { id: 'dormir', n: 'Dormir 7-8 horas', type: 'good', a: 'vit', d: 'normal', ic: 'moon' },
    { id: 'agua', n: 'Tomar agua', type: 'good', a: 'vit', d: 'facil', ic: 'drop' },
    { id: 'saludable', n: 'Comer saludable', type: 'good', a: 'vit', d: 'normal', ic: 'apple' },
    { id: 'temprano', n: 'Levantarse temprano', type: 'good', a: 'dis', d: 'normal', ic: 'sun' },
    { id: 'cama', n: 'Hacer la cama', type: 'good', a: 'dis', d: 'facil', ic: 'bed' },
    { id: 'ordenar', n: 'Ordenar / limpiar', type: 'good', a: 'dis', d: 'facil', ic: 'broom' },
    { id: 'proyecto', n: 'Trabajar en un proyecto personal', type: 'good', a: 'dis', d: 'dificil', ic: 'rocket' },
    { id: 'aprender', n: 'Aprender algo nuevo', type: 'good', a: 'int', d: 'normal', ic: 'bulb' },
    { id: 'llamar', n: 'Llamar a un ser querido', type: 'good', a: 'car', d: 'facil', ic: 'phone' },
    { id: 'socializar', n: 'Socializar', type: 'good', a: 'car', d: 'normal', ic: 'people' },
    { id: 'diario', n: 'Escribir un diario', type: 'good', a: 'int', d: 'facil', ic: 'pen' },
    { id: 'gratitud', n: 'Practicar gratitud', type: 'good', a: 'car', d: 'facil', ic: 'heart' },
    { id: 'redes', n: 'Exceso de redes sociales', type: 'bad', a: 'dis', d: 'normal', ic: 'social' },
    { id: 'fumar', n: 'Fumar', type: 'bad', a: 'vit', d: 'dificil', ic: 'cig' },
    { id: 'alcohol', n: 'Alcohol en exceso', type: 'bad', a: 'vit', d: 'dificil', ic: 'glass' },
    { id: 'chatarra', n: 'Comida chatarra', type: 'bad', a: 'vit', d: 'normal', ic: 'burger' },
    { id: 'procrastinar', n: 'Procrastinar', type: 'bad', a: 'dis', d: 'normal', ic: 'hourglass' },
    { id: 'desvelarse', n: 'Desvelarse', type: 'bad', a: 'vit', d: 'normal', ic: 'owl' },
    { id: 'pantallas', n: 'Exceso de videojuegos / series', type: 'bad', a: 'dis', d: 'normal', ic: 'gamepad' },
    { id: 'gastos', n: 'Gastos impulsivos', type: 'bad', a: 'dis', d: 'normal', ic: 'wallet' },
    { id: 'saltarse', n: 'Saltarse comidas', type: 'bad', a: 'vit', d: 'facil', ic: 'plate' },
    { id: 'sedentario', n: 'Sedentarismo prolongado', type: 'bad', a: 'fue', d: 'facil', ic: 'couch' },
    { id: 'peleas', n: 'Decir groserías / peleas', type: 'bad', a: 'car', d: 'normal', ic: 'bolt' },
    { id: 'celular', n: 'Mirar el celular al despertar', type: 'bad', a: 'dis', d: 'facil', ic: 'phonewake' }
  ];
  /* Hábitos recomendados por clase al crear el personaje */
  D.CLASS_STARTERS = {
    guerrero: ['ejercicio', 'caminar', 'agua', 'dormir', 'leer', 'llamar'],
    mago: ['leer', 'estudiar', 'aprender', 'agua', 'dormir', 'caminar'],
    monje: ['meditar', 'dormir', 'agua', 'saludable', 'cama', 'gratitud'],
    bardo: ['llamar', 'socializar', 'gratitud', 'agua', 'leer', 'caminar'],
    paladin: ['temprano', 'cama', 'ordenar', 'proyecto', 'agua', 'ejercicio'],
    picaro: ['ejercicio', 'socializar', 'aprender', 'agua', 'caminar', 'gratitud']
  };
  D.BAD_STARTERS = ['redes', 'chatarra', 'procrastinar'];

  D.ICON_CHOICES = ['star', 'dumbbell', 'shoe', 'book', 'grad', 'lotus', 'moon', 'drop', 'apple', 'sun', 'bed', 'broom', 'rocket', 'bulb', 'phone',
    'people', 'pen', 'heart', 'music', 'code', 'paint', 'leaf', 'flame', 'coin', 'cig', 'glass', 'burger', 'hourglass', 'owl', 'gamepad',
    'wallet', 'plate', 'couch', 'bolt', 'phonewake', 'social', 'gift', 'film', 'cake', 'ticket', 'crown', 'tea'];

  /* ---------- Objetos ---------- */
  // b: bonus  xp:{attr:%} all:% gold:% def:% crit:% regen:HP por hábito boss:% ritual:días menos
  const I = [];
  const add = (id, n, slot, r, b, look, src, d) => I.push({ id, n, slot, r, b, look, src: src || 'gacha', d: d || '' });
  // Armas
  add('w_madera', 'Espada de Madera', 'weapon', 0, { xp: { fue: 0.04 } }, { t: 'sword', c1: '#c08a52', c2: '#8a5a2b' }, 0, 'Todo héroe empieza en algún lugar.');
  add('w_aprendiz', 'Báculo de Aprendiz', 'weapon', 0, { xp: { int: 0.04 } }, { t: 'staff', c1: '#9c6b3f', c2: '#7fc8ff' }, 0, 'Huele a biblioteca vieja.');
  add('w_daga', 'Daga Oxidada', 'weapon', 0, { crit: 0.02 }, { t: 'dagger', c1: '#a88f7a', c2: '#6b4b34' }, 0, 'Afilada por la suerte, no por el herrero.');
  add('w_laud', 'Laúd Viejo', 'weapon', 0, { xp: { car: 0.04 } }, { t: 'lute', c1: '#b5773e', c2: '#6e3f1c' }, 0, 'Tres cuerdas y mucho corazón.');
  add('w_martillo', 'Martillo de Herrero', 'weapon', 0, { xp: { dis: 0.04 } }, { t: 'hammer', c1: '#8d96a8', c2: '#7a4a2a' }, 0, 'Golpe a golpe, día a día.');
  add('w_acero', 'Espada de Acero Azul', 'weapon', 1, { xp: { fue: 0.07 } }, { t: 'sword', c1: '#7fc4ff', c2: '#2a5ea8' }, 0, 'Templada en agua de glaciar.');
  add('w_cristal', 'Báculo de Cristal', 'weapon', 1, { xp: { int: 0.07 } }, { t: 'staff', c1: '#5b6fd6', c2: '#8ff0ff' }, 0, 'Refleja ideas que aún no tienes.');
  add('w_arco', 'Arco del Bosque', 'weapon', 1, { xp: { vit: 0.07 } }, { t: 'bow', c1: '#5aa65a', c2: '#e8d8a8' }, 0, 'Tallado de un roble que nunca enfermó.');
  add('w_trovador', 'Laúd del Trovador', 'weapon', 1, { xp: { car: 0.07 }, gold: 0.03 }, { t: 'lute', c1: '#e05a8a', c2: '#7a2a4a' }, 0, 'Cada nota vale una moneda.');
  add('w_lanza', 'Lanza del Centinela', 'weapon', 1, { xp: { dis: 0.07 } }, { t: 'spear', c1: '#c9d3e6', c2: '#3d63c9' }, 0, 'Nunca duerme en su guardia.');
  add('w_katana', 'Katana Sakura', 'weapon', 2, { xp: { fue: 0.1 }, crit: 0.04 }, { t: 'katana', c1: '#ffd1e8', c2: '#d6336c' }, 0, 'Corta pétalos en el aire.');
  add('w_grimorio', 'Grimorio Arcano', 'weapon', 2, { xp: { int: 0.1 }, all: 0.03 }, { t: 'tome', c1: '#7b3fe4', c2: '#ffd25e' }, 0, 'Sus páginas se escriben solas.');
  add('w_lunar', 'Arco Lunar', 'weapon', 2, { xp: { vit: 0.1 }, regen: 1 }, { t: 'bow', c1: '#c9d6ff', c2: '#6a7bff' }, 0, 'Sus flechas sanan a quien las dispara.');
  add('w_runico', 'Martillo Rúnico', 'weapon', 2, { xp: { dis: 0.1 }, def: 0.04 }, { t: 'hammer', c1: '#4fd1c5', c2: '#2c3e66' }, 0, 'Las runas brillan con cada promesa cumplida.');
  add('w_flauta', 'Flauta Encantada', 'weapon', 2, { xp: { car: 0.1 }, gold: 0.05 }, { t: 'flute', c1: '#b58cff', c2: '#ffd25e' }, 0, 'Hasta los slimes bailan.');
  add('w_excalibur', 'Excalibur Solar', 'weapon', 3, { xp: { fue: 0.15 }, all: 0.05, crit: 0.05 }, { t: 'sword', c1: '#fff1a8', c2: '#ffb000', glow: 1 }, 0, 'Arde con la luz de mil amaneceres.');
  add('w_archimago', 'Báculo del Archimago', 'weapon', 3, { xp: { int: 0.15 }, all: 0.05 }, { t: 'staff', c1: '#2b1a5e', c2: '#ffdf5e', glow: 1 }, 0, 'Perteneció a quien leyó todos los libros.');
  add('w_orfeo', 'Arpa de Orfeo', 'weapon', 3, { xp: { car: 0.15 }, gold: 0.1 }, { t: 'harp', c1: '#ffd25e', c2: '#ff8fc8', glow: 1 }, 0, 'Su música convence hasta al destino.');
  add('w_guadana', 'Guadaña del Alba', 'weapon', 3, { xp: { dis: 0.15 }, boss: 0.15 }, { t: 'scythe', c1: '#ffe9c2', c2: '#ff7a2f', glow: 1 }, 0, 'Siega la pereza de raíz.');
  add('w_genesis', 'Espada del Génesis', 'weapon', 4, { all: 0.15, crit: 0.08, boss: 0.2 }, { t: 'sword', c1: '#ffffff', c2: '#ff5ad1', glow: 2 }, 0, 'Forjada en el primer día del mundo.');
  add('w_infinito', 'Cetro del Infinito', 'weapon', 4, { all: 0.15, gold: 0.15 }, { t: 'scepter', c1: '#7df9ff', c2: '#8a2be2', glow: 2 }, 0, 'Contiene una galaxia diminuta.');
  // Armaduras
  add('r_lino', 'Túnica de Lino', 'armor', 0, { xp: { vit: 0.04 } }, { st: 'tunic', c1: '#d9c7a3', c2: '#8a6a45', tr: '#6b4a2a' }, 0, 'Cómoda y honesta.');
  add('r_cuero', 'Chaleco de Cuero', 'armor', 0, { xp: { fue: 0.04 } }, { st: 'tunic', c1: '#8a5a33', c2: '#4b3020', tr: '#c9a46a' }, 0, 'Curtido por el sol del camino.');
  add('r_estudiante', 'Ropa de Estudiante', 'armor', 0, { xp: { int: 0.04 } }, { st: 'coat', c1: '#4a5a8a', c2: '#e8e8f0', tr: '#ffd25e' }, 0, 'Tiene manchas de tinta.');
  add('r_malla', 'Cota de Malla', 'armor', 1, { def: 0.06 }, { st: 'plate', c1: '#9aa6bd', c2: '#5c6680', tr: '#d9dfeb' }, 0, 'Mil anillos, mil promesas.');
  add('r_toga', 'Toga del Sabio', 'armor', 1, { xp: { int: 0.06 }, def: 0.03 }, { st: 'robe', c1: '#2f6fd6', c2: '#e9f1ff', tr: '#ffd25e' }, 0, 'Bordada con constelaciones.');
  add('r_ligera', 'Armadura Ligera', 'armor', 1, { xp: { fue: 0.06 }, def: 0.03 }, { st: 'plate', c1: '#d65a5a', c2: '#5c2a2a', tr: '#ffd25e' }, 0, 'Para quien prefiere moverse.');
  add('r_kimono', 'Kimono de Viaje', 'armor', 1, { xp: { vit: 0.06 } }, { st: 'kimono', c1: '#2fa58a', c2: '#e9fff5', tr: '#ff7a59' }, 0, 'Ligero como la brisa de montaña.');
  add('r_guardian', 'Armadura del Guardián', 'armor', 2, { def: 0.12 }, { st: 'plate', c1: '#3d63c9', c2: '#1d2f66', tr: '#ffd25e' }, 0, 'Resiste cualquier tentación.');
  add('r_astral', 'Túnica Astral', 'armor', 2, { xp: { int: 0.08 }, def: 0.06 }, { st: 'robe', c1: '#3b1f7a', c2: '#a78bfa', tr: '#7df9ff' }, 0, 'Las estrellas se mueven en su tela.');
  add('r_gi', 'Gi del Maestro', 'armor', 2, { xp: { vit: 0.08, dis: 0.08 } }, { st: 'kimono', c1: '#f4f4f8', c2: '#2b2238', tr: '#e8394b' }, 0, 'Mil horas de práctica cosidas.');
  add('r_draconica', 'Armadura Dracónica', 'armor', 3, { def: 0.18, xp: { fue: 0.1 } }, { st: 'plate', c1: '#b3202f', c2: '#3a0d14', tr: '#ffc12e', glow: 1 }, 0, 'Escamas de un dragón que eligió ayudarte.');
  add('r_oraculo', 'Manto del Oráculo', 'armor', 3, { all: 0.08, def: 0.1 }, { st: 'robe', c1: '#f6f0ff', c2: '#8a6bd6', tr: '#ffc12e', glow: 1 }, 0, 'Ve tus hábitos antes que tú.');
  add('r_egida', 'Égida Celestial', 'armor', 4, { def: 0.25, all: 0.1, regen: 2 }, { st: 'plate', c1: '#ffffff', c2: '#7dd3ff', tr: '#ff5ad1', glow: 2 }, 0, 'Brilla como la primera estrella.');
  // Accesorios
  add('a_bufanda', 'Bufanda Roja', 'accessory', 0, { xp: { car: 0.04 } }, { t: 'scarf', c1: '#e8394b' }, 0, 'Abrigada como un abrazo.');
  add('a_amuleto', 'Amuleto de Piedra', 'accessory', 0, { def: 0.03 }, { t: 'amulet', c1: '#8d96a8' }, 0, 'Pesa poco, protege algo.');
  add('a_gafas', 'Gafas de Lectura', 'accessory', 0, { xp: { int: 0.04 } }, { t: 'glasses', c1: '#5a4a3a' }, 0, 'Para las letras pequeñas.');
  add('a_diadema', 'Diadema Plateada', 'accessory', 1, { xp: { dis: 0.06 } }, { t: 'circlet', c1: '#d9dfeb' }, 0, 'Enfoca la mente.');
  add('a_pendientes', 'Pendientes de Luna', 'accessory', 1, { xp: { car: 0.06 } }, { t: 'earrings', c1: '#bfe3ff' }, 0, 'Brillan cuando sonríes.');
  add('a_capa', 'Capa de Viajero', 'accessory', 1, { xp: { vit: 0.06 }, def: 0.02 }, { t: 'cape', c1: '#3f7a5a' }, 0, 'Ha visto muchos caminos.');
  add('a_cuernos', 'Cuernos de Oni', 'accessory', 1, { xp: { fue: 0.06 }, crit: 0.02 }, { t: 'horns', c1: '#ff5a5f' }, 0, 'Pequeños pero feroces.');
  add('a_laurel', 'Corona de Laurel', 'accessory', 2, { all: 0.05, gold: 0.05 }, { t: 'laurel', c1: '#5fbf4a' }, 0, 'Para quien gana todos los días.');
  add('a_hada', 'Alas de Hada', 'accessory', 2, { xp: { vit: 0.08 }, regen: 1 }, { t: 'wings', c1: '#9ff0ff' }, 0, 'Revolotean con cada vaso de agua.');
  add('a_carmesi', 'Capa Carmesí', 'accessory', 2, { xp: { fue: 0.08 }, crit: 0.04 }, { t: 'cape', c1: '#c1121f' }, 0, 'Ondea aunque no haya viento.');
  add('a_halo', 'Halo Divino', 'accessory', 3, { all: 0.1, def: 0.05 }, { t: 'halo', c1: '#ffe066' }, 0, 'Un premio a la constancia.');
  add('a_fenix', 'Alas de Fénix', 'accessory', 3, { all: 0.08, regen: 2 }, { t: 'wings', c1: '#ff7a2f', c2: '#ffd25e' }, 0, 'Renacen cada mañana.');
  add('a_estrellas', 'Corona de las Estrellas', 'accessory', 4, { all: 0.15, gold: 0.15, crit: 0.05 }, { t: 'crown', c1: '#fff3a8', c2: '#ff5ad1' }, 0, 'El cielo nocturno te reconoce.');
  // Mascotas
  add('p_slime', 'Slime Verde', 'pet', 0, { xp: { vit: 0.04 } }, { sp: 'slime', c1: '#7be08a', c2: '#3aa55a' }, 0, 'Rebota de alegría.');
  add('p_pollito', 'Pollito', 'pet', 0, { xp: { car: 0.04 } }, { sp: 'chick', c1: '#ffe066', c2: '#ff9f1c' }, 0, '¡Pío! Le cae bien a todos.');
  add('p_raton', 'Ratón Lector', 'pet', 0, { xp: { int: 0.04 } }, { sp: 'mouse', c1: '#c9c3d6', c2: '#ff9fb8' }, 0, 'Se come los libros... con los ojos.');
  add('p_tortuga', 'Tortuga Paciente', 'pet', 0, { def: 0.03 }, { sp: 'turtle', c1: '#7cc576', c2: '#8a5a33' }, 0, 'Lento pero seguro.');
  add('p_gato', 'Gato Mágico', 'pet', 1, { xp: { int: 0.07 } }, { sp: 'cat', c1: '#4b4b6b', c2: '#ffd25e' }, 0, 'Sabe hechizos, no los comparte.');
  add('p_buho', 'Búho Sabio', 'pet', 1, { xp: { int: 0.05, dis: 0.05 } }, { sp: 'owl', c1: '#a07850', c2: '#f2e2c4' }, 0, 'Te recuerda irte a dormir.');
  add('p_perro', 'Perro Leal', 'pet', 1, { xp: { fue: 0.07 } }, { sp: 'dog', c1: '#d9a066', c2: '#fff1d6' }, 0, 'Siempre listo para salir a correr.');
  add('p_conejo', 'Conejo Lunar', 'pet', 1, { xp: { vit: 0.07 }, regen: 1 }, { sp: 'bunny', c1: '#f4f0ff', c2: '#ffb3d1' }, 0, 'Prepara mochis curativos.');
  add('p_zorro', 'Zorro de Fuego', 'pet', 2, { xp: { fue: 0.1 }, crit: 0.04 }, { sp: 'fox', c1: '#ff7a2f', c2: '#fff1d6' }, 0, 'Su cola arde de entusiasmo.');
  add('p_lobo', 'Lobo de Plata', 'pet', 2, { xp: { dis: 0.1 }, def: 0.05 }, { sp: 'wolf', c1: '#c9d1e6', c2: '#6a7591' }, 0, 'Aúlla a las promesas cumplidas.');
  add('p_pixie', 'Hada Pixie', 'pet', 2, { xp: { car: 0.1 }, gold: 0.05 }, { sp: 'fairy', c1: '#ff8fc8', c2: '#9ff0ff' }, 0, 'Esparce polvo de risa.');
  add('p_ajolote', 'Ajolote Kawaii', 'pet', 2, { xp: { vit: 0.1 }, regen: 2 }, { sp: 'axolotl', c1: '#ffb3d1', c2: '#ff5a8a' }, 0, 'Regenera todo, hasta tu ánimo.');
  add('p_dragon', 'Dragón Bebé', 'pet', 3, { all: 0.1, boss: 0.15 }, { sp: 'dragon', c1: '#5fd38d', c2: '#ffd25e' }, 0, 'Pequeño hoy, leyenda mañana.');
  add('p_kirin', 'Kirin Celeste', 'pet', 3, { all: 0.08, gold: 0.1 }, { sp: 'kirin', c1: '#bfe3ff', c2: '#ffd25e' }, 0, 'Trae buena fortuna a su paso.');
  add('p_tanuki', 'Tanuki Dorado', 'pet', 3, { gold: 0.2, crit: 0.05 }, { sp: 'tanuki', c1: '#e0a040', c2: '#5a3a22' }, 0, 'Huele el oro a kilómetros.');
  add('p_fenix', 'Fénix Eterno', 'pet', 4, { all: 0.15, regen: 3, ritual: 2 }, { sp: 'phoenix', c1: '#ff5a2f', c2: '#ffe066' }, 0, 'Acorta el Ritual de Resurrección 2 días.');
  add('p_leviatan', 'Leviatán Cósmico', 'pet', 4, { all: 0.15, def: 0.15 }, { sp: 'leviathan', c1: '#3a2bd6', c2: '#7df9ff' }, 0, 'Nada entre las estrellas.');
  // Equipo legendario de clase (el que luce el héroe de muestra al elegir clase)
  add('r_titan', 'Armadura del Titán', 'armor', 3, { def: 0.15, xp: { fue: 0.12 } }, { st: 'plate', c1: '#c0283a', c2: '#3a1a1e', tr: '#ffc12e', glow: 1 }, 0, 'Forjada para quien carga montañas cada mañana.');
  add('r_archimago', 'Túnica del Archimago', 'armor', 3, { xp: { int: 0.15 }, all: 0.05 }, { st: 'robe', c1: '#1e2a8a', c2: '#c9d6ff', tr: '#ffd25e', pat: 'stars', glow: 1 }, 0, 'Bordada con mil hechizos aprendidos.');
  add('r_loto', 'Gi del Loto Eterno', 'armor', 3, { xp: { vit: 0.12, dis: 0.12 } }, { st: 'kimono', c1: '#f6f4ec', c2: '#2fa58a', tr: '#ffc12e', glow: 1 }, 0, 'Quien lo viste respira en calma absoluta.');
  add('r_virtuoso', 'Casaca del Virtuoso', 'armor', 3, { xp: { car: 0.15 }, gold: 0.1 }, { st: 'coat', c1: '#b0236e', c2: '#fff1d6', tr: '#ffc12e', glow: 1 }, 0, 'Su sola entrada en escena arranca aplausos.');
  add('r_sagrada', 'Armadura Sagrada', 'armor', 3, { def: 0.2, xp: { dis: 0.1 } }, { st: 'plate', c1: '#f4f6ff', c2: '#c9a43a', tr: '#ffd25e', glow: 1 }, 0, 'Brilla más cuanto más firme es tu voluntad.');
  add('r_sombra', 'Manto de las Sombras', 'armor', 3, { crit: 0.08, xp: { fue: 0.08, car: 0.08 } }, { st: 'kimono', c1: '#1b1830', c2: '#3a2a6a', tr: '#7df9ff', glow: 1 }, 0, 'Nadie lo ve llegar. Nadie lo ve rendirse.');
  add('w_loto', 'Báculo del Loto', 'weapon', 3, { xp: { vit: 0.12, dis: 0.12 } }, { t: 'staff', c1: '#2fa58a', c2: '#ffe9f2', glow: 1 }, 0, 'Florece con cada respiración profunda.');
  add('w_juicio', 'Martillo del Juicio', 'weapon', 3, { xp: { dis: 0.15 }, def: 0.06 }, { t: 'hammer', c1: '#f4f6ff', c2: '#c9a43a', glow: 1 }, 0, 'Cae solo sobre las excusas.');
  add('w_colmillo', 'Colmillo Umbrío', 'weapon', 3, { crit: 0.1, xp: { fue: 0.06, car: 0.06 } }, { t: 'dagger', c1: '#7df9ff', c2: '#2b2238', glow: 1 }, 0, 'Corta en silencio, acierta siempre.');
  add('a_musa', 'Diadema de la Musa', 'accessory', 3, { xp: { car: 0.12 }, gold: 0.08 }, { t: 'circlet', c1: '#ffc12e' }, 0, 'Inspira a todo el que te escucha.');
  add('a_capasombra', 'Capa del Sombrío', 'accessory', 3, { crit: 0.06, all: 0.06 }, { t: 'cape', c1: '#2b1a4a' }, 0, 'Se funde con la noche.');
  add('a_serafin', 'Alas Seráficas', 'accessory', 3, { def: 0.08, all: 0.06 }, { t: 'wings', c1: '#ffffff', c2: '#ffe066' }, 0, 'Protegen a quien protege a otros.');
  // Exclusivos de misiones (no salen en el gacha)
  add('x_primerpaso', 'Espada del Primer Paso', 'weapon', 1, { xp: { fue: 0.05 }, all: 0.02 }, { t: 'sword', c1: '#ffe9a8', c2: '#3fa0ff' }, 'mission', 'Recompensa del Capítulo 1. Exclusiva.');
  add('x_grifo', 'Grifo Aprendiz', 'pet', 2, { xp: { int: 0.08, dis: 0.08 } }, { sp: 'griffin', c1: '#f2c14e', c2: '#ffffff' }, 'mission', 'Recompensa del Capítulo 4. Exclusiva.');
  add('x_gema', 'Gema del Equilibrio', 'accessory', 2, { all: 0.06 }, { t: 'amulet', c1: '#3ddc84', c2: '#ff6ec7' }, 'mission', 'Recompensa del Capítulo 6. Exclusiva.');
  add('x_peregrino', 'Manto del Peregrino', 'armor', 3, { def: 0.15, all: 0.08 }, { st: 'robe', c1: '#5a3a7a', c2: '#ffe9c2', tr: '#ffc12e', glow: 1 }, 'mission', 'Recompensa del Capítulo 8. Exclusiva.');
  add('x_obsidiana', 'Dragón de Obsidiana', 'pet', 3, { all: 0.12, boss: 0.2 }, { sp: 'dragon', c1: '#2b2238', c2: '#ff5a2f' }, 'mission', 'Recompensa final de la Campaña. Exclusiva.');
  add('x_matajefes', 'Corona del Matajefes', 'accessory', 3, { boss: 0.25, all: 0.06 }, { t: 'crown', c1: '#ff5a5f', c2: '#ffc12e' }, 'mission', 'Por derrotar al Lich del Desvelo. Exclusiva.');
  add('x_explorador', 'Capa del Explorador', 'accessory', 2, { all: 0.05, crit: 0.03 }, { t: 'cape', c1: '#2f8f9d' }, 'mission', 'Por completar 5 misiones de Exploración. Exclusiva.');
  add('x_medalla', 'Medalla del Equilibrio', 'accessory', 1, { all: 0.04 }, { t: 'amulet', c1: '#ffb020', c2: '#4da3ff' }, 'mission', 'Por completar 3 misiones de Equilibrio. Exclusiva.');
  add('x_slimedorado', 'Slime Dorado', 'pet', 2, { gold: 0.15, crit: 0.03 }, { sp: 'slime', c1: '#ffe066', c2: '#e0a020' }, 'mission', 'Atrapado en un evento sorpresa. Exclusivo.');
  add('x_memorial', 'Lápida del Héroe', 'accessory', 3, { all: 0.03, def: 0.05 }, { t: 'memorial', c1: '#c9d1e6' }, 'memorial', 'Recuerdo de un héroe caído. Su legado te protege.');
  D.ITEMS = I;
  D.ITEM = {};
  I.forEach(it => { D.ITEM[it.id] = it; });

  D.SLOTS = { weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio', pet: 'Mascota' };

  /* Skins y títulos */
  D.SKINS = {
    sk_academia: { n: 'Uniforme de Academia', k: 'outfit', look: { st: 'coat', c1: '#1e2a52', c2: '#ffffff', tr: '#e8394b' }, src: 'Capítulo 3' },
    sk_sakura: { n: 'Kimono Sakura', k: 'outfit', look: { st: 'kimono', c1: '#ffb3d1', c2: '#fff4fa', tr: '#d6336c', pat: 'sakura' }, src: 'Capítulo 7' },
    sk_celestial: { n: 'Armadura Celestial', k: 'outfit', look: { st: 'plate', c1: '#f4f8ff', c2: '#7dd3ff', tr: '#ffd25e', glow: 1 }, src: 'Capítulo 10' },
    sk_ninja: { n: 'Traje Ninja Sombra', k: 'outfit', look: { st: 'kimono', c1: '#1b1830', c2: '#3a3456', tr: '#7df9ff' }, src: 'Canje de polvo' },
    sk_gala: { n: 'Traje de Gala', k: 'outfit', look: { st: 'coat', c1: '#111122', c2: '#ffffff', tr: '#ffc12e' }, src: 'Nivel 15' },
    sk_hoodie: { n: 'Hoodie Cómodo', k: 'outfit', look: { st: 'tunic', c1: '#8f8cf0', c2: '#3a3a5a', tr: '#ffffff' }, src: 'Tienda (oro)' },
    sk_yukata: { n: 'Yukata de Festival', k: 'outfit', look: { st: 'kimono', c1: '#3d5af1', c2: '#fff7e0', tr: '#ffb020', pat: 'sakura' }, src: 'Evento Festival' },
    au_arcoiris: { n: 'Aura Arcoíris', k: 'aura', look: { a: 'rainbow' }, src: 'Nivel 25' },
    au_llamas: { n: 'Llamas Doradas', k: 'aura', look: { a: 'flames' }, src: 'Derrotar al Emperador del Olvido' },
    au_estelar: { n: 'Polvo Estelar', k: 'aura', look: { a: 'stars' }, src: 'Logro: Leyenda Cotidiana' }
  };

  D.TITLES = {
    novato: 'Novato', aventurero: 'Aventurero', despierto: 'El Despierto', matajefes: 'Matajefes', heroe: 'Héroe de Hábitia',
    leyenda: 'Leyenda Viva', veterano: 'Veterano', semidios: 'Semidiós', renacido: 'Renacido', constante: 'El Constante',
    madrugador: 'Madrugador', buho: 'Búho Nocturno', coleccionista: 'Coleccionista', suertudo: 'Tocado por la Suerte',
    equilibrado: 'Maestro del Equilibrio', polvo: 'Señor del Polvo', explorador: 'Explorador Nato', inmaculado: 'Inmaculado',
    centurion: 'Centurión', cazador: 'Cazador de Slimes'
  };

  /* Desbloqueos por nivel */
  D.UNLOCKS = [
    { lvl: 2, k: 'shop', n: 'Tienda de objetos' },
    { lvl: 3, k: 'weekly', n: 'Misiones semanales' },
    { lvl: 3, k: 'explore', n: 'Misiones de Exploración' },
    { lvl: 4, k: 'balance', n: 'Misiones de Equilibrio' },
    { lvl: 4, k: 'events', n: 'Eventos sorpresa' },
    { lvl: 4, k: 'forge', n: 'Forja (mejorar objetos)' },
    { lvl: 5, k: 'pets', n: 'Gacha de Mascotas' },
    { lvl: 6, k: 'bosses', n: 'Jefes' },
    { lvl: 7, k: 'featured', n: 'Banner Destacado' }
  ];

  /* Recompensas especiales cada 5 niveles */
  D.MILESTONES = {
    5: { std: 10, pet: 3, gems: 100, title: 'aventurero' },
    10: { std: 10, gold_t: 1, chest: 2, gems: 150 },
    15: { std: 10, gems: 150, skin: 'sk_gala' },
    20: { std: 10, gold_t: 1, gems: 200, title: 'veterano' },
    25: { std: 10, gems: 200, skin: 'au_arcoiris' },
    30: { std: 10, gold_t: 1, gems: 300, title: 'semidios' }
  };

  /* Banners */
  D.BANNERS = {
    std: { n: 'Invocación Estelar', d: 'Todo el equipo del gacha.', pool: 'equip', ticket: 'std', unlock: 1 },
    feat: { n: 'Banner Destacado', d: 'Legendario destacado con 50% de probabilidad (garantizado si pierdes el 50/50).', pool: 'equip', ticket: 'std', unlock: 7 },
    pet: { n: 'Nido de Compañeros', d: 'Mascotas con habilidades pasivas.', pool: 'pet', ticket: 'pet', unlock: 5 }
  };
  D.GACHA = { cost1: 50, cost10: 450, epicPity: 10, legPity: 80 };
  D.FEATURED_ROTATION = [
    { leg: 'w_excalibur', ep: ['w_katana', 'a_carmesi', 'r_guardian'] },
    { leg: 'w_archimago', ep: ['w_grimorio', 'r_astral', 'a_laurel'] },
    { leg: 'r_oraculo', ep: ['r_gi', 'a_hada', 'w_lunar'] },
    { leg: 'w_orfeo', ep: ['w_flauta', 'a_laurel', 'r_astral'] },
    { leg: 'r_draconica', ep: ['w_runico', 'r_guardian', 'a_carmesi'] },
    { leg: 'a_halo', ep: ['w_grimorio', 'r_gi', 'w_katana'] },
    { leg: 'w_guadana', ep: ['w_runico', 'w_flauta', 'a_hada'] },
    { leg: 'a_fenix', ep: ['w_lunar', 'r_gi', 'a_hada'] }
  ];

  /* Tienda de oro */
  D.SHOP_ITEMS = {
    pocion: { n: 'Poción de Vida', d: 'Recupera 30 HP.', price: 120, ic: 'potion', max: 3 },
    granpocion: { n: 'Gran Poción', d: 'Recupera 80 HP.', price: 300, ic: 'bigpotion', max: 1 },
    amuleto: { n: 'Amuleto de Racha', d: 'Protege todas tus rachas un día que falles. Máx. 3.', price: 350, ic: 'shieldstreak', max: 1 },
    elixir: { n: 'Elixir de Sabiduría', d: '+25% de XP durante 24 horas.', price: 500, ic: 'elixir', max: 1 },
    ticket: { n: 'Ticket de Invocación', d: '1 tirada en cualquier banner de equipo.', price: 600, ic: 'ticket', max: 1 },
    gemas: { n: 'Bolsa de Gemas', d: '60 gemas.', price: 400, ic: 'gem', max: 1 },
    hoodie: { n: 'Hoodie Cómodo', d: 'Skin cosmética.', price: 2500, ic: 'skin', max: 1, skin: 'sk_hoodie' }
  };
  D.SHOP_ITEM_PRICE = [150, 450, 1300];

  /* Canje de polvo estelar */
  D.DUST_SHOP = [
    { id: 'd_ticket', n: 'Ticket de Invocación', d: '1 tirada de equipo.', price: 120, ic: 'ticket' },
    { id: 'd_petticket', n: 'Ticket de Mascota', d: '1 tirada de mascotas.', price: 150, ic: 'petticket' },
    { id: 'd_cofre', n: 'Cofre Legendario', d: 'Un objeto Legendario de equipo al azar.', price: 900, ic: 'chest' },
    { id: 'd_ninja', n: 'Traje Ninja Sombra', d: 'Skin cosmética.', price: 1500, ic: 'skin', skin: 'sk_ninja' },
    { id: 'd_titulo', n: 'Título: Señor del Polvo', d: 'Título cosmético.', price: 500, ic: 'crown', title: 'polvo' }
  ];

  /* Recompensas reales de ejemplo */
  D.REAL_DEFAULTS = [
    { n: '1 episodio de serie', price: 200, ic: 'film' },
    { n: 'Postre', price: 300, ic: 'cake' },
    { n: '1 hora de videojuegos', price: 400, ic: 'gamepad' },
    { n: 'Café o bebida especial', price: 250, ic: 'tea' },
    { n: 'Comida favorita', price: 800, ic: 'burger' },
    { n: 'Salida al cine', price: 1500, ic: 'ticket' },
    { n: 'Darme un capricho', price: 2500, ic: 'gift' },
    { n: 'Día libre', price: 5000, ic: 'crown' }
  ];

  /* Bono diario por entrar (ciclo de 7 días) */
  D.LOGIN = [
    { gold: 50 }, { gems: 10 }, { dust: 20 }, { gems: 15 }, { std: 1 }, { gold: 120 }, { gems: 30, std: 1 }
  ];

  /* Jefes */
  D.BOSSES = [
    { id: 'slime', n: 'Rey Slime de la Pereza', hp: 500, days: 4, look: { t: 'slime', c1: '#8fe06a', c2: '#7b3fe4' }, rw: { title: 'cazador' },
      d: 'Un slime gigante que se alimenta de las tareas pospuestas. Cada "mañana lo hago" lo hace más grande.' },
    { id: 'golem', n: 'Gólem del Sofá', hp: 800, days: 5, look: { t: 'golem', c1: '#a07850', c2: '#ff5a5f' },
      d: 'Hecho de cojines endurecidos. Quiere que te quedes sentado para siempre.' },
    { id: 'hidra', n: 'Hidra de Notificaciones', hp: 1100, days: 5, look: { t: 'hydra', c1: '#3d7dff', c2: '#ff4f7b' },
      d: 'Por cada notificación que revisas, le crece otra cabeza.' },
    { id: 'lich', n: 'Lich del Desvelo', hp: 1500, days: 6, look: { t: 'lich', c1: '#7b3fe4', c2: '#7df9ff' }, rw: { item: 'x_matajefes' },
      d: 'Roba horas de sueño y las guarda en su filacteria.' },
    { id: 'dragon', n: 'Dragón de la Gula', hp: 2000, days: 6, look: { t: 'dragon', c1: '#d6452f', c2: '#ffc12e' },
      d: 'Devora comida chatarra y escupe culpa.' },
    { id: 'kraken', n: 'Kraken del Desorden', hp: 2600, days: 7, look: { t: 'kraken', c1: '#1fa59a', c2: '#ff8fc8' },
      d: 'Sus tentáculos esconden tus llaves, tus calcetines y tus metas.' },
    { id: 'sombra', n: 'Sombra de la Duda', hp: 3300, days: 7, look: { t: 'shadow', c1: '#2b2238', c2: '#ff5ad1' },
      d: 'Susurra que no puedes. Solo se debilita cuando lo demuestras.' },
    { id: 'emperador', n: 'Emperador del Olvido', hp: 4200, days: 7, look: { t: 'emperor', c1: '#1b1830', c2: '#ffc12e' }, rw: { skin: 'au_llamas', gems: 300 },
      d: 'Quiere que olvides quién decidiste ser. Es el señor de todos los vicios.' }
  ];

  /* Campaña */
  D.CHAPTERS = [
    { n: 'El Despertar', intro: 'Despiertas en Hábitia, un reino donde la Bruma de los Vicios lo cubre todo. Una pequeña hada de luz revolotea frente a ti. "¡Por fin! Soy Lumi. Tus acciones en el otro mundo nos dan fuerza aquí. ¿Me ayudas?"',
      outro: 'La bruma retrocede unos pasos. Lumi da una vuelta en el aire: "¡Lo sabía! Tienes la chispa de un héroe."',
      obj: [{ m: 'habits', v: 3, rel: 1, t: 'Completa 3 hábitos' }, { m: 'level', v: 2, t: 'Alcanza el nivel 2' }],
      rw: { item: 'x_primerpaso', gems: 50 } },
    { n: 'El Bosque de la Pereza', intro: 'Los árboles del bosque bostezan y te piden que descanses "solo cinco minutos más". Lumi te tira de la oreja: "¡No les hagas caso! La constancia es el único camino."',
      outro: 'Los árboles despiertan y te abren paso. Un claro iluminado aparece ante ti.',
      obj: [{ m: 'habits', v: 15, rel: 1, t: 'Completa 15 hábitos' }, { m: 'streakCur', v: 3, t: 'Logra una racha de 3 días' }],
      rw: { title: 'despierto', std: 1 } },
    { n: 'La Aldea de Hábitia', intro: 'Llegas a una aldea donde la gente ha olvidado sus rutinas. El alcalde te pide ayuda con encargos diarios.',
      outro: 'La aldea recupera su ritmo. Como agradecimiento, la academia local te regala su uniforme de honor.',
      obj: [{ m: 'level', v: 4, t: 'Alcanza el nivel 4' }, { m: 'dailyClaimed', v: 5, rel: 1, t: 'Reclama 5 misiones diarias' }],
      rw: { skin: 'sk_academia', gems: 80 } },
    { n: 'La Biblioteca Perdida', intro: 'Bajo la aldea hay una biblioteca sellada. Solo se abre ante alguien que crezca en varias direcciones.',
      outro: 'En la sala central duerme un grifo joven. Al verte, decide acompañarte.',
      obj: [{ m: 'attrsAt3', v: 2, t: 'Sube 2 atributos a nivel 3' }, { m: 'perfectDays', v: 1, rel: 1, t: 'Logra 1 Día Perfecto' }],
      rw: { item: 'x_grifo', gems: 60 } },
    { n: 'El Primer Guardián', intro: 'Un rugido sacude la tierra. "Es un Guardián de los Vicios", susurra Lumi. "Solo cae ante la constancia de varios días."',
      outro: 'El Guardián se desvanece en chispas. Los aldeanos gritan tu nombre: ¡Matajefes!',
      obj: [{ m: 'bosses', v: 1, t: 'Derrota a tu primer jefe' }, { m: 'level', v: 7, t: 'Alcanza el nivel 7' }],
      rw: { title: 'matajefes', gems: 150, std: 3 } },
    { n: 'Las Ruinas del Equilibrio', intro: 'Unas ruinas antiguas flotan sobre un lago. Sus puertas solo se abren a quien explora y se equilibra.',
      outro: 'En el altar brilla una gema de cinco colores. Es tuya.',
      obj: [{ m: 'balance', v: 2, rel: 1, t: 'Completa 2 misiones de Equilibrio' }, { m: 'explore', v: 2, rel: 1, t: 'Completa 2 misiones de Exploración' }],
      rw: { item: 'x_gema', gems: 100 } },
    { n: 'La Torre de la Constancia', intro: 'Una torre de mil escalones. Cada escalón es un día. Lumi suspira: "Nadie ha llegado a la cima sin rendirse... todavía."',
      outro: 'En la cima florece un cerezo eterno. Sus pétalos tejen un kimono para ti.',
      obj: [{ m: 'streakCur', v: 14, t: 'Logra una racha de 14 días' }, { m: 'perfectDays', v: 5, rel: 1, t: 'Logra 5 Días Perfectos' }],
      rw: { skin: 'sk_sakura', gems: 200 } },
    { n: 'El Mar de las Tentaciones', intro: 'Sirenas cantan ofertas, maratones de series y comida rápida. Debes cruzar sin escucharlas.',
      outro: 'Llegas a la otra orilla limpio y en calma. Un peregrino te entrega su manto.',
      obj: [{ m: 'cleanDays', v: 7, rel: 1, t: 'Pasa 7 días sin malos hábitos' }, { m: 'level', v: 12, t: 'Alcanza el nivel 12' }],
      rw: { item: 'x_peregrino', gems: 150 } },
    { n: 'El Castillo de las Sombras', intro: 'El castillo del Emperador se alza entre relámpagos. Sus generales esperan.',
      outro: 'Los generales caen. Las puertas del salón del trono se abren lentamente.',
      obj: [{ m: 'bosses', v: 4, t: 'Derrota a 4 jefes' }, { m: 'attrMin', v: 6, t: 'Todos los atributos a nivel 6' }],
      rw: { title: 'heroe', gold_t: 1, gems: 200 } },
    { n: 'El Emperador del Olvido', intro: '"¿Para qué esforzarte?", ruge el Emperador. "Mañana lo olvidarás todo." Lumi brilla con fuerza: "¡Demuéstrale que no!"',
      outro: 'La Bruma se disipa por completo. Hábitia vuelve a brillar, y tu leyenda apenas comienza. Lumi llora de alegría.',
      obj: [{ m: 'level', v: 18, t: 'Alcanza el nivel 18' }, { m: 'habits', v: 300, rel: 1, t: 'Completa 300 hábitos en este capítulo' }],
      rw: { item: 'x_obsidiana', skin: 'sk_celestial', title: 'leyenda', gems: 500 } }
  ];

  /* Eventos sorpresa */
  D.EVENTS = [
    { id: 'luna', n: 'Luna de Sangre', d: 'XP de Fuerza x1.5 durante 24 h.', h: 24, buff: { xp: { fue: 0.5 } }, ic: 'moon', c: '#ff5a5f' },
    { id: 'biblio', n: 'Biblioteca Encantada', d: 'XP de Inteligencia x1.5 durante 24 h.', h: 24, buff: { xp: { int: 0.5 } }, ic: 'book', c: '#4da3ff' },
    { id: 'festival', n: 'Festival de Sakura', d: 'Oro x2 durante 24 h. ¡Completa 5 hábitos para ganar la Yukata de Festival!', h: 24, buff: { gold: 1 }, ic: 'flower', c: '#ff8fc8',
      mission: { m: 'good', n: 5, rw: { skin: 'sk_yukata', gems: 30 } } },
    { id: 'lluvia', n: 'Lluvia de Gemas', d: 'Cada hábito completado da +3 gemas durante 12 h.', h: 12, buff: { gemrain: 3 }, ic: 'gem', c: '#7df9ff' },
    { id: 'alba', n: 'Bendición del Alba', d: '+15% de probabilidad de crítico durante 24 h.', h: 24, buff: { crit: 0.15 }, ic: 'sun', c: '#ffc12e' },
    { id: 'relampago', n: 'Desafío Relámpago', d: 'Completa 4 hábitos en 6 horas.', h: 6, ic: 'bolt', c: '#ffe066',
      mission: { m: 'good', n: 4, rw: { std: 1, gems: 30 } } },
    { id: 'slimedorado', n: '¡Un Slime Dorado!', d: 'Completa hábitos de 3 atributos distintos en 24 h para atraparlo.', h: 24, ic: 'slime', c: '#ffe066',
      mission: { m: 'attr_variety', n: 3, rw: { item: 'x_slimedorado', gems: 40 } } },
    { id: 'mercader', n: 'Mercader Errante', d: 'Todo en la tienda de oro cuesta 40% menos durante 24 h.', h: 24, buff: { shop: 0.4 }, ic: 'coin', c: '#ffb020' }
  ];

  /* Plantillas de misiones */
  D.DAILY_TPL = [
    { id: 'd_count', m: 'good', t: 'Completa {n} hábitos', ns: [3, 4, 5] },
    { id: 'd_attr', m: 'good_attr', t: 'Completa {n} hábito(s) de {attr}', ns: [1, 2] },
    { id: 'd_xp', m: 'xp', t: 'Gana {n} XP', scale: 'xp' },
    { id: 'd_hard', m: 'good_hard', t: 'Completa un hábito Difícil o Épico', ns: [1], need: 'hard' },
    { id: 'd_variety', m: 'attr_variety', t: 'Completa hábitos de {n} atributos distintos', ns: [2, 3] },
    { id: 'd_streak', m: 'good_streak', t: 'Completa {n} hábito(s) con racha activa', ns: [1, 2], need: 'streak' },
    { id: 'd_pull', m: 'pull', t: 'Haz {n} tirada en el gacha', ns: [1] },
    { id: 'd_perfect', m: 'perfect', t: 'Logra un Día Perfecto', ns: [1], need: 'daily' },
    { id: 'd_gold', m: 'gold', t: 'Gana {n} de oro', scale: 'gold' }
  ];
  D.WEEKLY_TPL = [
    { id: 'w_count', m: 'good', t: 'Completa {n} hábitos', ns: [25, 30, 35] },
    { id: 'w_perfect', m: 'perfect', t: 'Logra {n} Días Perfectos', ns: [3, 4] },
    { id: 'w_xp', m: 'xp', t: 'Gana {n} XP', scale: 'wxp' },
    { id: 'w_clean', m: 'clean', t: 'Pasa {n} días sin malos hábitos', ns: [3, 4] },
    { id: 'w_boss', m: 'boss_dmg', t: 'Inflige {n} de daño a jefes', ns: [600, 900], need: 'bosses' },
    { id: 'w_pulls', m: 'pull', t: 'Haz {n} tiradas en el gacha', ns: [10] },
    { id: 'w_daily', m: 'claim_daily', t: 'Reclama {n} misiones diarias', ns: [12, 15] },
    { id: 'w_attrs', m: 'attr_variety', t: 'Gana XP en los {n} atributos', ns: [5] }
  ];
  D.EXPLORE_TPL = {
    fue: ['Prueba un ejercicio que nunca hayas hecho', 'Sube por las escaleras en vez del ascensor todo el día', 'Haz 10 minutos de una rutina de estiramientos nueva', 'Sal a caminar por una ruta que no conozcas'],
    int: ['Lee sobre un tema completamente nuevo', 'Mira un documental de algo que no conozcas', 'Aprende 10 palabras de otro idioma', 'Resuelve un acertijo o problema de lógica'],
    vit: ['Cocina una receta saludable nueva', 'Prueba una fruta o verdura que nunca hayas comido', 'Pasa la última hora antes de dormir sin pantallas', 'Prepara tu comida de mañana con antelación'],
    dis: ['Ordena un espacio que llevas tiempo evitando', 'Termina una tarea pendiente de hace más de una semana', 'Planifica tu día por escrito antes de empezarlo', 'Prueba la técnica Pomodoro durante una hora'],
    car: ['Inicia una conversación con alguien nuevo', 'Escribe un mensaje de agradecimiento a alguien', 'Haz un cumplido sincero a alguien', 'Invita a alguien a hacer algo juntos']
  };

  /* Logros (m = métrica, v = meta). sec = secreto */
  D.ACHIEVEMENTS = [
    { id: 'h1', n: 'Primer Paso', d: 'Completa tu primer hábito.', m: 'habits', v: 1, rw: { gems: 20 }, ic: 'shoe' },
    { id: 'h10', n: 'Calentando Motores', d: 'Completa 10 hábitos.', m: 'habits', v: 10, rw: { gems: 30 }, ic: 'flame' },
    { id: 'h50', n: 'En Marcha', d: 'Completa 50 hábitos.', m: 'habits', v: 50, rw: { gems: 50 }, ic: 'flame' },
    { id: 'h100', n: 'Centurión', d: 'Completa 100 hábitos.', m: 'habits', v: 100, rw: { gems: 80, title: 'centurion' }, ic: 'shield' },
    { id: 'h250', n: 'Imparable', d: 'Completa 250 hábitos.', m: 'habits', v: 250, rw: { gems: 120 }, ic: 'bolt' },
    { id: 'h500', n: 'Leyenda Cotidiana', d: 'Completa 500 hábitos.', m: 'habits', v: 500, rw: { gems: 200, skin: 'au_estelar' }, ic: 'star' },
    { id: 'h1000', n: 'Mil Victorias', d: 'Completa 1000 hábitos.', m: 'habits', v: 1000, rw: { gems: 400 }, ic: 'crown' },
    { id: 's3', n: 'Chispa', d: 'Logra una racha de 3 días.', m: 'maxStreak', v: 3, rw: { gems: 20 }, ic: 'flame' },
    { id: 's7', n: 'Semana de Fuego', d: 'Logra una racha de 7 días.', m: 'maxStreak', v: 7, rw: { gems: 40 }, ic: 'flame' },
    { id: 's14', n: 'Dos Semanas de Gloria', d: 'Logra una racha de 14 días.', m: 'maxStreak', v: 14, rw: { gems: 60 }, ic: 'flame' },
    { id: 's30', n: 'El Constante', d: 'Logra una racha de 30 días.', m: 'maxStreak', v: 30, rw: { gems: 120, title: 'constante' }, ic: 'flame' },
    { id: 's60', n: 'Voluntad de Hierro', d: 'Logra una racha de 60 días.', m: 'maxStreak', v: 60, rw: { gems: 200 }, ic: 'shield' },
    { id: 's100', n: 'Centenario', d: 'Logra una racha de 100 días.', m: 'maxStreak', v: 100, rw: { gems: 400 }, ic: 'crown' },
    { id: 'l5', n: 'Aprendiz de Héroe', d: 'Alcanza el nivel 5.', m: 'level', v: 5, rw: { gems: 30 }, ic: 'star' },
    { id: 'l10', n: 'Héroe en Ascenso', d: 'Alcanza el nivel 10.', m: 'level', v: 10, rw: { gems: 60 }, ic: 'star' },
    { id: 'l15', n: 'Campeón', d: 'Alcanza el nivel 15.', m: 'level', v: 15, rw: { gems: 90 }, ic: 'star' },
    { id: 'l20', n: 'Gran Campeón', d: 'Alcanza el nivel 20.', m: 'level', v: 20, rw: { gems: 120 }, ic: 'star' },
    { id: 'l30', n: 'Mítico', d: 'Alcanza el nivel 30.', m: 'level', v: 30, rw: { gems: 200 }, ic: 'crown' },
    { id: 'l50', n: 'Ascendido', d: 'Alcanza el nivel 50.', m: 'level', v: 50, rw: { gems: 500 }, ic: 'crown' },
    { id: 'af', n: 'Titán', d: 'Sube Fuerza al nivel 10.', m: 'attr_fue', v: 10, rw: { gems: 60 }, ic: 'dumbbell' },
    { id: 'ai', n: 'Erudito', d: 'Sube Inteligencia al nivel 10.', m: 'attr_int', v: 10, rw: { gems: 60 }, ic: 'book' },
    { id: 'av', n: 'Roble Viviente', d: 'Sube Vitalidad al nivel 10.', m: 'attr_vit', v: 10, rw: { gems: 60 }, ic: 'heart' },
    { id: 'ad', n: 'Mente de Acero', d: 'Sube Disciplina al nivel 10.', m: 'attr_dis', v: 10, rw: { gems: 60 }, ic: 'shield' },
    { id: 'ac', n: 'Estrella Social', d: 'Sube Carisma al nivel 10.', m: 'attr_car', v: 10, rw: { gems: 60 }, ic: 'people' },
    { id: 'aall', n: 'Equilibrio Perfecto', d: 'Todos los atributos al nivel 5.', m: 'attrMin', v: 5, rw: { gems: 100 }, ic: 'lotus' },
    { id: 'g1', n: 'Primera Invocación', d: 'Haz tu primera tirada.', m: 'pulls', v: 1, rw: { gems: 20 }, ic: 'gem' },
    { id: 'g10', n: 'Coleccionista Novato', d: 'Haz 10 tiradas.', m: 'pulls', v: 10, rw: { gems: 40 }, ic: 'gem' },
    { id: 'g100', n: 'Adicto al Brillo', d: 'Haz 100 tiradas.', m: 'pulls', v: 100, rw: { gems: 150, title: 'coleccionista' }, ic: 'gem' },
    { id: 'ge', n: 'Destello Morado', d: 'Consigue un objeto Épico.', m: 'gotR2', v: 1, rw: { gems: 30 }, ic: 'star' },
    { id: 'gl', n: 'Lluvia Dorada', d: 'Consigue un objeto Legendario.', m: 'gotR3', v: 1, rw: { gems: 80 }, ic: 'crown' },
    { id: 'gm', n: 'Tocado por la Suerte', d: 'Consigue un objeto Mítico.', m: 'gotR4', v: 1, rw: { gems: 200, title: 'suertudo' }, ic: 'crown', sec: 1 },
    { id: 'c10', n: 'Baúl Lleno', d: 'Posee 10 objetos distintos.', m: 'items', v: 10, rw: { gems: 40 }, ic: 'chest' },
    { id: 'c25', n: 'Tesorería Real', d: 'Posee 25 objetos distintos.', m: 'items', v: 25, rw: { gems: 100 }, ic: 'chest' },
    { id: 'pet3', n: 'Domador', d: 'Posee 3 mascotas distintas.', m: 'pets', v: 3, rw: { gems: 50 }, ic: 'paw' },
    { id: 'b1', n: 'Primer Guardián', d: 'Derrota a tu primer jefe.', m: 'bosses', v: 1, rw: { gems: 60 }, ic: 'sword' },
    { id: 'b3', n: 'Cazador de Monstruos', d: 'Derrota a 3 jefes.', m: 'bosses', v: 3, rw: { gems: 100 }, ic: 'sword' },
    { id: 'b8', n: 'Libertador de Hábitia', d: 'Derrota a 8 jefes.', m: 'bosses', v: 8, rw: { gems: 300 }, ic: 'crown' },
    { id: 'm10', n: 'Recadero', d: 'Reclama 10 misiones diarias.', m: 'dailyClaimed', v: 10, rw: { gems: 40 }, ic: 'scroll' },
    { id: 'm50', n: 'Mercenario', d: 'Reclama 50 misiones diarias.', m: 'dailyClaimed', v: 50, rw: { gems: 120 }, ic: 'scroll' },
    { id: 'ex5', n: 'Espíritu Curioso', d: 'Completa 5 misiones de Exploración.', m: 'explore', v: 5, rw: { gems: 60 }, ic: 'compass' },
    { id: 'ex15', n: 'Explorador Nato', d: 'Completa 15 misiones de Exploración.', m: 'explore', v: 15, rw: { gems: 150, title: 'explorador' }, ic: 'compass' },
    { id: 'bal10', n: 'Maestro del Equilibrio', d: 'Completa 10 misiones de Equilibrio.', m: 'balance', v: 10, rw: { gems: 150, title: 'equilibrado' }, ic: 'lotus' },
    { id: 'ch3', n: 'Capítulo III', d: 'Completa el capítulo 3 de la Campaña.', m: 'chapter', v: 3, rw: { gems: 60 }, ic: 'book' },
    { id: 'ch10', n: 'Fin de la Bruma', d: 'Completa la Campaña.', m: 'chapter', v: 10, rw: { gems: 300 }, ic: 'crown' },
    { id: 'ev3', n: 'Cazador de Eventos', d: 'Completa 3 desafíos de eventos sorpresa.', m: 'events', v: 3, rw: { gems: 60 }, ic: 'bolt' },
    { id: 'gold1k', n: 'Bolsillo Pesado', d: 'Gana 1000 de oro en total.', m: 'goldEarned', v: 1000, rw: { gems: 40 }, ic: 'coin' },
    { id: 'gold10k', n: 'Magnate', d: 'Gana 10000 de oro en total.', m: 'goldEarned', v: 10000, rw: { gems: 120 }, ic: 'coin' },
    { id: 'rr1', n: 'Me lo Merezco', d: 'Canjea tu primera recompensa real.', m: 'realRewards', v: 1, rw: { gems: 30 }, ic: 'gift' },
    { id: 'rr10', n: 'Disfrutar es Parte del Plan', d: 'Canjea 10 recompensas reales.', m: 'realRewards', v: 10, rw: { gems: 80 }, ic: 'gift' },
    { id: 'forge1', n: 'Herrero Novato', d: 'Mejora un objeto en la Forja.', m: 'upgrades', v: 1, rw: { gems: 30 }, ic: 'hammer' },
    { id: 'forge5', n: 'Obra Maestra', d: 'Lleva un objeto a +5.', m: 'maxUpgrade', v: 5, rw: { gems: 120 }, ic: 'hammer' },
    { id: 'pd1', n: 'Día Perfecto', d: 'Logra tu primer Día Perfecto.', m: 'perfectDays', v: 1, rw: { gems: 30 }, ic: 'sun' },
    { id: 'pd7', n: 'Semana Perfecta', d: 'Logra 7 Días Perfectos.', m: 'perfectDays', v: 7, rw: { gems: 80 }, ic: 'sun' },
    { id: 'pd30', n: 'Mes Dorado', d: 'Logra 30 Días Perfectos.', m: 'perfectDays', v: 30, rw: { gems: 200 }, ic: 'sun' },
    { id: 'clean7', n: 'Inmaculado', d: 'Encadena 7 días seguidos sin malos hábitos.', m: 'cleanStreak', v: 7, rw: { gems: 100, title: 'inmaculado' }, ic: 'leaf', sec: 1 },
    { id: 'die', n: 'Polvo Eres', d: 'Muere por primera vez.', m: 'deaths', v: 1, rw: { gems: 10 }, ic: 'skull', sec: 1 },
    { id: 'revive', n: 'El Regreso', d: 'Completa el Ritual de Resurrección.', m: 'revives', v: 1, rw: { gems: 150 }, ic: 'flame', sec: 1 },
    { id: 'perma', n: 'Hasta la Próxima Vida', d: 'Pierde un personaje para siempre.', m: 'permadeaths', v: 1, rw: { gems: 50 }, ic: 'skull', sec: 1 },
    { id: 'owl', n: 'Búho Nocturno', d: 'Completa un hábito entre la medianoche y las 4 a. m.', m: 'flag_nightowl', v: 1, rw: { gems: 30, title: 'buho' }, ic: 'owl', sec: 1 },
    { id: 'early', n: 'Madrugador', d: 'Completa un hábito entre las 4 y las 6 a. m.', m: 'flag_earlybird', v: 1, rw: { gems: 30, title: 'madrugador' }, ic: 'sun', sec: 1 },
    { id: 'dark', n: 'Día Oscuro', d: 'Registra 5 malos hábitos en un mismo día.', m: 'flag_darkday', v: 1, rw: { gems: 10 }, ic: 'skull', sec: 1 },
    { id: 'edge', n: 'Al Borde', d: 'Sobrevive con 5 HP o menos.', m: 'flag_edge', v: 1, rw: { gems: 40 }, ic: 'heart', sec: 1 },
    { id: 'undo', n: 'Viajero del Tiempo', d: 'Usa "Deshacer" 5 veces.', m: 'undos', v: 5, rw: { gems: 20 }, ic: 'hourglass', sec: 1 },
    { id: 'crit10', n: 'Golpe de Suerte', d: 'Consigue 10 golpes críticos.', m: 'crits', v: 10, rw: { gems: 40 }, ic: 'bolt' }
  ];

  G.LMD = D;
})(typeof window !== 'undefined' ? window : globalThis);
