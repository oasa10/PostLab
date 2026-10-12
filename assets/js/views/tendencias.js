import { h, VALORES, CODIGOS, FASES, FAM_ANILLO, famVar, tip, valColor, plural, tintaSobre } from '../lib.js';

const pct = (a, b) => b ? Math.round(100 * a / b) : 0;

export function render(root, ctx) {
  document.title = 'Tendencias · PostLab';
  const d3 = window.d3;
  const { terms } = ctx;
  const cajas = {};
  const caja = (k) => (cajas[k] = h('div', { class: 'viz-body' }));

  // Datos
  const desde1900 = terms.filter(t => t.anio !== null && t.anio >= 1900);
  const antes = terms.filter(t => t.anio !== null && t.anio >= 1700 && t.anio < 1900).length;
  const decadas = d3.range(1900, 2030, 10).map(d => ({ d, n: desde1900.filter(t => t.decada === d).length, ts: desde1900.filter(t => t.decada === d) }));
  const fases = FASES.slice(1).map(f => {
    const ts = terms.filter(t => t.fase === f.n);
    const etiquetas = ts.flatMap(t => t.valor);
    return { ...f, n: ts.length, tot: etiquetas.length, por: CODIGOS.map(c => ({ c, n: etiquetas.filter(v => v === c).length })) };
  });
  const areas = d3.rollups(terms, v => v.length, t => t.area).sort((a, b) => b[1] - a[1]);
  const fams = FAM_ANILLO.map(f => [f, terms.filter(t => t.familia === f).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  const grados = [1, 2, 3].map(g => terms.filter(t => t.grado === g));
  const pico = decadas.reduce((a, b) => (b.n > a.n ? b : a));
  const f2 = fases[1], f3 = fases[2];
  const share = (f, c) => pct(f.por.find(p => p.c === c).n, f.tot);
  const top2 = f2.por.slice().sort((a, b) => b.n - a.n)[0];

  root.append(
    h('h2', { class: 'vis-h' }, 'Tendencias'),
    h('p', { class: 'vis-lead' }, 'Cuándo se dispara el prefijo, qué clase de «después» manda en cada época y en qué campos se usa más. Un aviso honrado: contamos los términos de PostLab, no cuántas veces se dice cada palabra por la calle.'),
    bloque('Términos por década', `La década con más términos es la de ${pico.d} (${pico.n}). Antes de 1900 hay ${plural(antes, 'término', 'términos')} desde 1700, que no aparecen en el gráfico.`, caja('dec'),
      tabla(['Década', 'Términos'], decadas.map(x => [`${x.d}s`, x.n]))),
    bloque('Del post que rompe al post que lamenta', `En la eclosión (1966–1994) el valor más frecuente es ${top2.c}, ${VALORES[top2.c].nombre.toLowerCase()} (${pct(top2.n, f2.tot)} % de las etiquetas). Desde 1995 el agotamiento (P4) pasa del ${share(f2, 'P4')} % al ${share(f3, 'P4')} %, y la ruptura (P2) del ${share(f2, 'P2')} % al ${share(f3, 'P2')} %.`, caja('fase'),
      tabla(['Fase', ...CODIGOS, 'Etiquetas'], fases.map(f => [`${f.corto} · ${f.nombre}`, ...f.por.map(p => `${p.n} (${pct(p.n, f.tot)} %)`), f.tot])),
      'Porcentaje de etiquetas de valor en cada fase. Un término puede llevar dos valores.'),
    h('div', { class: 'grid g2' },
      bloque('Por áreas', `${areas.length} áreas del saber. La que más términos reúne es ${areas[0][0].toLowerCase()} (${areas[0][1]}).`, caja('area'), tabla(['Área', 'Términos'], areas)),
      bloque('Por familias', 'Agrupados por aquello a lo que se aplica el prefijo: la base.', caja('fam'), tabla(['Familia', 'Términos'], fams))),
    h('section', null, h('h2', null, 'Grados: el después del después'),
      h('p', { class: 'muted' }, 'Casi todos los términos son de primer grado. Apilar el prefijo es raro, y a la tercera ya es parodia (o un grito de auxilio).'),
      h('div', { class: 'grid g3' },
        statG('Primer grado', 'post', grados[0]), statG('Segundo grado', 'post-post', grados[1]), statG('Tercer grado', 'post-post-post', grados[2]))),
  );

  function statG(t, forma, ts) {
    return h('div', { class: 'card' }, h('div', { class: 'stat' }, h('b', null, ts.length), h('span', null, `${t} · ${forma}`)),
      ts.length && ts.length < 12 ? h('div', { class: 'chips', style: { marginTop: '10px' } }, ts.map(x => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(x.id)}` }, x.lema))) : null);
  }

  function dibujar() {
    barrasDecada(cajas.dec);
    apiladoFases(cajas.fase);
    barrasH(cajas.area, areas, () => 'var(--ink)', a => `#/explorar?area=${encodeURIComponent(a)}`);
    barrasH(cajas.fam, fams, f => famVar(f), f => `#/explorar?familia=${encodeURIComponent(f)}`);
  }

  function barrasDecada(el) {
    el.replaceChildren();
    const W = Math.max(300, el.clientWidth), H = 260, M = { t: 24, r: 8, b: 26, l: 30 };
    const x = d3.scaleBand().domain(decadas.map(d => d.d)).range([M.l, W - M.r]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(decadas, d => d.n) * 1.12]).nice().range([H - M.b, M.t]);
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', `Términos por década desde 1900. Máximo en ${pico.d}: ${pico.n}.`);
    // fase de eclosión sombreada
    const xe0 = x(1960) + x.bandwidth() * 0.6, xe1 = x(1990) + x.bandwidth();
    svg.append('rect').attr('x', xe0).attr('y', M.t - 16).attr('width', xe1 - xe0).attr('height', H - M.b - M.t + 16).attr('fill', 'var(--surface-2)');
    svg.append('text').attr('x', xe0 + 4).attr('y', M.t - 4).attr('class', 'lbl').style('font-size', '11px').style('fill', 'var(--muted)').text('Eclosión 1966–1994');
    svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(4).slice(1)).join('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', d => y(d)).attr('y2', d => y(d));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(6)).call(g => g.select('.domain').remove());
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`).call(d3.axisBottom(x).tickFormat(d => W < 520 ? `’${String(d).slice(2)}` : d).tickSizeOuter(0));
    const r = Math.min(4, x.bandwidth() / 2);
    svg.append('g').selectAll('path').data(decadas).join('path')
      .attr('d', d => barra(x(d.d), y(d.n), x.bandwidth(), y(0) - y(d.n), r)).attr('fill', 'var(--accent)');
    // etiquetas selectivas: las tres décadas con más términos
    const top = decadas.slice().sort((a, b) => b.n - a.n).slice(0, 3);
    svg.append('g').selectAll('text').data(top).join('text').attr('class', 'lbl-strong').attr('text-anchor', 'middle')
      .attr('x', d => x(d.d) + x.bandwidth() / 2).attr('y', d => y(d.n) - 5).text(d => d.n);
    svg.append('g').selectAll('rect').data(decadas).join('rect').attr('x', d => x(d.d) - x.step() * x.paddingInner() / 2).attr('width', x.step())
      .attr('y', M.t).attr('height', H - M.b - M.t).attr('fill', 'transparent')
      .on('mousemove', (e, d) => tip.show([h('b', null, `${d.d}s · ${plural(d.n, 'término', 'términos')}`),
        h('div', null, d.ts.slice(0, 8).map(t => t.lema).join(', ') + (d.ts.length > 8 ? '…' : ''))], e.clientX, e.clientY))
      .on('mouseleave', () => tip.hide());
  }

  function apiladoFases(el) {
    el.replaceChildren();
    const W = Math.max(300, el.clientWidth), movil = W < 560, filaH = 44, M = { t: 8, r: 8, b: 8, l: movil ? 64 : 230 };
    const H = M.t + fases.length * (filaH + 18) + M.b;
    const x = d3.scaleLinear().domain([0, 1]).range([M.l, W - M.r]);
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img')
      .attr('aria-label', 'Reparto de los seis valores del prefijo en cada fase, en porcentaje de etiquetas.');
    fases.forEach((f, i) => {
      const y = M.t + i * (filaH + 18);
      svg.append('text').attr('x', 0).attr('y', y + filaH / 2 - (movil ? 0 : 7)).attr('dy', '0.35em').attr('class', 'lbl-strong').text(movil ? f.corto : `${f.corto} · ${f.nombre}`);
      if (!movil) svg.append('text').attr('x', 0).attr('y', y + filaH / 2 + 9).attr('dy', '0.35em').attr('class', 'lbl').style('fill', 'var(--muted)')
        .text(`${f.desde}–${Math.min(f.hasta, 2026)} · ${plural(f.n, 'término', 'términos')}`);
      let acc = 0;
      f.por.forEach(p => {
        const fr = f.tot ? p.n / f.tot : 0;
        if (!fr) return;
        const x0 = x(acc), x1 = x(acc + fr);
        const w = Math.max(0, x1 - x0 - 2);
        svg.append('rect').attr('x', x0).attr('y', y).attr('width', w).attr('height', filaH).attr('rx', 3).attr('fill', valColor(p.c))
          .on('mousemove', e => tip.show([h('b', null, `${p.c} · ${VALORES[p.c].nombre}`), h('div', null, `${f.corto}: ${p.n} etiquetas, ${pct(p.n, f.tot)} %`)], e.clientX, e.clientY))
          .on('mouseleave', () => tip.hide());
        if (w > (movil ? 34 : 46)) svg.append('text').attr('x', x0 + w / 2).attr('y', y + filaH / 2).attr('dy', '0.35em').attr('text-anchor', 'middle')
          .style('fill', tintaSobre(valColor(p.c))).style('font-size', '12px').style('font-weight', 600).style('pointer-events', 'none').text(`${p.c} ${pct(p.n, f.tot)}%`);
        acc += fr;
      });
    });
  }

  function barrasH(el, datos, color, enlace) {
    el.replaceChildren();
    const W = Math.max(280, el.clientWidth), fila = 24, M = { t: 4, r: 34, b: 4, l: Math.min(210, W * 0.52) };
    const H = M.t + datos.length * fila + M.b;
    const x = d3.scaleLinear().domain([0, d3.max(datos, d => d[1])]).range([M.l, W - M.r]);
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', datos.map(d => `${d[0]}: ${d[1]}`).join('; '));
    const g = svg.selectAll('g').data(datos).join('g').attr('transform', (d, i) => `translate(0,${M.t + i * fila})`);
    const a = g.append('a').attr('href', d => enlace(d[0]));
    a.append('text').attr('x', M.l - 8).attr('y', fila / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('class', 'lbl')
      .text(d => recorta(d[0], Math.floor((M.l - 10) / 6.4)));
    a.append('path').attr('d', d => barra(M.l, 4, x(d[1]) - M.l, fila - 8, 3, true)).attr('fill', d => color(d[0]));
    g.append('text').attr('x', d => x(d[1]) + 5).attr('y', fila / 2).attr('dy', '0.35em').attr('class', 'lbl-strong').text(d => d[1]);
    g.append('title').text(d => `${d[0]}: ${d[1]}`);
  }

  dibujar();
  let ancho = root.clientWidth;
  const ro = new ResizeObserver(() => { if (Math.abs(root.clientWidth - ancho) > 20) { ancho = root.clientWidth; dibujar(); } });
  ro.observe(root);
  return { destroy: () => ro.disconnect(), retema: dibujar };
}

function bloque(titulo, texto, cuerpo, tablaEl, pie) {
  return h('section', { class: 'viz' },
    h('div', { class: 'viz-head' }, h('h3', null, titulo)),
    h('p', { class: 'small', style: { color: 'var(--text-2)', margin: '4px 0 10px' } }, texto),
    titulo.startsWith('Del post') ? h('div', { class: 'legend', 'aria-hidden': 'true' }, CODIGOS.map(c => h('span', null, h('i', { style: { '--c': `var(--v-${c})` } }), `${c} ${VALORES[c].nombre}`))) : null,
    cuerpo,
    pie ? h('p', { class: 'small muted', style: { margin: '6px 0 0' } }, pie) : null,
    h('details', { style: { marginTop: '8px' } }, h('summary', { class: 'small' }, 'Ver los datos en una tabla'), tablaEl));
}

function tabla(cabeza, filas) {
  return h('div', { class: 'table-wrap' }, h('table', null,
    h('thead', null, h('tr', null, cabeza.map((c, i) => h('th', { scope: 'col', class: i ? 'num' : null }, c)))),
    h('tbody', null, filas.map(f => h('tr', null, f.map((c, i) => h('td', { class: i ? 'num' : null }, c)))))));
}

function recorta(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// Barra con el extremo de datos redondeado y la base recta
function barra(x, y, w, hgt, r, horizontal = false) {
  if (w <= 0 || hgt <= 0) return '';
  r = Math.min(r, horizontal ? hgt / 2 : w / 2, horizontal ? w : hgt);
  if (horizontal) return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + hgt - r}Q${x + w},${y + hgt} ${x + w - r},${y + hgt}H${x}Z`;
  return `M${x},${y + hgt}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + hgt}Z`;
}
