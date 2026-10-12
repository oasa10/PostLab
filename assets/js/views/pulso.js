import { h, VALORES, CODIGOS, tip, valColor, cssVar, plural, recuadro, toggles } from '../lib.js';

// El pulso de lo post: cada término nuevo es un latido
export function render(root, ctx) {
  document.title = 'El pulso de lo post · PostLab';
  const d3 = window.d3;
  const desde = 1900, hasta = 2026;
  const fechados = ctx.terms.filter(t => t.anio !== null);
  const antiguos = fechados.filter(t => t.anio < desde).sort((a, b) => a.anio - b.anio);
  let filtro = null;
  const anual = () => {
    const ts = fechados.filter(t => t.anio >= desde && (!filtro || t.valor.includes(filtro)));
    return d3.range(desde, hasta + 1).map(a => ({ a, ts: ts.filter(t => t.anio === a) }));
  };
  const todos = anual();
  const decadas = d3.rollups(todos.filter(x => x.ts.length), v => d3.sum(v, x => x.ts.length), x => Math.floor(x.a / 10) * 10).sort((a, b) => b[1] - a[1]);
  const record = todos.reduce((m, x) => (x.ts.length > m.ts.length ? x : m));
  const silencio = (() => { // la racha más larga sin latidos desde 1900
    let mejor = { n: 0, a: desde }, n = 0;
    todos.forEach(x => { if (x.ts.length) n = 0; else { n++; if (n > mejor.n) mejor = { n, a: x.a - n + 1 }; } });
    return mejor;
  })();

  const caja = h('div', { class: 'ecg-scroll' });
  const leer = h('p', { class: 'small', 'aria-live': 'polite', style: { minHeight: '1.5em', margin: '8px 0 0' } });
  const otraVez = h('button', { class: 'btn small', type: 'button', onclick: () => dibujar(true) }, '♥ Volver a tomar el pulso');
  const filtros = toggles([['', 'Todos'], ...CODIGOS.map(c => [c, `${c} ${VALORES[c].nombre}`])], { valor: '', alCambiar: v => { filtro = v || null; if (v === null) filtros.querySelector('button').click(); else dibujar(true); } });
  const tablaBody = h('tbody');

  root.append(
    h('h2', { class: 'vis-h' }, 'El pulso de lo post'),
    h('p', { class: 'vis-lead' }, 'Si la historia de las ideas tuviera electrocardiograma, este sería el de lo post. Cada pico es un año en que nacen términos con el prefijo; su altura, cuántos. Donde la línea va plana, nadie inventó ninguno (o no lo hemos encontrado).'),
    h('div', { class: 'grid g3', style: { margin: '6px 0 4px' } },
      stat(decadas[0][1], `latidos en la década de ${decadas[0][0]}, la más agitada`),
      stat(record.ts.length, `en ${record.a}, el año récord`),
      stat(silencio.n, `años seguidos de línea plana (${silencio.a}–${silencio.a + silencio.n - 1})`)),
    h('section', { class: 'viz ecg' },
      h('div', { class: 'viz-head' }, h('h3', null, 'Términos nuevos por año, 1900–2026'), otraVez),
      h('p', { class: 'small', style: { color: 'var(--text-2)', margin: '4px 0 6px' } }, '¿Y si miramos solo un tipo de «después»? Elige un valor del prefijo:'),
      filtros,
      caja,
      leer,
      h('details', { style: { marginTop: '8px' } }, h('summary', { class: 'small' }, 'Ver los latidos en una tabla'),
        h('div', { class: 'table-wrap' }, h('table', null,
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Año'), h('th', { scope: 'col', class: 'num' }, 'Términos'), h('th', { scope: 'col' }, 'Cuáles'))), tablaBody)))),
    recuadro('aclaracion', 'Cómo se lee', 'Es un cardiograma conceptual, no una medida de uso: cuenta el año en que cada término de PostLab queda fijado (por una obra, un hito o el inicio de un periodo). Que haya pocos picos en los años 2020 no significa que lo post se apague: a muchas palabras les cuesta años llegar a los libros.'),
    recuadro('sabias', null, `Antes de 1900 solo hay ${plural(antiguos.length, 'latido', 'latidos')}, repartidos a lo largo de ${(Math.round((desde - antiguos[0].anio) / 100) * 100).toLocaleString('es-ES')} años. Y casi todos son etiquetas que se pusieron mucho después: nadie en el ${Math.abs(antiguos[0].anio).toLocaleString('es-ES')} a. C. se sentía «${antiguos[0].lema.toLowerCase()}».`),
    h('div', { class: 'chips' }, antiguos.map(t => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema, h('span', { class: 'muted' }, t.anio < 0 ? `${Math.abs(t.anio).toLocaleString('es-ES')} a. C.` : t.anio)))),
  );

  let raf = 0;
  function dibujar(animar) {
    cancelAnimationFrame(raf);
    tip.hide();
    const datos = anual();
    caja.replaceChildren();
    tablaBody.replaceChildren(...datos.filter(x => x.ts.length).map(x => h('tr', null, h('td', null, x.a), h('td', { class: 'num' }, x.ts.length),
      h('td', null, x.ts.map((t, i) => [i ? ', ' : '', h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema)])))));
    const W = Math.max(640, caja.clientWidth || 640), H = 260, M = { t: 44, r: 10, b: 26, l: 10 };
    const base = H - M.b - 50;
    const x = d3.scaleLinear().domain([desde, hasta + 1]).range([M.l, W - M.r]);
    const max = Math.max(4, d3.max(datos, d => d.ts.length));
    const y = n => base - (n / max) * (base - M.t);
    const color = filtro ? valColor(filtro) : cssVar('--accent', document.body);
    const svg = d3.select(caja).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('role', 'img')
      .attr('aria-label', `Cardiograma de términos nuevos por año entre 1900 y 2026${filtro ? `, solo ${filtro}` : ''}. Récord: ${d3.max(datos, d => d.ts.length)} en un año. La tabla de abajo tiene los datos.`);
    // papel milimetrado
    const rej = svg.append('g').attr('class', 'rejilla');
    rej.selectAll('line.v').data(d3.range(desde, hasta + 1, 5)).join('line').attr('class', 'v').attr('x1', x).attr('x2', x).attr('y1', M.t - 14).attr('y2', H - M.b)
      .attr('stroke-width', a => (a % 10 ? 0.5 : 1));
    rej.selectAll('line.h').data(d3.range(M.t - 14, H - M.b + 1, (H - M.b - M.t + 14) / 8)).join('line').attr('class', 'h').attr('x1', M.l).attr('x2', W - M.r).attr('y1', d => d).attr('y2', d => d).attr('stroke-width', 0.5);
    // fases
    [[1966, 1995, 'Eclosión'], [1995, 2027, 'Diversificación']].forEach(([a, b, n]) => {
      svg.append('rect').attr('x', x(a)).attr('width', x(b) - x(a)).attr('y', M.t - 14).attr('height', H - M.b - M.t + 14).attr('fill', color).attr('opacity', 0.06);
      svg.append('text').attr('x', x(a) + 4).attr('y', H - M.b - 6).style('font-size', '11px').style('fill', 'var(--muted)').text(n);
    });
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickValues(d3.range(desde, hasta + 1, 10)).tickFormat(d => d).tickSizeOuter(0));
    // la línea: un complejo QRS por cada año con términos
    const p = d3.path();
    p.moveTo(M.l, base);
    const paso = x(desde + 1) - x(desde);
    datos.forEach(d => {
      const cx = x(d.a) + paso / 2, n = d.ts.length;
      if (!n) return;
      const a = Math.min(paso * 0.9, 6);
      p.lineTo(cx - a, base); p.lineTo(cx - a * 0.55, base + 4); p.lineTo(cx, y(n)); p.lineTo(cx + a * 0.55, base + 10 + n * 1.5); p.lineTo(cx + a, base);
    });
    p.lineTo(W - M.r, base);
    const linea = svg.append('path').attr('class', 'linea').attr('d', p.toString()).style('stroke', color);
    if (caja.scrollWidth > caja.clientWidth) caja.scrollLeft = caja.scrollWidth; // en el móvil, empezar por los años con más latidos
    const len = linea.node().getTotalLength();
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // etiquetas de los tres años con más latidos
    const top = datos.filter(d => d.ts.length).sort((a, b) => b.ts.length - a.ts.length || a.a - b.a).slice(0, 3);
    // si dos rótulos se pisan, el de menos latidos sube un renglón
    const puestos = [];
    top.forEach(d => {
      const r = { cx: x(d.a) + paso / 2, w: `${d.a} · ${d.ts.length}`.length * 7, y: y(d.ts.length) - 6 };
      while (puestos.some(o => Math.abs(o.cx - r.cx) < (o.w + r.w) / 2 + 4 && Math.abs(o.y - r.y) < 14)) r.y -= 14;
      d.ly = Math.max(12, r.y); puestos.push(r);
    });
    const etiquetas = svg.append('g').selectAll('text').data(top).join('text').attr('class', 'lbl-strong').attr('text-anchor', 'middle')
      .attr('x', d => x(d.a) + paso / 2).attr('y', d => d.ly).text(d => `${d.a} · ${d.ts.length}`);
    const punto = svg.append('g').attr('class', 'latido').append('circle').attr('r', 5).style('fill', color).attr('opacity', 0);
    if (animar && !quieto) {
      linea.classed('anim', true).style('--len', len);
      etiquetas.attr('opacity', 0).transition().delay(3600).duration(400).attr('opacity', 1);
      const t0 = performance.now(), dur = 4000;
      const mover = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const pt = linea.node().getPointAtLength(e * len);
        punto.attr('cx', pt.x).attr('cy', pt.y).attr('opacity', k < 1 ? 1 : 0);
        if (k < 1) raf = requestAnimationFrame(mover);
      };
      raf = requestAnimationFrame(mover);
    }
    // cursor y lectura
    const cursor = svg.append('line').attr('y1', M.t - 14).attr('y2', H - M.b).attr('stroke', 'var(--ink)').attr('stroke-width', 1).attr('stroke-dasharray', '3 3').attr('opacity', 0);
    const cerca = px => {
      const a = Math.floor(x.invert(px));
      for (const dd of [0, -1, 1, -2, 2]) { const d = datos.find(z => z.a === a + dd); if (d && d.ts.length) return d; }
      return datos.find(z => z.a === a);
    };
    svg.append('rect').attr('x', M.l).attr('y', M.t - 14).attr('width', W - M.l - M.r).attr('height', H - M.b - M.t + 14).attr('fill', 'transparent')
      .on('mousemove', e => {
        const [px] = d3.pointer(e); const d = cerca(px); if (!d) return;
        cursor.attr('x1', x(d.a) + paso / 2).attr('x2', x(d.a) + paso / 2).attr('opacity', 0.6);
        tip.show([h('b', null, `${d.a} · ${d.ts.length ? plural(d.ts.length, 'latido', 'latidos') : 'línea plana'}`),
          d.ts.length ? h('div', null, d.ts.map(t => t.lema).join(', ')) : null], e.clientX, e.clientY);
      })
      .on('mouseleave', () => { cursor.attr('opacity', 0); tip.hide(); })
      .on('click', e => { const d = cerca(d3.pointer(e)[0]); if (d?.ts.length === 1) location.hash = `#/termino/${encodeURIComponent(d.ts[0].id)}`; });
    const totalF = d3.sum(datos, d => d.ts.length);
    leer.textContent = filtro
      ? `${plural(totalF, 'término', 'términos')} ${filtro} (${VALORES[filtro].llana}) desde 1900. ${totalF ? `Su año más intenso: ${top[0].a}.` : ''}`
      : `${plural(totalF, 'término', 'términos')} desde 1900. Pasa por encima para ver qué nació cada año; en el móvil, desliza la gráfica hacia atrás para ver los primeros años.`;
  }

  dibujar(true);
  let ancho = root.clientWidth;
  const ro = new ResizeObserver(() => { if (Math.abs(root.clientWidth - ancho) > 30) { ancho = root.clientWidth; dibujar(false); } });
  ro.observe(root);
  return { destroy: () => { ro.disconnect(); cancelAnimationFrame(raf); }, retema: () => dibujar(false) };
}

function stat(n, texto) {
  return h('div', { class: 'card stat' }, h('b', null, n), h('span', null, texto));
}
