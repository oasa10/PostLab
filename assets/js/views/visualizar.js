import { h, cabeza } from '../lib.js';
import * as cuaderno from '../cuaderno.js';

// Visualizar: el mapa post-relacional, las tendencias y el pulso, en una sola pestaña
const SUB = {
  mapa: { t: 'Mapa post-relacional', m: () => import('./mapa.js') },
  tendencias: { t: 'Tendencias', m: () => import('./tendencias.js') },
  pulso: { t: 'El pulso de lo post', m: () => import('./pulso.js') },
};

export async function render(root, ctx, parts, q) {
  const k = SUB[parts[0]] ? parts[0] : 'mapa';
  const cuerpo = h('div');
  root.append(
    cabeza(1, 'Visualizar', 'Lo post, de un vistazo y desde tres ángulos: quién se relaciona con quién, cómo ha cambiado con el tiempo y a qué ritmo late. Tres gráficos, cero fórmulas.'),
    h('nav', { class: 'subtabs', 'aria-label': 'Visualizaciones' },
      Object.entries(SUB).map(([clave, s]) => h('a', { href: `#/visualizar/${clave}`, 'aria-current': clave === k ? 'page' : null }, s.t))),
    cuerpo,
  );
  const mod = await SUB[k].m();
  const vista = await mod.render(cuerpo, ctx, parts.slice(1), q);
  cuaderno.vista(k);
  return vista;
}
