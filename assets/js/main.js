// PostLab: carga los datos, gestiona las rutas (#/...) y el tema.
import Fuse from '../vendor/fuse-7.5.0.esm.min.js';
import { h, storage, tip } from './lib.js';

const VISTAS = {
  '': () => import('./views/inicio.js'),
  explorar: () => import('./views/explorar.js'),
  termino: () => import('./views/ficha.js'),
  cronologia: () => import('./views/cronologia.js'),
  mapa: () => import('./views/mapa.js'),
  tendencias: () => import('./views/tendencias.js'),
  aprender: () => import('./views/aprender.js'),
  jugar: () => import('./views/jugar.js'),
  acerca: () => import('./views/acerca.js'),
};

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
  return { terms, byId, rels, hitos, aprender, vecinos, fuse, cronologico, juego: t => t.estado !== 'dudosa' && t.nucleo };
}

function leerRuta() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(qs || '') };
}

async function ir() {
  const { parts, q } = leerRuta();
  const nombre = parts[0] || '';
  for (const a of document.querySelectorAll('.nav a')) {
    const sec = a.getAttribute('href').slice(2);
    if (sec === nombre || (sec === 'explorar' && nombre === 'termino')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
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
  root.append(h('div', { class: 'empty' }, h('h1', null, 'Página no encontrada'), h('p', null, 'Esta dirección no existe en PostLab.'),
    h('p', null, h('a', { class: 'btn', href: '#/' }, 'Volver al inicio'))));
}

function tema() {
  const btn = document.getElementById('tema');
  btn.addEventListener('click', () => {
    const oscuro = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const nuevo = oscuro ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    storage('tema', nuevo);
    if (actual?.retema) actual.retema(); else ir();
  });
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
  window.addEventListener('hashchange', ir);
  ir();
})();
