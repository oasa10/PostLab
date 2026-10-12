import { h, VALORES, ESTADOS, CINCO_P, anio, chipValor, famTag, marcaEstado, corta } from '../lib.js';

export const GRADOS = { 1: 'Primero (post)', 2: 'Segundo (post-post)', 3: 'Tercero (post-post-post)' };
export const ESTATUTOS = {
  'autodenominación': 'Autodenominación: sus autores lo usaron para sí mismos.',
  'recepción': 'Recepción: se lo pusieron otros, críticos o académicos.',
  'agrupación': 'Agrupación: etiqueta retrospectiva para un periodo o un conjunto.',
};
const TIPO_ANIO = { obra: 'año de la obra que fija el término', hito: 'año del hito que fija el término', periodo: 'inicio del periodo' };
export const URL_BASE = 'https://oasa10.github.io/PostLab/';

export function render(root, ctx, parts) {
  const t = ctx.byId.get(parts[0]);
  if (!t) {
    document.title = 'Término no encontrado · PostLab';
    root.append(h('div', { class: 'empty' }, h('h1', null, 'Término no encontrado'), h('p', null, 'Puede que haya cambiado de nombre.'),
      h('p', null, h('a', { class: 'btn', href: '#/explorar' }, 'Ir a Explorar'))));
    return;
  }
  document.title = `${t.lema} · PostLab`;
  const v0 = t.valor[0];
  const est = ESTADOS[t.estado] || ESTADOS['sin verificar'];
  const conexiones = [...(ctx.vecinos.get(t.id) || [])].map(id => ctx.byId.get(id)).filter(Boolean).sort((a, b) => (a.anio ?? 9999) - (b.anio ?? 9999));
  const i = ctx.cronologico.indexOf(t);
  const prev = i > 0 ? ctx.cronologico[i - 1] : null, next = i >= 0 && i < ctx.cronologico.length - 1 ? ctx.cronologico[i + 1] : null;
  const url = `${URL_BASE}#/termino/${encodeURIComponent(t.id)}`;
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const datos = [];
  const fila = (k, ...v) => { if (v.flat().some(x => x !== '' && x !== null && x !== undefined)) datos.push(h('dt', null, k), h('dd', null, ...v)); };
  fila('Año', t.anio !== null ? h('span', null, h('b', null, anio(t.anio)), ' ', h('span', { class: 'muted small' }, `(${TIPO_ANIO[t.anioTipo] || 'año de referencia'})`)) : 'Sin fecha fiable');
  fila('Obra o hito', t.obra);
  if (t.primerUso && (t.primerUso.anio || t.primerUso.detalle)) fila('Primer uso', [t.primerUso.anio ? anio(t.primerUso.anio) : '', t.primerUso.detalle].filter(Boolean).join(' · '));
  fila('Figuras', t.figuras.join(' · '));
  fila('Base', t.base ? `${t.base} (lo que viene «después»)` : '');
  fila('Área', h('a', { href: `#/explorar?area=${encodeURIComponent(t.area)}` }, t.area));
  fila('Familia', h('a', { href: `#/explorar?familia=${encodeURIComponent(t.familia)}` }, famTag(t.familia)));
  fila('Grado', GRADOS[t.grado] || t.grado);
  fila('Estatuto del rótulo', ESTATUTOS[t.estatuto] || t.estatuto);

  const p = CINCO_P[v0];
  const cincoP = v0 ? h('div', { class: 'cincop' },
    filaP('Partida', '¿Después de qué?', t.base || 'Lo que nombra la palabra tras el prefijo.'),
    filaP('Prefijo', '¿Qué valor tiene?', h('span', null, t.valor.map(v => `${v}, ${VALORES[v].nombre.toLowerCase()} («${VALORES[v].llana}»)`).join(' y '), t.porQue ? `. ${t.porQue}` : '.')),
    filaP('Pérdida', '¿Qué pierde autoridad?', p.perdida),
    filaP('Propuesta', '¿Qué pone en su lugar?', p.propuesta),
    filaP('Prudencia', '¿Qué no se sigue?', p.prudencia)) : null;

  root.append(
    h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/explorar' }, 'Explorar'), ' › ', h('a', { href: `#/explorar?familia=${encodeURIComponent(t.familia)}` }, t.familia)),
    h('div', { class: 'ficha' },
      h('article', null,
        h('h1', null, t.lema),
        t.variantes.length ? h('p', { class: 'vars' }, 'También: ', t.variantes.join(' · ')) : null,
        h('div', { class: 'chips' }, t.valor.map(v => chipValor(v)), marcaEstado(t.estado)),
        t.nucleo ? h('p', { class: 'nucleo', style: { '--c': v0 ? `var(--v-${v0})` : 'var(--accent)' } }, t.nucleo) : null,
        t.estado === 'dudosa' ? h('div', { class: 'note danger' }, h('b', null, 'Ficha dudosa. '), 'Las fuentes se contradicen o no se ha encontrado una fuente que confirme el año o la obra. Tómala con cautela; no aparece en los juegos.') : null,
        h('dl', { class: 'datos' }, datos),
        t.nota ? h('div', { class: 'note' }, h('b', null, 'Nota. '), t.nota) : null,
        cincoP ? h('section', null, h('h2', null, 'Léelo con las cinco P'),
          h('p', { class: 'muted small' }, `Partida y prefijo son de este término. Las otras tres preguntas llevan una pista general del valor ${v0}: la respuesta concreta está en la obra. `, h('a', { href: '#/aprender/cincop' }, 'Qué son las cinco P')),
          cincoP) : null,
        conexiones.length ? h('section', null, h('h2', null, 'Conexiones'),
          h('div', { class: 'chips' }, conexiones.map(c => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(c.id)}` }, c.lema, h('span', { class: 'muted' }, anio(c.anio))))),
          h('p', { class: 'small', style: { marginTop: '10px' } }, h('a', { href: `#/mapa?t=${encodeURIComponent(t.id)}` }, 'Ver sus conexiones en el mapa →'))) : null,
        h('nav', { class: 'pager', 'aria-label': 'Términos vecinos en el tiempo' },
          prev ? h('a', { class: 'btn', href: `#/termino/${encodeURIComponent(prev.id)}` }, `← ${prev.lema} (${anio(prev.anio)})`) : h('span'),
          next ? h('a', { class: 'btn', href: `#/termino/${encodeURIComponent(next.id)}` }, `${next.lema} (${anio(next.anio)}) →`) : h('span'))),
      h('aside', { class: 'side' },
        h('div', { class: 'card' },
          h('h2', null, 'Verificación'),
          h('p', null, h('b', null, est.nombre), ' · ', est.ayuda),
          t.fuentes.length ? h('ul', { style: { paddingLeft: '18px', margin: '0 0 8px' } }, t.fuentes.map(f => h('li', null,
            f.url ? h('a', { href: f.url, rel: 'noopener', target: '_blank' }, f.titulo || f.url) : f.titulo))) : h('p', { class: 'muted small' }, 'Sin fuente registrada.'),
          h('p', { class: 'small muted', style: { margin: 0 } }, '¿Ves un error? ', h('a', { href: `https://github.com/oasa10/PostLab/issues/new?title=${encodeURIComponent('Error en la ficha: ' + t.lema)}`, rel: 'noopener', target: '_blank' }, 'Avísanos'))),
        h('div', { class: 'card' },
          h('h2', null, 'En PostLab'),
          h('div', { class: 'btns' },
            t.anio !== null ? h('a', { class: 'btn small', href: `#/cronologia?t=${encodeURIComponent(t.id)}` }, 'En la cronología') : null,
            h('a', { class: 'btn small', href: `#/mapa?t=${encodeURIComponent(t.id)}` }, 'En el mapa'),
            v0 ? h('a', { class: 'btn small', href: `#/explorar?valor=${v0}` }, `Otros ${v0}`) : null)),
        h('div', { class: 'card' },
          h('h2', null, 'Cómo citar esta ficha'),
          h('p', { class: 'cite' }, `«${t.lema}». En PostLab. Consulta, juega y aprende con todo lo post (2026). ${url} [consulta: ${hoy}].`)))),
  );
}

function filaP(nombre, pregunta, texto) {
  return h('div', null, h('b', null, nombre, h('small', null, pregunta)), h('div', null, texto));
}
