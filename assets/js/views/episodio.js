// El episodio del día (W5, W6), la vuelta y el modo clase (W15). El motor es común a las webs del proyecto.
import { h, VALORES, cabeza, recuadro, imgValor } from '../lib.js';
import { obtener, episodios } from '../episodio.js';

export async function render(root, ctx, parts, q, ruta) {
  const E = await obtener(ctx);
  if (ruta === 'clase') return parts[0] ? proyectar(root, ctx, E, parts[0]) : clase(root, ctx, E);
  if (ruta === 'vuelta') {
    document.title = 'Tu vuelta · PostLab';
    root.append(h('nav', { class: 'crumbs' }, h('a', { href: '#/cuaderno' }, 'Tu cuaderno'), ' › Tu vuelta'));
    const caja = h('div', { class: 'ep-sitio' });
    root.append(caja);
    E.vuelta(caja, parts[0]);
    return { destroy: () => E.parar() };
  }
  // #/episodio y #/episodio/<id>
  const lista = await episodios(ctx);
  const ep = lista.find(e => e.id === parts[0]) || E.deHoy();
  document.title = `${ep ? ep.palabra + ' · ' : ''}Episodio · PostLab`;
  const caja = h('div', { class: 'ep-sitio' });
  const todos = h('div');
  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/' }, 'Inicio'), ' › Episodio'),
    caja,
    h('details', { class: 'ep-todos' }, h('summary', null, `Los ${lista.length} episodios`),
      h('p', { class: 'small muted' }, 'Uno nuevo al día, y nada caduca: los que ya abriste se pueden repetir siempre. Para una clase, mejor el ', h('a', { href: '#/clase' }, 'modo clase'), ', que abre cualquiera.'),
      todos));
  E.abrir(caja, ep && ep.id);
  E.lista(todos, { alAbrir: id => { location.hash = `#/episodio/${encodeURIComponent(id)}`; } });
  return { destroy: () => E.parar() };
}

// Modo clase: quien enseña elige una palabra, la proyecta y el grupo vota sin nombres
async function clase(root, ctx, E) {
  document.title = 'Para clases y grupos · PostLab';
  const lista = await episodios(ctx);
  root.append(
    cabeza(0, 'Para clases y grupos', 'PostLab cabe en una sesión de clase o de taller: una palabra, siete tiempos y la conversación que salga. Funciona en un proyector o en una pantalla grande, sin cuentas y sin que nadie dé su nombre.'),
    h('ol', { class: 'clase-pasos' },
      h('li', null, h('b', null, 'Elige una palabra. '), 'Abajo están las treinta que tienen episodio, cada una con su manera de decir «después».'),
      h('li', null, h('b', null, 'Proyecta el episodio. '), 'En el Choque y en el Reflejo el grupo vota a mano alzada y tú cuentas los votos en la pantalla. Se cuenta el grupo, nunca a una persona.'),
      h('li', null, h('b', null, 'Usa la ficha como guion. '), 'Cada palabra tiene su ficha verificada: cómo surgió, cinco ejemplos y qué tiene que ver con hoy. Ábrela en otra pestaña para tenerla a mano.'),
      h('li', null, h('b', null, 'Vuelve otro día. '), 'La misión es del grupo y se cuenta en la sesión siguiente.')),
    recuadro('aclaracion', 'Lo que no se guarda', 'En modo clase no se guarda nada en el dispositivo: ni votos, ni misiones, ni historias. Y el Reflejo no lleva reloj en las palabras que tocan temas delicados (', lista.filter(e => e.riesgo).map(e => e.palabra).join(', '), '): ahí se decide con calma.'),
    h('h2', null, 'Elige una palabra'),
    h('div', { class: 'clase-grid' }, lista.map(e => {
      const v = VALORES[e.valor];
      return h('article', { class: 'card clase-card', style: { '--c': `var(--v-${e.valor})` } },
        h('div', { class: 'clase-cab' }, imgValor(e.valor), h('div', null, h('h3', null, e.palabra), h('p', { class: 'small muted' }, `${e.valor} · «${v ? v.llana : ''}»`))),
        h('p', null, e.resumen),
        h('div', { class: 'btns' },
          h('a', { class: 'btn small primary', href: `#/clase/${encodeURIComponent(e.id)}` }, '▶ Proyectar'),
          h('a', { class: 'btn small', href: `#/termino/${encodeURIComponent(e.termino)}`, target: '_blank', rel: 'noopener' }, 'Ficha (guion)')));
    })),
    h('p', { class: 'small muted', style: { marginTop: '18px' } }, 'Las otras ', ctx.terms.length - lista.length, ' palabras de PostLab no tienen episodio todavía, pero sus fichas sirven igual de guion: ', h('a', { href: '#/explorar' }, 'búscalas en Explorar'), '.'));
}

async function proyectar(root, ctx, E, id) {
  const lista = await episodios(ctx);
  const ep = lista.find(e => e.id === id);
  if (!ep) { location.replace('#/clase'); return; }
  document.title = `${ep.palabra} · Modo clase · PostLab`;
  const caja = h('div', { class: 'ep-sitio' });
  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/clase' }, 'Para clases y grupos'), ` › ${ep.palabra}`),
    caja,
    h('p', { class: 'small muted', style: { textAlign: 'center' } }, 'Guion para quien guía: ',
      h('a', { href: `#/termino/${encodeURIComponent(ep.termino)}`, target: '_blank', rel: 'noopener' }, `la ficha de «${ep.palabra}», en otra pestaña`), '.'));
  E.abrir(caja, ep.id, { grupo: true });
  return { destroy: () => E.parar() };
}
