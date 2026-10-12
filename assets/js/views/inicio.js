import { h, poner, VALORES, CODIGOS, plural, tip, tipTerm, valColor, anio, recuadro, dialogo, inline } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { EJES, ORDEN_EJES, PELDANOS } from '../cuaderno.js';

export function render(root, ctx) {
  document.title = 'PostLab · Consulta, juega y aprende con todo lo post';
  const { terms, hitos, rels } = ctx;
  const fiables = terms.filter(t => t.estado === 'verificada' || t.estado === 'probable').length;
  const cuenta = c => terms.filter(t => t.valor.includes(c)).length;
  const azar = () => { const ok = terms.filter(ctx.juego); location.hash = `#/termino/${encodeURIComponent(ok[Math.floor(Math.random() * ok.length)].id)}`; };

  const q = h('input', { type: 'search', name: 'q', placeholder: 'Busca un término, una persona o una obra', 'aria-label': 'Buscar en PostLab', autocomplete: 'off' });
  const form = h('form', { class: 'search-big', role: 'search', onsubmit: e => { e.preventDefault(); location.hash = `#/explorar?q=${encodeURIComponent(q.value.trim())}`; } }, q);

  const art = h('div', { class: 'hero-art' });
  const dato = h('div');
  const c = cuaderno.leer();
  root.append(
    h('section', { class: 'hero' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Ya no, todavía no'),
        h('h1', { html: 'Post<b>Lab</b>' }),
        h('p', { class: 'sub' }, 'Consulta, juega y aprende con todo lo post'),
        h('p', { class: 'lead' }, `Posmodernidad, posverdad, post-punk, poscolonialismo… Cuando algo deja de convencer y lo que viene aún no tiene nombre, le ponemos un «pos» delante. PostLab reúne ${terms.length} de esos «después», con su fecha, sus fuentes y lo que significan hoy, para que los consultes, juegues con ellos y los uses para pensar tu época.`),
        form,
        h('div', { class: 'btns', style: { marginTop: '14px' } },
          h('a', { class: 'btn primary', href: '#/explorar' }, 'Explorar los términos'),
          h('button', { class: 'btn', type: 'button', onclick: azar }, '🎲 Un término al azar'),
          h('a', { class: 'btn', href: '#/pensar' }, 'Pensar y aplicar')),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', null, terms.length), h('span', null, 'términos')),
          h('div', { class: 'stat' }, h('b', null, hitos.length), h('span', null, 'hitos')),
          h('div', { class: 'stat' }, h('b', null, rels.length), h('span', null, 'conexiones')),
          h('div', { class: 'stat' }, h('b', null, fiables), h('span', null, 'fichas verificadas o probables')))),
      art),
    h('section', null,
      h('h2', null, 'Dos maneras de usar PostLab'),
      h('p', { class: 'lead' }, 'Puedes venir a enterarte o venir a implicarte. Las dos valen, y lo mejor es pasar de una a otra.'),
      h('div', { class: 'dos-niveles' },
        h('div', { class: 'nivel-box n1' },
          h('p', { class: 'nivel' }, 'Nivel 1'), h('h2', null, 'Enterarte'),
          h('p', null, 'Para saber qué hay: lees, recorres y miras. Tú pones la curiosidad; PostLab, los datos.'),
          h('div', { class: 'tiles' },
            tile('#/explorar', '⌕', 'Explorar', 'Los términos, con filtros y una ficha para cada uno: cómo surgió, para qué sirve y qué tiene que ver con hoy.'),
            tile('#/viajar', '⟿', 'Viajar', 'Una máquina del tiempo de 1700 a hoy, con viaje guiado en seis paradas.'),
            tile('#/visualizar', '✳', 'Visualizar', 'El mapa post-relacional, las tendencias y el pulso de lo post.'))),
        h('div', { class: 'nivel-box n2' },
          h('p', { class: 'nivel' }, 'Nivel 2'), h('h2', null, 'Implicarte'),
          h('p', null, 'Para hacer algo con ello: aprendes, juegas, piensas y lo aplicas a tu mundo. Lo que hagas queda en tu cuaderno.'),
          h('div', { class: 'tiles' },
            tile('#/aprender', '◎', 'Aprender', 'Una ruta de diez paradas, los seis valores, las cinco P y un detector de saltos.'),
            tile('#/jugar', '★', 'Jugar', 'Cuatro juegos para poner a prueba lo aprendido, con marcas que superar.'),
            tile('#/pensar', '✎', 'Pensar y aplicar', 'Seis actividades para mirar tu época con otros ojos y escribir tu propio relato.'))))),
    h('section', null,
      h('h2', null, 'Tu recorrido, en cuatro ejes'),
      h('p', { class: 'muted' }, 'PostLab no solo informa: te acompaña por cuatro caminos. Cada cosa que haces aquí te hace subir un peldaño en alguno.'),
      h('div', { class: 'ejes' }, ORDEN_EJES.map(e => {
        const P = PELDANOS[e], p = cuaderno.peldano(e, c);
        return h('a', { class: 'eje', 'data-eje': e, href: '#/cuaderno', style: { textDecoration: 'none', color: 'var(--text)' } },
          h('h3', null, h('span', { 'aria-hidden': 'true', style: { color: 'var(--c)' } }, EJES[e].ico, ' '), EJES[e].nombre),
          h('div', { class: 'sub' }, EJES[e].sub),
          h('div', { class: 'barra', 'aria-hidden': 'true' }, h('i', { style: { '--w': `${Math.round(100 * (p + 1) / P.length)}%` } })),
          h('p', { class: 'small', style: { margin: '8px 0 0' } }, p >= 0 ? ['Estás en ', h('b', null, P[p].n.toLowerCase()), '.'] : 'Sin empezar.'));
      })),
      h('p', { class: 'small', style: { marginTop: '10px' } }, h('a', { href: '#/cuaderno' }, 'Abrir tu cuaderno →'))),
    dato,
    h('section', null,
      h('h2', null, 'Seis maneras de decir «después»'),
      h('p', { class: 'lead' }, 'El prefijo no siempre significa lo mismo. A veces solo pone fecha; otras rompe, radicaliza, constata un vaciamiento, anuncia un final o señala un parentesco.'),
      h('div', { class: 'vcards' }, CODIGOS.map(c => h('a', { class: 'vcard', href: `#/explorar?valor=${c}`, style: { '--c': `var(--v-${c})` } },
        h('span', { class: 'n' }, `${c} · ${cuenta(c)} términos`), h('b', null, VALORES[c].nombre), h('i', null, `«${VALORES[c].llana}»`)))),
      recuadro('recuerda', 'Para recordarlos en orden', h('i', null, 'Después de la fiesta, contra todo pronóstico, fuimos más allá; lo que quedó, tras el final, tuvo un hijo.'),
        h('div', { class: 'small', style: { marginTop: '4px' } }, 'Después de (P1), contra (P2), más allá (P3), lo que queda de (P4), después del final (P5) e hijo de (P6).')),
      h('p', { style: { marginTop: '12px' } }, h('a', { href: '#/aprender/valores' }, 'Cómo se distinguen los seis valores →'))),
    h('section', null,
      h('h2', null, 'La idea en una frase'),
      dialogo([['yano', 'Ya no creemos en los grandes relatos de antes.'], ['todavia', 'Y todavía no tenemos otros.']]),
      h('p', { class: 'kicker', style: { fontSize: '1.3rem', maxWidth: '36em' } }, 'Post es el prefijo del «ya no, todavía no»: declara que algo heredado ha perdido autoridad sin nombrar lo que lo sustituye.'),
      h('p', null, h('a', { href: '#/aprender' }, 'Empieza la ruta guiada →'))),
  );
  ctx.contenido().then(m => {
    const con = terms.filter(t => m.get(t.id)?.sabias_que);
    const otro = () => {
      const t = con[Math.floor(Math.random() * con.length)];
      poner(dato, recuadro('sabias', null, inline(m.get(t.id).sabias_que),
        h('div', { class: 'btns', style: { marginTop: '8px' } }, h('a', { class: 'btn small', href: `#/termino/${encodeURIComponent(t.id)}` }, `Ficha: ${t.lema}`),
          h('button', { class: 'btn small', type: 'button', onclick: otro }, 'Otro dato'))));
    };
    if (con.length) otro();
  }).catch(() => {});
  waffle(art, ctx);
}

