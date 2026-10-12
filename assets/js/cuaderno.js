// Tu cuaderno: lo que cada visitante recorre en los cuatro ejes. Se guarda solo en su navegador.
import { h, storage } from './lib.js';

export const EJES = {
  ser: { nombre: 'Ser', sub: 'Sentir, actuar y pensar', pregunta: '¿Qué siento, cómo me sale actuar y qué pienso ante esto?', ico: '♥' },
  saber: { nombre: 'Saber', sub: 'La escalera del saber', pregunta: '¿Qué sé de verdad y qué estoy suponiendo?', ico: '◆' },
  hacer: { nombre: 'Hacer', sub: 'La escalera del hacer', pregunta: '¿Qué decido hacer, y lo hago bien fuera de aquí?', ico: '▲' },
  crear: { nombre: 'Creer y crear', sub: 'Tu relato', pregunta: '¿Qué historia me cuento y cuál quiero construir?', ico: '✎' },
};
export const ORDEN_EJES = ['ser', 'saber', 'hacer', 'crear'];

const vacio = () => ({
  v: 1, creado: new Date().toISOString(), xp: { ser: 0, saber: 0, hacer: 0, crear: 0 },
  fichas: [], paradas: [], vistas: {}, juegos: {}, detector: 0, sap: { sentir: 0, actuar: 0, pensar: 0, modos: {} },
  entradas: [], creencias: { antes: null, despues: null }, relato: {}, situaciones: {}, insignias: {},
});

let estado = null;
const oyentes = new Set();

export function leer() {
  if (estado) return estado;
  const g = storage('cuaderno');
  estado = Object.assign(vacio(), g && g.v === 1 ? g : {});
  estado.xp = Object.assign({ ser: 0, saber: 0, hacer: 0, crear: 0 }, estado.xp);
  estado.sap = Object.assign({ sentir: 0, actuar: 0, pensar: 0, modos: {} }, estado.sap);
  return estado;
}
function guardar() { storage('cuaderno', estado); for (const f of oyentes) { try { f(estado); } catch (e) { /* nada */ } } }
export function alCambiar(f) { oyentes.add(f); return () => oyentes.delete(f); }

// Peldaños: cada uno se alcanza con algo que se hace en PostLab
const juegosCon = (c, min) => Object.values(c.juegos).filter(j => (j.mejorPct ?? 0) >= min).length;
const veces = c => Object.values(c.juegos).reduce((a, j) => a + (j.veces || 0), 0);
const entradas = (c, tipo) => c.entradas.filter(e => e.tipo === tipo).length;

