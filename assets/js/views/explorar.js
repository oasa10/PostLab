import { h, VALORES, CODIGOS, FAMILIAS, ESTADOS, termCard, plural, norm } from '../lib.js';

const FILTROS = ['area', 'familia', 'valor', 'grado', 'decada', 'estado'];

export function render(root, ctx, parts, q) {
  document.title = 'Explorar · PostLab';
  const { terms, fuse } = ctx;
  const estado = { q: q.get('q') || '', orden: q.get('orden') || '' };
  for (const f of FILTROS) estado[f] = q.get(f) || '';

  const areas = [...new Set(terms.map(t => t.area))].sort((a, b) => a.localeCompare(b, 'es'));
  const decadas = [...new Set(terms.map(t => t.decada).filter(d => d !== null))].sort((a, b) => a - b);
  const opts = {
    area: [['', 'Todas las áreas'], ...areas.map(a => [a, a])],
    familia: [['', 'Todas las familias'], ...FAMILIAS.filter(f => terms.some(t => t.familia === f)).map(f => [f, f])],
    valor: [['', 'Todos los valores'], ...CODIGOS.map(c => [c, `${c} · ${VALORES[c].nombre}`])],
    grado: [['', 'Todos los grados'], ['1', 'Primero (post)'], ['2', 'Segundo (post-post)'], ['3', 'Tercero (post-post-post)']],
    decada: [['', 'Todas las décadas'], ['antes', 'Antes de 1700'], ...decadas.map(d => [String(d), `${d}s`])],
    estado: [['', 'Todos los estados'], ...Object.entries(ESTADOS).filter(([k]) => terms.some(t => t.estado === k)).map(([k, v]) => [k, v.nombre])],
  };
  const etiquetas = { area: 'Área', familia: 'Familia', valor: 'Valor del prefijo', grado: 'Grado', decada: 'Década', estado: 'Verificación' };

  const input = h('input', { type: 'search', value: estado.q, placeholder: 'Busca un término, una persona, una obra o una idea', 'aria-label': 'Buscar términos', autocomplete: 'off' });
  const selects = {};
  const filtros = h('div', { class: 'filters' }, FILTROS.map(f => {
    const s = h('select', { 'aria-label': etiquetas[f] }, opts[f].map(([v, l]) => h('option', { value: v, selected: v === estado[f] }, l)));
    s.addEventListener('change', () => { estado[f] = s.value; pintar(); });
    selects[f] = s;
    return h('label', { class: 'f' }, etiquetas[f], s);
  }));
  const orden = h('select', { 'aria-label': 'Ordenar por' },
    [['', 'Orden: relevancia o alfabético'], ['anio', 'Orden: del más antiguo al más reciente'], ['-anio', 'Orden: del más reciente al más antiguo'], ['lema', 'Orden: alfabético']]
      .map(([v, l]) => h('option', { value: v, selected: v === estado.orden }, l)));
  orden.addEventListener('change', () => { estado.orden = orden.value; pintar(); });
  const cuenta = h('span', { 'aria-live': 'polite' });
  const limpiar = h('button', { class: 'btn small', type: 'button', onclick: () => {
    estado.q = ''; input.value = ''; for (const f of FILTROS) { estado[f] = ''; selects[f].value = ''; } pintar(); input.focus();
  } }, 'Quitar filtros');
  const lista = h('div', { class: 'results' });
  const mas = h('div', { class: 'btns', style: { justifyContent: 'center', marginTop: '18px' } });

  root.append(
    h('h1', null, 'Explorar'),
    h('p', { class: 'lead' }, `${terms.length} términos con el prefijo pos-. Busca por nombre, persona u obra, o filtra por área, familia, valor del prefijo, grado, década y estado de verificación.`),
    h('div', { class: 'search-big' }, input),
    filtros,
    h('div', { class: 'resbar' }, cuenta, h('div', { class: 'btns' }, orden, limpiar)),
    lista, mas);

  let t0;
  input.addEventListener('input', () => { clearTimeout(t0); t0 = setTimeout(() => { estado.q = input.value.trim(); pintar(); }, 120); });

  // Primero coincidencias literales (sin tildes), por orden de importancia del campo; si hay pocas, se añaden las aproximadas
  const CAMPOS = [t => [t.lema], t => t.variantes, t => t.figuras.concat(t.obra), t => [t.base, t.nucleo, t.area, t.familia]];
  const indice = new Map(terms.map(t => [t, CAMPOS.map(f => norm(f(t).join(' | ')))]));
  function buscar(q) {
    const nq = norm(q);
    const exactos = [];
    for (const t of terms) {
      const k = indice.get(t).findIndex(c => c.includes(nq));
      if (k >= 0) exactos.push([k, norm(t.lema).startsWith(nq) ? 0 : 1, t]);
    }
    exactos.sort((a, b) => a[0] - b[0] || a[1] - b[1] || (a[0] === 0 ? a[2].lema.length - b[2].lema.length : 0) || a[2].lema.localeCompare(b[2].lema, 'es'));
    const res = exactos.map(x => x[2]);
    if (res.length < 6) {
      const ya = new Set(res);
      for (const r of fuse.search(q)) if (!ya.has(r.item) && r.score < 0.3) res.push(r.item);
    }
    return res;
  }

  const PAG = 60;
  let visibles = PAG;
  function pintar(reset = true) {
    if (reset) visibles = PAG;
    let res;
    if (estado.q.length >= 2) res = buscar(estado.q);
    else res = terms.slice();
    res = res.filter(t =>
      (!estado.area || t.area === estado.area) && (!estado.familia || t.familia === estado.familia) &&
      (!estado.valor || t.valor.includes(estado.valor)) && (!estado.grado || String(t.grado) === estado.grado) &&
      (!estado.decada || (estado.decada === 'antes' ? (t.anio !== null && t.anio < 1700) : String(t.decada) === estado.decada)) &&
      (!estado.estado || t.estado === estado.estado));
    const yr = t => t.anio ?? 99999;
    if (estado.orden === 'anio') res.sort((a, b) => yr(a) - yr(b));
    else if (estado.orden === '-anio') res.sort((a, b) => (b.anio ?? -99999) - (a.anio ?? -99999));
    else if (estado.orden === 'lema' || estado.q.length < 2) res.sort((a, b) => a.lema.localeCompare(b.lema, 'es'));
    cuenta.textContent = res.length === terms.length ? `${plural(res.length, 'término', 'términos')}` : `${plural(res.length, 'resultado', 'resultados')} de ${terms.length}`;
    lista.replaceChildren(...res.slice(0, visibles).map(termCard));
    if (!res.length) lista.replaceChildren(h('div', { class: 'empty', style: { gridColumn: '1 / -1' } },
      h('p', null, 'No hay ningún término con esa búsqueda y esos filtros.'), h('p', null, limpiarCopia())));
    mas.replaceChildren(...(res.length > visibles ? [h('button', { class: 'btn', type: 'button', onclick: () => { visibles += PAG; pintar(false); } },
      `Ver ${Math.min(PAG, res.length - visibles)} más`)] : []));
    const p = new URLSearchParams();
    if (estado.q) p.set('q', estado.q);
    for (const f of FILTROS) if (estado[f]) p.set(f, estado[f]);
    if (estado.orden) p.set('orden', estado.orden);
    const qs = p.toString();
    history.replaceState(null, '', `#/explorar${qs ? '?' + qs : ''}`);
  }
  function limpiarCopia() { return h('button', { class: 'btn small', type: 'button', onclick: () => limpiar.click() }, 'Quitar filtros'); }
  pintar();
  if (estado.q || !matchMedia('(pointer: coarse)').matches) input.focus({ preventScroll: true });
}
