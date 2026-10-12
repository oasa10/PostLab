import cytoscape from '../../vendor/cytoscape-3.34.3.esm.min.js';
import { h, anio, chipValor, famTag, famColor, cssVar, FAM_ANILLO, corta, plural } from '../lib.js';

export function render(root, ctx, parts, q) {
  document.title = 'Mapa · PostLab';
  const { terms, rels, byId, vecinos } = ctx;
  const familias = FAM_ANILLO.filter(f => terms.some(t => t.familia === f));
  const grado = id => vecinos.get(id)?.size || 0;
  const maxG = Math.max(1, ...terms.map(t => grado(t.id)));
  const puentes = rels.filter(r => byId.get(r.o)?.familia !== byId.get(r.d)?.familia);
  let soloPuentes = false, famSolo = null;

  // Tabla de puentes por pares de familias
  const pares = new Map();
  for (const r of puentes) {
    const k = [byId.get(r.o).familia, byId.get(r.d).familia].sort().join(' ↔ ');
    pares.set(k, (pares.get(k) || 0) + 1);
  }
  const topPares = [...pares.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const buscar = h('select', { 'aria-label': 'Elige un término para verlo en el mapa' },
    h('option', { value: '' }, 'Elige un término…'), [...terms].sort((a, b) => a.lema.localeCompare(b.lema, 'es')).map(t => h('option', { value: t.id }, t.lema)));
  const bPuentes = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false' }, 'Solo puentes entre familias');
  const bReset = h('button', { class: 'btn small', type: 'button' }, 'Ver todo');
  const leyenda = h('div', { class: 'legend', role: 'group', 'aria-label': 'Familias: pulsa una para destacarla' });
  const cyEl = h('div', { id: 'cy', role: 'img', 'aria-label': `Red de ${terms.length} términos y ${rels.length} conexiones, agrupados por familias. Usa el selector para elegir un término; su ficha lista sus conexiones.` });
  const panel = h('div', { class: 'card' });

  root.append(
    h('h1', null, 'Mapa'),
    h('p', { class: 'lead' }, `Cada punto es un término y cada línea, una conexión (${rels.length} en total). Los términos se agrupan por familia, según aquello a lo que se aplica el prefijo. Las líneas oscuras son puentes entre familias: los que más explican.`),
    h('div', { class: 'map-tools' }, buscar, bPuentes, bReset),
    leyenda,
    h('div', { class: 'map-wrap' }, cyEl, h('div', { class: 'map-panel' }, panel)),
  );

  function panelInicio() {
    panel.replaceChildren(
      h('h2', { style: { marginTop: 0, fontSize: '1.1rem' } }, 'Cómo leer el mapa'),
      h('p', { class: 'small' }, 'Pulsa un punto para ver el término y sus vecinos. Pulsa una familia en la leyenda para destacarla. Arrastra y pellizca para moverte.'),
      h('h3', { style: { fontSize: '1rem' } }, 'Puentes más transitados'),
      topPares.length ? h('div', { class: 'table-wrap' }, h('table', null,
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Familias'), h('th', { scope: 'col', class: 'num' }, 'Conexiones'))),
        h('tbody', null, topPares.map(([k, n]) => h('tr', null, h('td', null, k), h('td', { class: 'num' }, n)))))) : h('p', { class: 'small muted' }, 'Todavía no hay conexiones entre familias.'),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, `${plural(puentes.length, 'puente', 'puentes')} de ${rels.length} conexiones.`));
  }

  function panelTermino(t) {
    const vs = [...(vecinos.get(t.id) || [])].map(id => byId.get(id)).filter(Boolean).sort((a, b) => a.lema.localeCompare(b.lema, 'es'));
    panel.replaceChildren(
      h('p', { class: 'small muted', style: { margin: 0 } }, anio(t.anio)),
      h('h2', { style: { marginTop: '2px', fontSize: '1.35rem' } }, t.lema),
      h('div', { class: 'chips', style: { marginBottom: '10px' } }, t.valor.map(v => chipValor(v, { corto: true })), famTag(t.familia)),
      h('p', { class: 'small' }, corta(t.nucleo, 220)),
      ...(vs.length ? [h('h3', { style: { fontSize: '.95rem' } }, `${vs.length} ${vs.length === 1 ? 'conexión' : 'conexiones'}`),
        h('div', { class: 'chips' }, vs.map(v => h('button', { class: 'chip', type: 'button', onclick: () => elegir(v.id) },
          h('span', { class: 'dot', style: { '--c': `var(--f-${slug(v.familia)})` } }), v.lema)))] : [h('p', { class: 'small muted' }, 'Sin conexiones registradas.')]),
      h('p', { style: { marginTop: '14px' } }, h('a', { class: 'btn small primary', href: `#/termino/${encodeURIComponent(t.id)}` }, 'Ver la ficha')));
  }
  const slug = f => ({ 'Estilos': 'estilos', 'Modernidad': 'modernidad', 'Economía y trabajo': 'economia', 'Ciencia y conocimiento': 'ciencia', 'Humano y técnica': 'humano', 'Lenguaje y teoría': 'lenguaje', 'Colonia y orden mundial': 'colonia', 'Política y verdad': 'politica', 'Creencias': 'creencias', 'Épocas': 'epocas' })[f];

  let cy;
  function crear() {
    if (cy) cy.destroy();
    const c = { text: cssVar('--text'), text2: cssVar('--text-2'), line: cssVar('--line'), strong: cssVar('--muted'), surface: cssVar('--surface'), ink: cssVar('--ink'), accent: cssVar('--accent') };
    const conPos = terms.every(t => t.xy);
    const nodos = terms.map(t => ({ group: 'nodes', data: { id: t.id, label: t.lema, fam: t.familia, color: famColor(t.familia), g: grado(t.id) }, position: conPos ? { x: t.xy[0], y: t.xy[1] } : undefined }));
    // etiqueta de familia: fuera del grupo, en la dirección que lo aleja del centro del mapa
    const gx = terms.reduce((s, t) => s + (t.xy?.[0] || 0), 0) / terms.length, gy = terms.reduce((s, t) => s + (t.xy?.[1] || 0), 0) / terms.length;
    const etiquetas = conPos ? familias.map(f => {
      const ps = terms.filter(t => t.familia === f).map(t => t.xy);
      const cx = ps.reduce((s, p) => s + p[0], 0) / ps.length, cyy = ps.reduce((s, p) => s + p[1], 0) / ps.length;
      let dx = cx - gx, dy = cyy - gy; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      const alcance = Math.max(...ps.map(p => (p[0] - cx) * dx + (p[1] - cyy) * dy));
      return { group: 'nodes', data: { id: `fam:${f}`, label: f }, position: { x: cx + dx * (alcance + 40), y: cyy + dy * (alcance + 34) }, classes: 'famlabel', selectable: false, grabbable: false };
    }) : [];
    const aristas = rels.map((r, i) => ({ group: 'edges', data: { id: `e${i}`, source: r.o, target: r.d }, classes: byId.get(r.o).familia !== byId.get(r.d).familia ? 'puente' : '' }));
    cy = cytoscape({
      container: cyEl, elements: [...nodos, ...etiquetas, ...aristas],
      layout: conPos ? { name: 'preset', fit: true, padding: 30 } : { name: 'cose', animate: false, padding: 30 },
      minZoom: 0.15, maxZoom: 3, boxSelectionEnabled: false, autoungrabify: true,
      style: [
        { selector: 'node[color]', style: { 'background-color': 'data(color)', width: `mapData(g, 0, ${maxG}, 9, 30)`, height: `mapData(g, 0, ${maxG}, 9, 30)`,
          'border-width': 1.5, 'border-color': c.surface, label: 'data(label)', 'font-family': 'Inter, system-ui, sans-serif', 'font-size': `mapData(g, 0, ${maxG}, 9, 15)`,
          color: c.text, 'text-valign': 'bottom', 'text-margin-y': 3, 'text-outline-color': c.surface, 'text-outline-width': 2.5, 'min-zoomed-font-size': 8 } },
        { selector: 'node.famlabel', style: { label: 'data(label)', 'text-outline-color': c.surface, 'text-outline-width': 3, 'background-opacity': 0, 'border-width': 0, width: 1, height: 1, 'font-size': 30, 'font-weight': 600, color: c.text2,
          'text-valign': 'center', 'font-family': 'Fraunces, Georgia, serif', 'min-zoomed-font-size': 6, events: 'no' } },
        { selector: 'edge', style: { width: 1, 'line-color': c.line, 'curve-style': 'haystack', opacity: .9 } },
        { selector: 'edge.puente', style: { width: 1.6, 'line-color': c.strong, opacity: .75 } },
        { selector: '.oculto', style: { display: 'none' } },
        { selector: '.tenue', style: { opacity: .1 } },
        { selector: 'node.foco', style: { 'border-color': c.ink, 'border-width': 3, 'font-weight': 700, 'z-index': 10 } },
        { selector: 'node.vecino', style: { 'font-weight': 600, 'z-index': 9, 'min-zoomed-font-size': 0 } },
        { selector: 'edge.vecino', style: { 'line-color': c.ink, width: 2.2, opacity: 1, 'z-index': 8 } },
      ],
    });
    cy.on('tap', 'node', e => { if (!e.target.hasClass('famlabel')) elegir(e.target.id()); });
    cy.on('tap', e => { if (e.target === cy) limpiar(); });
    cy.on('mouseover', 'node', e => { if (!e.target.hasClass('famlabel')) cyEl.style.cursor = 'pointer'; });
    cy.on('mouseout', 'node', () => { cyEl.style.cursor = ''; });
    aplicarFiltros();
  }

  function aplicarFiltros() {
    cy.batch(() => {
      cy.elements().removeClass('oculto tenue');
      if (soloPuentes) cy.edges().not('.puente').addClass('oculto');
      if (famSolo) {
        const fuera = cy.nodes().filter(n => !n.hasClass('famlabel') && n.data('fam') !== famSolo);
        fuera.addClass('tenue');
        cy.edges().filter(e => e.source().data('fam') !== famSolo && e.target().data('fam') !== famSolo).addClass('tenue');
      }
    });
  }

  function elegir(id) {
    const n = cy.getElementById(id);
    if (!n || n.empty()) return;
    const t = byId.get(id);
    cy.batch(() => {
      cy.elements().removeClass('foco vecino tenue');
      const barrio = n.closedNeighborhood();
      cy.elements().not(barrio).not('.famlabel').addClass('tenue');
      barrio.addClass('vecino'); n.addClass('foco');
    });
    cy.animate({ center: { eles: n }, zoom: Math.max(cy.zoom(), 1.1) }, { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350 });
    buscar.value = id;
    panelTermino(t);
    history.replaceState(null, '', `#/mapa?t=${encodeURIComponent(id)}`);
  }
  function limpiar() {
    cy.elements().removeClass('foco vecino tenue');
    aplicarFiltros(); buscar.value = ''; panelInicio();
    history.replaceState(null, '', '#/mapa');
  }

  function pintarLeyenda() {
    leyenda.replaceChildren(...familias.map(f => h('button', { type: 'button', class: famSolo === f ? 'solo' : '', 'aria-pressed': famSolo ? String(famSolo === f) : 'true',
      onclick: () => { famSolo = famSolo === f ? null : f; cy.elements().removeClass('foco vecino'); pintarLeyenda(); aplicarFiltros(); panelInicio(); } },
      h('i', { style: { '--c': `var(--f-${slug(f)})` } }), `${f} (${terms.filter(t => t.familia === f).length})`)));
  }

  buscar.addEventListener('change', () => buscar.value ? elegir(buscar.value) : limpiar());
  bPuentes.addEventListener('click', () => { soloPuentes = !soloPuentes; bPuentes.setAttribute('aria-pressed', String(soloPuentes)); aplicarFiltros(); });
  bReset.addEventListener('click', () => { famSolo = null; soloPuentes = false; bPuentes.setAttribute('aria-pressed', 'false'); pintarLeyenda(); limpiar(); cy.fit(undefined, 30); });

  panelInicio(); pintarLeyenda(); crear();
  if (q.get('t') && byId.has(q.get('t'))) setTimeout(() => elegir(q.get('t')), 50);
  return {
    destroy: () => cy?.destroy(),
    retema: () => { const sel = buscar.value; crear(); if (sel) elegir(sel); },
  };
}