export const PELDANOS = {
  ser: [
    { n: 'Automático', d: 'Lo que te sale sin pensarlo: sentir, actuar y, por último, pensar.', ok: () => true, pista: 'Haz tu primer termómetro en Pensar y aplicar.' },
    { n: 'Notar', d: 'Has puesto nombre a lo que sientes ante un término.', ok: c => c.sap.sentir >= 1, pista: 'Marca qué te provoca un término (en su ficha o en el termómetro).' },
    { n: 'Separar', d: 'Distingues lo que sientes, lo que te sale hacer y lo que piensas.', ok: c => entradas(c, 'sap') >= 1, pista: 'Completa un termómetro de sentir, actuar y pensar.' },
    { n: 'Entrenar', d: 'Practicas pensar antes de actuar, con calma.', ok: c => entradas(c, 'sap') >= 3, pista: 'Completa tres termómetros con términos distintos.' },
    { n: 'Reto', d: 'Lo pones a prueba bajo presión, cuando toca actuar primero.', ok: c => Object.keys(c.situaciones).length >= 3 && c.sap.modos.reto, pista: 'Resuelve situaciones en modo reto, con el reloj en marcha.' },
  ],
  saber: [
    { n: 'Ruido', d: 'Todos empezamos aquí: frases sueltas que se oyen sin saber de dónde vienen.', ok: () => true, pista: 'Lee cinco fichas en Explorar.' },
    { n: 'Datos', d: 'Has leído fichas con su año, su obra y su fuente.', ok: c => c.fichas.length >= 5, pista: 'Recorre cinco paradas de la ruta de Aprender o dos visualizaciones.' },
    { n: 'Información', d: 'Has ordenado esos datos respecto a una pregunta: cuándo, dónde, cuánto.', ok: c => c.fichas.length >= 5 && (c.paradas.length >= 5 || Object.keys(c.vistas).length >= 2), pista: 'Supera un juego con al menos el 60 %.' },
    { n: 'Conocimiento', d: 'Sabes explicar los seis valores y las cinco P, y lo demuestras jugando.', ok: c => juegosCon(c, .6) >= 1 && (c.paradas.length >= 5 || Object.keys(c.vistas).length >= 2), pista: 'Supera el detector de saltos (10 de 13) y analiza un caso en el laboratorio de las cinco P.' },
    { n: 'Entendimiento', d: 'Sabes cuándo y cómo usar lo aprendido en un caso nuevo, y qué no se sigue de él.', ok: c => c.detector >= 10 && entradas(c, 'cincop') >= 1 && juegosCon(c, .6) >= 1, pista: '¡Arriba del todo! Ahora toca usarlo fuera.' },
  ],
  hacer: [
    { n: 'Aptitud', d: 'Tienes lo que hace falta para empezar: curiosidad y un rato.', ok: () => true, pista: 'Termina cualquier juego.' },
    { n: 'Habilidad', d: 'Sabes ejecutar los pasos: has terminado un juego.', ok: c => veces(c) >= 1, pista: 'Saca un 80 % en un juego, o una racha de 8 en «¿Antes o después?».' },
    { n: 'Destreza', d: 'Lo haces de forma fluida: buenas marcas sin pensarlo demasiado.', ok: c => veces(c) >= 1 && juegosCon(c, .8) >= 1, pista: 'Caza un post en el mundo real y resuelve tres situaciones.' },
    { n: 'Competencia', d: 'Lo haces bien en el entorno real: titulares, conversaciones, decisiones.', ok: c => juegosCon(c, .8) >= 1 && entradas(c, 'caza') >= 1 && Object.keys(c.situaciones).length >= 3, pista: 'Revisa una entrada de tu cuaderno y caza tres posts.' },
    { n: 'Experiencia cultivada', d: 'Aprendes de tu práctica revisada y la ajustas.', ok: c => entradas(c, 'caza') >= 3 && c.entradas.some(e => e.revision), pista: '¡Arriba del todo! Enseña a alguien lo que has aprendido.' },
  ],
  crear: [
    { n: 'Creer', d: 'Has puesto por escrito lo que crees ahora, sin juzgarlo.', ok: c => !!c.creencias.antes, pista: 'Responde «Lo que creo» en Tu relato.' },
    { n: 'Reencuadrar', d: 'Has cambiado la pregunta con la que mirabas una creencia.', ok: c => !!c.relato.reencuadre, pista: 'Reencuadra una creencia en Tu relato.' },
    { n: 'Recontextualizar', d: 'Has añadido lo que faltaba en la foto.', ok: c => !!c.relato.contexto, pista: 'Añade el contexto que faltaba.' },
    { n: 'Resignificar', d: 'Has decidido qué significa para tu siguiente paso.', ok: c => !!c.relato.sentido, pista: 'Decide qué harás a continuación.' },
    { n: 'Crear', d: 'Has escrito un relato más informado y realista, y has comparado tu antes y tu después.', ok: c => !!c.relato.texto && !!c.creencias.despues, pista: '¡Arriba del todo! Bautiza el siguiente post.' },
  ],
};

export function peldano(eje, c = leer()) {
  const P = PELDANOS[eje];
  let k = -1;
  for (let i = 0; i < P.length; i++) { if (P[i].ok(c)) k = i; else break; }
  return k; // -1: sin empezar (solo en crear)
}

