import { h, VALORES, CODIGOS, FASES, anio, tip, tipTerm, valColor, marcaEstado, plural } from '../lib.js';

const VISTAS = [
  { k: 'todo', l: 'Todo', d: [1695, 2030] },
  { k: 'f1', l: '1700–1965 · Precursores', d: [1695, 1968] },
  { k: 'f2', l: '1966–1994 · Eclosión', d: [1963, 1997] },
  { k: 'f3', l: '1995–hoy · Diversificación', d: [1992, 2028] },
];

export function render(root, ctx, parts, q) {
  document.title = 'Cronología · PostLab';
  const d3 = window.d3;
  const foco = q.get('t') ? ctx.byId.get(q.get('t')) : null;
  const datos = ctx.cronologico.filter(t => t.anio >= 1700);
  const antiguos = ctx.cronologico.filter(t => t.anio < 1700);
  const sinFecha = ctx.terms.filter(t => t.anio === null);
  const hitos = ctx.hitos.filter(x => x.anio !== null).sort((a, b) => a.anio - b.anio);

  const botones = VISTAS.map(v => h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', onclick: () => irA(v.d, v.k) }, v.l));
  const verLista = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', onclick: () => alternarLista() }, 'Ver como lista');
  const caja = h('div', { class: 'viz' });
  const lista = h('div', { hidden: true });
  root.append(
    h('h1', null, 'Cronología'),
    h('p', { class: 'lead' }, `${plural(datos.length, 'término', 'términos')} de 1700 a hoy, cada uno en el año de la obra o el hito que lo fija. Cada fila es un valor del prefijo. Arrastra para moverte, usa la rueda o los dedos para acercarte, o elige una fase.`),
    h('div', { class: 'tl-tools' }, botones, h('span', { style: { flex: 1 } }), verLista),
    h('div', { class: 'legend', 'aria-hidden': 'true' }, CODIGOS.map(c => h('span', null, h('i', { style: { '--c': `var(--v-${c})` } }), `${c} ${VALORES[c].nombre}`)),
      h('span', null, h('i', { style: { '--c': 'var(--ink)', borderRadius: '1px', transform: 'rotate(45deg)', width: '8px', height: '8px' } }), 'Hito')),
    caja, lista,
    antiguos.length || sinFecha.length ? h('p', { class: 'small muted' },
      antiguos.length ? [`${plural(antiguos.length, 'término fecha', 'términos fechan')} periodos anteriores a 1700 (`, antiguos.map((t, i) => [i ? ', ' : '', h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema)]), '). '] : '',
      sinFecha.length ? `${plural(sinFecha.length, 'término no tiene', 'términos no tienen')} fecha fiable y no aparecen aquí.` : '') : null,
    h('h2', null, 'Hitos'),
    h('p', { class: 'muted' }, 'Momentos que marcan la historia de lo post. Pulsa un término para ver su ficha.'),
    h('ul', { class: 'hitos-list' }, hitos.map(x => h('li', null,
      h('span', { class: 'y' }, x.anioFin && x.anioFin !== x.anio ? `${anio(x.anio)}–${String(x.anioFin).slice(-2)}` : anio(x.anio)),
      h('div', null, x.hito, ' ', marcaEstado(x.estado),
        x.terminos.length ? h('div', { class: 'chips', style: { marginTop: '6px' } }, x.terminos.map(id => ctx.byId.get(id)).filter(Boolean)
          .map(t => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema))) : null,
        x.fuente?.url ? h('div', { class: 'small' }, h('a', { href: x.fuente.url, rel: 'noopener', target: '_blank' }, x.fuente.titulo || 'Fuente')) : null)))),
  );

  // Tabla accesible: la cronología como lista
  lista.append(h('div', { class: 'table-wrap' }, h('table', null,
    h('caption', { class: 'sr-only' }, 'Términos por año'),
    h('thead', null, h('tr', null, ['Año', 'Término', 'Valor', 'Obra o hito'].map(x => h('th', { scope: 'col' }, x)))),
    h('tbody', null, datos.map(t => h('tr', null, h('td', { class: 'num' }, anio(t.anio)),
      h('td', null, h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, t.lema)),
      h('td', null, t.valor.map(v => `${v} ${VALORES[v].nombre}`).join(', ')), h('td', null, t.obra)))))));
  function alternarLista() {
    const on = lista.hidden;
    lista.hidden = !on; caja.hidden = on;
    verLista.setAttribute('aria-pressed', String(on)); verLista.textContent = on ? 'Ver como gráfico' : 'Ver como lista';
  }

  // Gráfico
  let dominio = foco && foco.anio >= 1700 ? [foco.anio - 18, foco.anio + 18] : (root.clientWidth < 600 ? [1900, 2028] : VISTAS[0].d);
  let zoom, svg, xBase, W, M, LANE, TOP, Hh, zx;
  const carriles = CODIGOS.concat(datos.some(t => !t.valor.length) ? ['—'] : []);
  const carril = t => t.valor[0] || '—';

  function dibujar() {
    caja.replaceChildren();
    W = Math.max(320, caja.clientWidth - 28);
    const movil = W < 600;
    M = { l: movil ? 34 : 128, r: 12 };
    LANE = movil ? 46 : 54; TOP = 64;
    Hh = TOP + carriles.length * LANE + 28;
    svg = d3.select(caja).append('svg').attr('viewBox', `0 0 ${W} ${Hh}`).attr('role', 'img')
      .attr('aria-label', `Cronología de ${datos.length} términos entre 1700 y ${datos.at(-1).anio}, en filas por valor del prefijo, con las tres fases sombreadas. Hay una versión en lista.`);
    xBase = d3.scaleLinear().domain(VISTAS[0].d).range([M.l, W - M.r]);
    svg.append('defs').append('clipPath').attr('id', 'tlclip').append('rect').attr('x', M.l).attr('y', 0).attr('width', W - M.l - M.r).attr('height', Hh);
    const fases = svg.append('g').attr('clip-path', 'url(#tlclip)');
    const rejilla = svg.append('g').attr('class', 'grid');
    const ejes = svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${Hh - 24})`);
    const capaHitos = svg.append('g').attr('clip-path', 'url(#tlclip)');
    const capa = svg.append('g').attr('clip-path', 'url(#tlclip)');
    // etiquetas de carril
    const lab = svg.append('g');
    carriles.forEach((c, i) => {
      const y = TOP + i * LANE + LANE / 2;
      svg.append('line').attr('x1', M.l).attr('x2', W - M.r).attr('y1', TOP + i * LANE).attr('y2', TOP + i * LANE).attr('stroke', 'var(--line)');
      const g = lab.append('g').attr('transform', `translate(4,${y})`);
      g.append('circle').attr('r', 5).attr('cx', 5).attr('fill', c === '—' ? 'var(--line-strong)' : valColor(c));
      g.append('text').attr('x', 15).attr('dy', '0.35em').attr('class', 'lbl-strong').text(c === '—' ? 'Sin valor' : c);
      if (!movil && c !== '—') g.append('text').attr('x', 38).attr('dy', '0.35em').attr('class', 'lbl').text(VALORES[c].nombre);
    });
    svg.append('text').attr('x', 4).attr('y', 31).attr('class', 'lbl').style('fill', 'var(--muted)').text(movil ? 'Hitos' : 'Hitos ◆');

    zx = xBase.copy();
    function pintar() {
      const x = zx;
      // fases
      fases.selectAll('rect').data(FASES.slice(1)).join('rect')
        .attr('x', f => x(Math.max(f.desde, 1695))).attr('width', f => Math.max(0, x(Math.min(f.hasta + 1, 2030)) - x(Math.max(f.desde, 1695))))
        .attr('y', 0).attr('height', Hh - 24).attr('fill', (f, i) => i % 2 ? 'var(--surface-2)' : 'transparent').attr('opacity', .9);
      fases.selectAll('line').data(FASES.slice(2)).join('line').attr('x1', f => x(f.desde)).attr('x2', f => x(f.desde)).attr('y1', TOP - 18).attr('y2', Hh - 24).attr('stroke', 'var(--line-strong)').attr('stroke-dasharray', '3 3');
      fases.selectAll('text').data(FASES.slice(1)).join('text')
        .attr('x', f => Math.max(M.l + 4, x(Math.max(f.desde, 1695)) + 6)).attr('y', TOP - 6).attr('class', 'lbl').style('fill', 'var(--muted)').style('font-size', '11px')
        .text(f => { const ini = Math.max(M.l, x(Math.max(f.desde, 1695))), fin = Math.min(W - M.r, x(Math.min(f.hasta + 1, 2030))); const w = fin - ini; const largo = `${f.corto} · ${f.nombre}`;
          return w > largo.length * 6 + 14 ? largo : w > f.corto.length * 6 + 12 ? f.corto : ''; });
      // eje
      const ticks = Math.max(3, Math.floor((W - M.l) / 80));
      ejes.call(d3.axisBottom(x).ticks(ticks).tickFormat(d3.format('d')).tickSizeOuter(0));
      rejilla.selectAll('line').data(x.ticks(ticks)).join('line').attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', TOP).attr('y2', Hh - 24);
      // hitos: en tres filas, cada uno en la primera fila donde no pisa al anterior
      const fin = [-1e9, -1e9, -1e9], fila = new Map();
      for (const d of hitos) {
        const x0 = x(d.anio), x1 = d.anioFin && d.anioFin > d.anio ? x(d.anioFin) : x0;
        let k = fin.findIndex(f => x0 - f >= 11);
        if (k < 0) k = fin.indexOf(Math.min(...fin));
        fin[k] = x1; fila.set(d, k);
      }
      capaHitos.selectAll('g.h').data(hitos).join(enter => {
        const g = enter.append('g').attr('class', 'h').style('cursor', 'help');
        g.append('line').attr('stroke', 'var(--ink)').attr('stroke-width', 2).attr('stroke-linecap', 'round');
        g.append('rect').attr('width', 8).attr('height', 8).attr('x', -4).attr('y', -4).attr('transform', 'rotate(45)').attr('fill', 'var(--ink)').attr('stroke', 'var(--surface)').attr('stroke-width', 1.5);
        g.append('rect').attr('class', 'hit').attr('x', -9).attr('y', -12).attr('width', 18).attr('height', 24).attr('fill', 'transparent');
        g.on('mousemove', (e, d) => tip.show([h('b', null, d.anioFin && d.anioFin !== d.anio ? `${d.anio}–${d.anioFin}` : String(d.anio)), h('div', null, d.hito)], e.clientX, e.clientY))
          .on('mouseleave', () => tip.hide());
        return g;
      }).attr('transform', d => `translate(${x(d.anio)},${14 + fila.get(d) * 13})`)
        .select('line').attr('x1', 0).attr('x2', d => d.anioFin && d.anioFin > d.anio ? x(d.anioFin) - x(d.anio) : 0).attr('y1', 0).attr('y2', 0);
      // términos: apilado sin solapes dentro de cada carril
      const r = movil ? 4 : 5, paso = r * 2 + 1.5;
      const pos = new Map();
      carriles.forEach((c, i) => {
        const yc = TOP + i * LANE + LANE / 2, maxOff = LANE / 2 - r - 2;
        const colocados = [];
        for (const t of datos.filter(t => carril(t) === c)) {
          const px = x(t.anio);
          let off = 0;
          for (let k = 0; k < 40; k++) {
            off = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * paso;
            if (Math.abs(off) > maxOff) { off = 0; break; }
            if (!colocados.some(p => Math.abs(p.x - px) < paso && Math.abs(p.y - (yc + off)) < paso)) break;
          }
          colocados.push({ x: px, y: yc + off });
          pos.set(t.id, [px, yc + off]);
        }
      });
      capa.selectAll('circle').data(datos, d => d.id).join(enter => enter.append('circle')
        .attr('stroke', 'var(--surface)').attr('stroke-width', 1.5).style('cursor', 'pointer')
        .on('mousemove', (e, d) => tip.show(tipTerm(d), e.clientX, e.clientY)).on('mouseleave', () => tip.hide())
        .on('click', (e, d) => { tip.hide(); location.hash = `#/termino/${encodeURIComponent(d.id)}`; }))
        .attr('r', d => foco && d.id === foco.id ? r + 2.5 : r)
        .attr('cx', d => pos.get(d.id)[0]).attr('cy', d => pos.get(d.id)[1])
        .attr('fill', d => d.valor[0] ? valColor(d.valor[0]) : 'var(--line-strong)')
        .attr('stroke', d => foco && d.id === foco.id ? 'var(--ink)' : 'var(--surface)').attr('stroke-width', d => foco && d.id === foco.id ? 2.5 : 1.5);
      // etiquetas directas cuando hay sitio
      const vis = datos.filter(t => { const p = pos.get(t.id); return p[0] >= M.l && p[0] <= W - M.r; });
      const etiquetas = foco ? vis.filter(t => t.id === foco.id) : [];
      const pxAnio = (x(2000) - x(1990)) / 10;
      const peso = t => ctx.vecinos.get(t.id)?.size || 0;
      if (pxAnio > 9) for (const t of vis.slice().sort((a, b) => peso(b) - peso(a))) if (!etiquetas.includes(t)) etiquetas.push(t);
      // una etiqueta solo se pone si no pisa otra etiqueta ni ningún punto
      const usadas = [], puntos = vis.map(t => [t.id, ...pos.get(t.id)]);
      capa.selectAll('text.tl').data(etiquetas.filter(t => {
        const [px, py] = pos.get(t.id), x0 = px + r + 2, w = t.lema.length * 6.3 + 4;
        if (x0 + w > W - M.r) return false;
        if (usadas.some(u => x0 < u.x + u.w && x0 + w > u.x && Math.abs(py - u.y) < 13)) return false;
        if (puntos.some(([id, qx, qy]) => id !== t.id && qx + r > x0 && qx - r < x0 + w && Math.abs(qy - py) < r + 6)) return false;
        usadas.push({ x: x0, y: py, w }); return true;
      }), d => d.id).join('text').attr('class', d => foco && d.id === foco.id ? 'tl lbl-strong' : 'tl lbl')
        .attr('x', d => pos.get(d.id)[0] + r + 3).attr('y', d => pos.get(d.id)[1]).attr('dy', '0.35em').style('pointer-events', 'none').text(d => d.lema);
    }
    zoom = d3.zoom().scaleExtent([1, 24]).translateExtent([[M.l, 0], [W - M.r, Hh]]).extent([[M.l, 0], [W - M.r, Hh]])
      .filter(e => (!e.ctrlKey || e.type === 'wheel') && !e.button)
      .on('zoom', e => { zx = e.transform.rescaleX(xBase); pintar(); for (const b of botones) b.setAttribute('aria-pressed', 'false'); });
    svg.call(zoom).on('dblclick.zoom', null);
    pintar();
    aplicar(dominio, false);
  }

  function aplicar(d, animar = true) {
    dominio = d;
    const k = (xBase.range()[1] - xBase.range()[0]) / (xBase(d[1]) - xBase(d[0]));
    const t = d3.zoomIdentity.scale(k).translate(-xBase(d[0]) + M.l / k, 0);
    (animar && !matchMedia('(prefers-reduced-motion: reduce)').matches ? svg.transition().duration(450) : svg).call(zoom.transform, t);
  }
  function irA(d, k) { aplicar(d); setTimeout(() => botones.forEach((b, i) => b.setAttribute('aria-pressed', String(VISTAS[i].k === k))), 470); }

  dibujar();
  if (!foco && root.clientWidth >= 600) botones[0].setAttribute('aria-pressed', 'true');
  let ancho = caja.clientWidth;
  const ro = new ResizeObserver(() => { if (Math.abs(caja.clientWidth - ancho) > 20) { ancho = caja.clientWidth; dibujar(); } });
  ro.observe(caja);
  return { destroy: () => ro.disconnect(), retema: () => dibujar() };
}
