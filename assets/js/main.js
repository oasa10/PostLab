// PostLab: carga los datos, gestiona las rutas (#/...) y el tema.
import Fuse from '../vendor/fuse-7.5.0.esm.min.js';
import { h, storage, tip } from './lib.js';
import * as cuaderno from './cuaderno.js';

const VISTAS = {
  '': () => import('./views/inicio.js'),
  explorar: () => import('./views/explorar.js'),
  termino: () => import('./views/ficha.js'),
  viajar: () => import('./views/cronologia.js'),
  visualizar: () => import('./views/visualizar.js'),
  aprender: () => import('./views/aprender.js'),
  jugar: () => import('./views/jugar.js'),
  pensar: () => import('./views/pensar.js'),
  cuaderno: () => import('./views/cuaderno.js'),
  conocer: () => import('./views/acerca.js'),
};
// Nivel 1: enterarte. Nivel 2: implicarte.
const NIVEL = { explorar: 1, termino: 1, viajar: 1, visualizar: 1, aprender: 2, jugar: 2, pensar: 2, cuaderno: 2 };
const NAV = { termino: 'explorar' };
// Direcciones antiguas
const ALIAS = { cronologia: 'viajar', mapa: 'visualizar/mapa', tendencias: 'visualizar/tendencias', acerca: 'conocer' };

const app = document.getElementById('app');
let ctx = null, actual = null, primera = true;

async function cargar() {
  const get = u => fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const [terms, rels, hitos, aprender] = await Promise.all([
    get('data/terminos.json'), get('data/relaciones.json'), get('data/hitos.json'), get('data/aprender.json')]);
  terms.sort((a, b) => a.lema.localeCompare(b.lema, 'es'));
  const byId = new Map(terms.map(t => [t.id, t]));
  const vecinos = new Map(terms.map(t => [t.id, new Set()]));
  for (const r of rels) { vecinos.get(r.o)?.add(r.d); vecinos.get(r.d)?.add(r.o); }
  const fuse = new Fuse(terms, {
    keys: [{ name: 'lema', weight: 3 }, { name: 'variantes', weight: 2 }, { name: 'figuras', weight: 1 }, { name: 'obra', weight: 1 },
      { name: 'base', weight: .6 }, { name: 'nucleo', weight: .5 }, { name: 'area', weight: .3 }],
    threshold: .34, ignoreLocation: true, ignoreDiacritics: true, includeScore: true, minMatchCharLength: 2,
  });
  const cronologico = terms.filter(t => t.anio !== null).sort((a, b) => a.anio - b.anio || a.lema.localeCompare(b.lema, 'es'));
  // Contenido largo de las fichas y datos de Pensar y aplicar: se cargan cuando hacen falta
  const perezoso = u => { let p = null; return () => (p ||= get(u).catch(e => { p = null; throw e; })); };
  const contenidoJson = perezoso('data/contenido.json');
  const contenido = () => contenidoJson().then(lista => new Map(lista.map(c => [c.id, c])));
  let contenidoMap = null;
  return { terms, byId, rels, hitos, aprender, vecinos, fuse, cronologico, juego: t => t.estado !== 'dudosa' && t.nucleo,
    contenido: () => contenidoMap ? Promise.resolve(contenidoMap) : contenido().then(m => (contenidoMap = m)),
    pensar: perezoso('data/pensar.json') };
}

function leerRuta() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(qs || '') };
}

async function ir() {
  const { parts, q } = leerRuta();
  const nombre = parts[0] || '';
  if (ALIAS[nombre]) {
    const qs = q.toString();
    location.replace(`#/${ALIAS[nombre]}${parts.length > 1 ? '/' + parts.slice(1).map(encodeURIComponent).join('/') : ''}${qs ? '?' + qs : ''}`);
    return;
  }
  const activo = NAV[nombre] || nombre;
  for (const a of document.querySelectorAll('.nav a, .cuaderno-btn, .inicio-btn')) {
    const sec = a.getAttribute('href').slice(2);
    if (sec === activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  document.body.dataset.nivel = NIVEL[nombre] || 0;
  tip.hide();
  if (actual?.destroy) { try { actual.destroy(); } catch (e) { /* nada */ } }
  actual = null;
  const cargarVista = VISTAS[nombre];
  const root = h('div', { class: 'wrap' });
  app.replaceChildren(root);
  if (!cargarVista) { noEncontrado(root); return; }
  try {
    const mod = await cargarVista();
    actual = (await mod.render(root, ctx, parts.slice(1), q)) || null;
  } catch (e) {
    console.error(e);
    root.replaceChildren(h('div', { class: 'empty' }, h('h1', null, 'Algo ha fallado'), h('p', null, 'No se ha podido mostrar esta página. Prueba a recargarla.')));
  }
  if (!primera) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
  primera = false;
}

function noEncontrado(root) {
  document.title = 'Página no encontrada · PostLab';
  root.append(h('div', { class: 'empty' }, h('h1', null, 'Página no encontrada'), h('p', null, 'Esta dirección no existe en PostLab. Quizá sea pos-página: la que vino después de que alguien escribiera mal el enlace.'),
    h('p', null, h('a', { class: 'btn', href: '#/' }, 'Volver al inicio'))));
}

function tema() {
  const cambiar = () => {
    const oscuro = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const nuevo = oscuro ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    storage('tema', nuevo);
    if (actual?.retema) actual.retema(); else ir();
  };
  for (const btn of document.querySelectorAll('#tema, .tema-pie')) btn.addEventListener('click', cambiar);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!document.documentElement.dataset.theme) { if (actual?.retema) actual.retema(); else ir(); } });
}

(async function inicio() {
  try { ctx = await cargar(); } catch (e) {
    console.error(e);
    app.replaceChildren(h('div', { class: 'wrap empty' }, h('h1', null, 'No se han podido cargar los datos'), h('p', null, 'Comprueba la conexión y recarga la página.')));
    return;
  }
  // D3 se carga aparte (script clásico); esperamos a que esté
  if (!window.d3) await new Promise(r => window.addEventListener('load', r, { once: true }));
  tema();
  cuaderno.pintarCabecera();
  cuaderno.alCambiar(() => cuaderno.pintarCabecera());
  window.addEventListener('hashchange', ir);
  ir();
})();