export const INSIGNIAS = [
  { id: 'primera', n: 'Primer contacto', d: 'Abre tu primera ficha.', ico: '👋', eje: 'saber', ok: c => c.fichas.length >= 1 },
  { id: 'coleccion', n: 'Coleccionista', d: 'Lee 25 fichas distintas.', ico: '🗂', eje: 'saber', ok: c => c.fichas.length >= 25 },
  { id: 'viajero', n: 'Viajero del tiempo', d: 'Completa el viaje guiado de Viajar.', ico: '⏳', eje: 'saber', ok: c => !!c.vistas.viaje },
  { id: 'cartografo', n: 'Cartógrafo', d: 'Visita las tres visualizaciones.', ico: '🗺', eje: 'saber', ok: c => ['mapa', 'tendencias', 'pulso'].every(k => c.vistas[k]) },
  { id: 'ruta', n: 'Diez paradas', d: 'Termina la ruta de Aprender.', ico: '🚏', eje: 'saber', ok: c => c.paradas.length >= 10 },
  { id: 'seis', n: 'Seis después', d: 'Saca 8 o más en «Seis maneras de decir después».', ico: '6', eje: 'hacer', ok: c => (c.juegos.valores?.mejorPct ?? 0) >= .8 },
  { id: 'lince', n: 'Ojo de lince', d: 'Acierta las 13 frases del detector de saltos.', ico: '👁', eje: 'saber', ok: c => c.detector >= 13 },
  { id: 'racha', n: 'En racha', d: 'Encadena 10 aciertos en «¿Antes o después?».', ico: '🔥', eje: 'hacer', ok: c => (c.juegos.antes?.mejor ?? 0) >= 10 },
  { id: 'mano', n: 'Mano de las cinco P', d: 'Analiza un caso en el laboratorio de las cinco P.', ico: '✋', eje: 'saber', ok: c => entradas(c, 'cincop') >= 1 },
  { id: 'termometro', n: 'Termómetro', d: 'Completa tres termómetros de sentir, actuar y pensar.', ico: '🌡', eje: 'ser', ok: c => entradas(c, 'sap') >= 3 },
  { id: 'cazador', n: 'Cazador de posts', d: 'Caza tres posts en el mundo real.', ico: '🔎', eje: 'hacer', ok: c => entradas(c, 'caza') >= 3 },
  { id: 'consejo', n: 'Buen consejo', d: 'Resuelve las seis situaciones.', ico: '💬', eje: 'hacer', ok: c => Object.keys(c.situaciones).length >= 6 },
  { id: 'narrador', n: 'Narrador', d: 'Escribe tu relato.', ico: '📖', eje: 'crear', ok: c => !!c.relato.texto },
  { id: 'antesdespues', n: 'Antes y después', d: 'Vuelve a responder «Lo que creo» y compara.', ico: '⇄', eje: 'crear', ok: c => !!c.creencias.despues },
  { id: 'bautista', n: 'Bautista del relevo', d: 'Bautiza el siguiente post.', ico: '🏷', eje: 'crear', ok: c => entradas(c, 'bautizo') >= 1 },
  { id: 'revision', n: 'Segunda mirada', d: 'Revisa una entrada de tu cuaderno.', ico: '↻', eje: 'hacer', ok: c => c.entradas.some(e => e.revision) },
];

// Cambios con aviso
function comprobar(antes) {
  const c = estado;
  for (const e of ORDEN_EJES) {
    const p0 = antes[e], p1 = peldano(e, c);
    if (p1 > p0) aviso(`Subes en ${EJES[e].nombre}`, `Ahora estás en «${PELDANOS[e][p1].n}». ${PELDANOS[e][p1].d}`, e, EJES[e].ico);
  }
  for (const i of INSIGNIAS) if (!c.insignias[i.id] && i.ok(c)) { c.insignias[i.id] = new Date().toISOString(); aviso(`Insignia: ${i.n}`, i.d, i.eje, i.ico); }
}
function cambiar(f) {
  leer();
  const antes = Object.fromEntries(ORDEN_EJES.map(e => [e, peldano(e)]));
  f(estado);
  comprobar(antes);
  guardar();
}

