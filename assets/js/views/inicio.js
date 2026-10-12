import { h, VALORES, CODIGOS, plural, tip, tipTerm, valColor, anio } from '../lib.js';

export function render(root, ctx) {
  document.title = 'PostLab · Consulta, juega y aprende con todo lo post';
  const { terms, hitos, rels } = ctx;
  const fiables = terms.filter(t => t.estado === 'verificada' || t.estado === 'probable').length;
  const cuenta = c => terms.filter(t => t.valor.includes(c)).length;
  const azar = () => { const ok = terms.filter(ctx.juego); location.hash = `#/termino/${encodeURIComponent(ok[Math.floor(Math.random() * ok.length)].id)}`; };

  const q = h('input', { type: 'search', name: 'q', placeholder: 'Busca un término, una persona o una obra', 'aria-label': 'Buscar en PostLab', autocomplete: 'off' });
  const form = h('form', { class: 'search-big', role: 'search', onsubmit: e => { e.preventDefault(); location.hash = `#/explorar?q=${encodeURIComponent(q.value.trim())}`; } }, q);

  const art = h('div', { class: 'hero-art' });
  root.append(
    h('section', { class: 'hero' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Ya no, todavía no'),
        h('h1', { html: 'Post<b>Lab</b>' }),
        h('p', { class: 'sub' }, 'Consulta, juega y aprende con todo lo post'),
        h('p', { class: 'lead' }, `Posmodernidad, posverdad, post-punk, poscolonialismo… Desde 1703, el prefijo pos- nombra lo que viene «después». PostLab reúne ${terms.length} términos con su fecha, su obra, sus conexiones y sus fuentes.`),
        form,
        h('div', { class: 'btns', style: { marginTop: '14px' } },
          h('a', { class: 'btn primary', href: '#/explorar' }, 'Explorar los términos'),
          h('button', { class: 'btn', type: 'button', onclick: azar }, 'Un término al azar'),
          h('a', { class: 'btn', href: '#/jugar' }, 'Jugar')),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', null, terms.length), h('span', null, 'términos')),
          h('div', { class: 'stat' }, h('b', null, hitos.length), h('span', null, 'hitos')),
          h('div', { class: 'stat' }, h('b', null, rels.length), h('span', null, 'conexiones')),
          h('div', { class: 'stat' }, h('b', null, fiables), h('span', null, 'fichas verificadas o probables')))),
      art),
    h('section', null,
      h('h2', null, 'Seis maneras de decir «después»'),
      h('p', { class: 'lead' }, 'El prefijo no siempre significa lo mismo. A veces solo fecha; otras rompe, radicaliza, constata un vaciamiento, anuncia un final o señala un parentesco.'),
      h('div', { class: 'vcards' }, CODIGOS.map(c => h('a', { class: 'vcard', href: `#/explorar?valor=${c}`, style: { '--c': `var(--v-${c})` } },
        h('span', { class: 'n' }, `${c} · ${cuenta(c)} términos`), h('b', null, VALORES[c].nombre), h('i', null, `«${VALORES[c].llana}»`)))),
      h('p', { style: { marginTop: '12px' } }, h('a', { href: '#/aprender/valores' }, 'Cómo se distinguen los seis valores →'))),
    h('section', null,
      h('h2', null, 'Qué puedes hacer'),
      h('div', { class: 'grid g3' },
        tile('#/explorar', '⌕', 'Explorar', 'Busca y filtra por área, familia, valor, década o estado de verificación. Cada término tiene su ficha.'),
        tile('#/cronologia', '↔', 'Cronología', 'De 1703 a hoy, con las tres fases de lo post y los hitos que las marcan.'),
        tile('#/mapa', '✳', 'Mapa', 'La red de conexiones entre términos, agrupados por familias, con los puentes entre ellas.'),
        tile('#/tendencias', '▤', 'Tendencias', 'Cuándo se dispara el prefijo y cómo pasa de romper a lamentar.'),
        tile('#/aprender', '◎', 'Aprender', 'Una ruta de diez paradas, las cinco P para leer cualquier post y un detector de saltos.'),
        tile('#/jugar', '★', 'Jugar', '¿Qué post es?, Ordena la historia y Seis maneras de decir «después».'))),
    h('section', null,
      h('h2', null, 'La idea en una frase'),
      h('p', { class: 'kicker', style: { fontSize: '1.3rem', maxWidth: '36em' } }, 'Post es el prefijo del «ya no, todavía no»: declara que algo heredado ha perdido autoridad sin nombrar lo que lo sustituye.'),
      h('p', null, h('a', { href: '#/aprender' }, 'Empieza la ruta guiada →'))),
  );
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