function tile(href, ico, titulo, texto) {
  return h('a', { class: 'card tile', href }, h('span', { class: 'ico', 'aria-hidden': 'true' }, ico), h('h3', null, titulo), h('p', null, texto));
}

// Retrato de los datos: un punto por término, del más antiguo al más reciente, coloreado por valor
function waffle(el, ctx) {
  const d3 = window.d3;
  const ts = ctx.cronologico.concat(ctx.terms.filter(t => t.anio === null));
  const cols = 15, cell = 20, r = 7, rows = Math.ceil(ts.length / cols);
  const W = cols * cell, H = rows * cell + 26;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img')
    .attr('aria-label', `Un punto por término, ordenados del más antiguo (${anio(ts[0].anio)}) al más reciente, coloreados por el valor del prefijo.`);
  svg.selectAll('circle').data(ts).join('circle')
    .attr('cx', (d, i) => (i % cols) * cell + cell / 2).attr('cy', (d, i) => Math.floor(i / cols) * cell + cell / 2).attr('r', r)
    .attr('fill', d => d.valor[0] ? valColor(d.valor[0]) : 'var(--line-strong)')
    .attr('stroke', 'var(--bg)').attr('stroke-width', 2).style('cursor', 'pointer')
    .on('mousemove', (e, d) => tip.show(tipTerm(d), e.clientX, e.clientY)).on('mouseleave', () => tip.hide())
    .on('click', (e, d) => { tip.hide(); location.hash = `#/termino/${encodeURIComponent(d.id)}`; });
  el.append(h('div', { class: 'legend', style: { justifyContent: 'center', marginTop: '6px' }, 'aria-hidden': 'true' },
    CODIGOS.map(c => h('span', null, h('i', { style: { '--c': `var(--v-${c})` } }), c))));
  svg.append('text').attr('x', 0).attr('y', H - 6).attr('class', 'lbl').style('font-size', '11px').style('fill', 'var(--muted)')
    .text(`${anio(ts[0].anio)} → ${anio(ctx.cronologico.at(-1).anio)} · cada punto, un término`);
}