export function sumar(eje, n = 5) { cambiar(c => { c.xp[eje] = (c.xp[eje] || 0) + n; }); }
export function fichaLeida(id) {
  leer();
  if (estado.fichas.includes(id)) return;
  cambiar(c => { c.fichas.push(id); c.xp.saber += 2; });
}
export function parada(n) { leer(); if (estado.paradas.includes(n)) return; cambiar(c => { c.paradas.push(n); c.xp.saber += 3; }); }
export function vista(k) { leer(); if (estado.vistas[k]) return; cambiar(c => { c.vistas[k] = new Date().toISOString(); c.xp.saber += 4; }); }
export function juego(k, puntos, total, extra = {}) {
  cambiar(c => {
    const j = c.juegos[k] || (c.juegos[k] = { veces: 0, mejor: 0, mejorPct: 0 });
    j.veces++; j.mejor = Math.max(j.mejor, puntos); j.mejorPct = Math.max(j.mejorPct, total ? puntos / total : 0);
    Object.assign(j, extra);
    c.xp.hacer += 5 + Math.round(10 * (total ? puntos / total : 0)); c.xp.saber += 3;
  });
}
export function detector(aciertos) { cambiar(c => { c.detector = Math.max(c.detector, aciertos); c.xp.saber += aciertos; }); }
export function sentir() { cambiar(c => { c.sap.sentir++; c.xp.ser += 2; }); }
export function entrada(tipo, titulo, datos, ejes = {}) {
  let id;
  cambiar(c => {
    id = `${tipo}-${Date.now().toString(36)}`;
    c.entradas.unshift({ id, tipo, fecha: new Date().toISOString(), titulo, datos });
    for (const [e, n] of Object.entries(ejes)) c.xp[e] = (c.xp[e] || 0) + n;
    if (tipo === 'sap') { c.sap.sentir++; c.sap.actuar++; c.sap.pensar++; c.sap.modos.entrenamiento = true; }
  });
  return id;
}
export function revisar(id, texto) { cambiar(c => { const e = c.entradas.find(x => x.id === id); if (e) { e.revision = { fecha: new Date().toISOString(), texto }; c.xp.hacer += 8; } }); }
export function borrarEntrada(id) { cambiar(c => { c.entradas = c.entradas.filter(x => x.id !== id); }); }
export function situacion(id, opcion, reto) { cambiar(c => { c.situaciones[id] = opcion; c.xp.hacer += 4; c.xp.crear += 2; if (reto) { c.sap.modos.reto = true; c.xp.ser += 3; } }); }
export function creencias(cuando, resp) { cambiar(c => { c.creencias[cuando] = { fecha: new Date().toISOString(), resp }; c.xp.crear += 6; }); }
export function relato(campos) { cambiar(c => { Object.assign(c.relato, campos); c.xp.crear += 6; }); }
export function borrarTodo() { estado = vacio(); guardar(); }

// Avisos flotantes
export function aviso(titulo, texto, eje, ico = '★') {
  const caja = document.getElementById('toasts');
  if (!caja) return;
  const t = h('div', { class: 'toast', role: 'status', style: { '--c': eje ? `var(--e-${eje})` : 'var(--accent)' } },
    h('span', { class: 'ic', 'aria-hidden': 'true' }, ico), h('div', null, h('b', null, titulo), texto));
  caja.append(t);
  setTimeout(() => { t.classList.add('sale'); setTimeout(() => t.remove(), 320); }, 4200);
}

// Indicador de la cabecera: cuatro barritas
export function pintarCabecera() {
  const barras = document.querySelectorAll('.mini-ejes i');
  ORDEN_EJES.forEach((e, k) => {
    const p = peldano(e), n = PELDANOS[e].length;
    if (barras[k]) barras[k].style.setProperty('--h', `${Math.max(3, Math.round(18 * (p + 1) / n))}px`);
  });
  const btn = document.querySelector('.cuaderno-btn');
  if (btn) btn.setAttribute('aria-label', 'Tu cuaderno: ' + ORDEN_EJES.map(e => { const p = peldano(e); return `${EJES[e].nombre}, ${p >= 0 ? PELDANOS[e][p].n : 'sin empezar'}`; }).join('; '));
}

export function chipEje(e) { return h('span', { class: 'chip chip-e', 'data-eje': e }, EJES[e].nombre); }
