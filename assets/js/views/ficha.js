import { h, poner, VALORES, ESTADOS, CINCO_P, FASES, anio, chipValor, famTag, marcaEstado, recuadro, parrafos, inline, toggles, tip, tipTerm, valColor, imgValor, botonEscuchar } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { deTermino } from '../episodio.js';

export const GRADOS = { 1: 'Primero (post)', 2: 'Segundo (post-post)', 3: 'Tercero (post-post-post)' };
export const ESTATUTOS = {
  'autodenominación': 'Autodenominación: sus autores lo usaron para sí mismos.',
  'recepción': 'Recepción: se lo pusieron otros, críticos o académicos.',
  'agrupación': 'Agrupación: etiqueta retrospectiva para un periodo o un conjunto.',
};
const TIPO_ANIO = { obra: 'año de la obra que fija el término', hito: 'año del hito que fija el término', periodo: 'inicio del periodo' };
export const URL_BASE = 'https://oasa10.github.io/PostLab/';
// Autoría para «Cómo citar»: el origen es el Método BrainBox, que no se explica aquí
export const AUTORIA = 'Salazar, Osman (2026)';
export const EMOCIONES = [['curiosidad', 'Curiosidad'], ['entusiasmo', 'Entusiasmo'], ['inquietud', 'Inquietud'], ['rechazo', 'Rechazo'], ['confusion', 'Confusión'], ['indiferencia', 'Indiferencia']];

export function render(root, ctx, parts, q) {
  const t = ctx.byId.get(parts[0]);
  if (!t) {
    document.title = 'Término no encontrado · PostLab';
    root.append(h('div', { class: 'empty' }, h('h1', null, 'Término no encontrado'), h('p', null, 'Puede que haya cambiado de nombre. Pasa en las mejores familias.'),
      h('p', null, h('a', { class: 'btn', href: '#/explorar' }, 'Ir a Explorar'))));
    return;
  }
  document.title = `${t.lema} · PostLab`;
  cuaderno.fichaLeida(t.id);
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

  // Los tres apartados nuevos llegan en un archivo aparte
  const sec = {
    porque: h('section', { class: 'bloque-q', id: 's-porque' }, h('h2', null, h('span', { class: 'q' }, '¿Por qué? ¿Cómo?'), 'Cómo surgió'), h('p', { class: 'muted' }, 'Cargando…')),
    paraque: h('section', { class: 'bloque-q', id: 's-paraque', hidden: true }),
    ahora: h('section', { class: 'bloque-q', id: 's-ahora', hidden: true }),
    sabias: h('div'),
    piensa: h('section', { class: 'bloque-q', id: 's-piensa' }),
  };
  const suave = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const indice = h('nav', { class: 'ficha-toc', 'aria-label': 'En esta ficha' },
    h('span', { class: 'muted small' }, 'Ir a:'),
    [['s-porque', '¿Por qué y cómo?'], ['s-paraque', '¿Para qué?'], ['s-ahora', '¿Y ahora qué?'], ['s-cincop', 'Cinco P'], ['s-piensa', 'Piénsalo']]
      .filter(([id]) => id !== 's-cincop' || cincoP)
      .map(([id, l]) => h('button', { type: 'button', onclick: () => document.getElementById(id)?.scrollIntoView({ behavior: suave(), block: 'start' }) }, l)));
  const conLinea = t.anio !== null && t.anio >= 1700;
  // Primero una persona, después la definición (W13): la historia humana sale del episodio de la palabra
  const historia = h('div');
  const art = h('article');
  // Escuchar la ficha (W8): lo que se ve, de arriba abajo, sin los datos de la tabla
  const escuchar = botonEscuchar(() => [...art.querySelectorAll('h1, .historia-humana p, .nucleo, #s-porque .prosa, #s-paraque li, #s-ahora .prosa')]
    .map(n => n.innerText.trim()).filter(Boolean).join('. ').replace(/\.\s*\./g, '.'), 'Escuchar la ficha');
  const tras = q && q.get('tras') === 'episodio';
  const linea = conLinea ? h('figure', { class: 'mini-tl' }) : null;

  root.append(
    h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/explorar' }, 'Explorar'), ' › ', h('a', { href: `#/explorar?familia=${encodeURIComponent(t.familia)}` }, t.familia)),
    h('div', { class: 'ficha' },
      poner(art,
        tras ? recuadro('recuerda', 'Episodio terminado', `Esta es la ficha completa de «${t.lema}»: lo que hay detrás de la palabra, con sus fuentes. Tu misión y tu historia están en `, h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.') : null,
        h('p', { class: 'nivel' }, 'Nivel 1 · Enterarte'),
        h('div', { class: 'ficha-titulo' },
          h('h1', null, t.lema),
          t.valor.length ? h('div', { class: 'ficha-imgs', title: t.valor.map(v => `${v} · ${VALORES[v].nombre}: «${VALORES[v].llana}»`).join(' / ') }, t.valor.map(v => imgValor(v, { grande: true }))) : null),
        t.variantes.length ? h('p', { class: 'vars' }, 'También: ', t.variantes.join(' · ')) : null,
        h('div', { class: 'chips' }, t.valor.map(v => chipValor(v)), marcaEstado(t.estado), escuchar),
        historia,
        t.nucleo ? h('p', { class: 'nucleo', style: { '--c': v0 ? `var(--v-${v0})` : 'var(--accent)' } }, t.nucleo) : null,
        indice,
        t.estado === 'dudosa' ? recuadro('atencion', 'Ficha dudosa', 'Las fuentes se contradicen o no hemos encontrado una que confirme el año o la obra. Tómala con cautela: por eso no sale en los juegos.') : null,
        h('dl', { class: 'datos' }, datos),
        linea,
        t.nota ? recuadro('aclaracion', 'Nota de verificación', t.nota) : null,
        sec.porque, sec.paraque, sec.ahora, sec.sabias,
        cincoP ? h('section', { class: 'bloque-q', id: 's-cincop' }, h('h2', null, h('span', { class: 'q' }, 'Herramienta'), 'Léelo con las cinco P'),
          h('p', { class: 'muted small' }, `Partida y prefijo son de este término. Las otras tres llevan la pista general del valor ${v0}; la respuesta fina está en la obra. `, h('a', { href: '#/aprender/cincop' }, '¿Qué son las cinco P?')),
          cincoP) : null,
        sec.piensa,
        conexiones.length ? h('section', { class: 'bloque-q' }, h('h2', null, h('span', { class: 'q' }, 'Red'), 'Conexiones'),
          h('div', { class: 'chips' }, conexiones.map(c => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(c.id)}` }, c.lema, h('span', { class: 'muted' }, anio(c.anio))))),
          h('p', { class: 'small', style: { marginTop: '10px' } }, h('a', { href: `#/visualizar/mapa?t=${encodeURIComponent(t.id)}` }, 'Ver sus conexiones en el mapa →'))) : null,
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
          h('h2', null, 'Sigue por aquí'),
          h('div', { class: 'btns' },
            t.anio !== null ? h('a', { class: 'btn small', href: `#/viajar?t=${encodeURIComponent(t.id)}` }, 'Viajar a su época') : null,
            h('a', { class: 'btn small', href: `#/visualizar/mapa?t=${encodeURIComponent(t.id)}` }, 'Verlo en el mapa'),
            v0 ? h('a', { class: 'btn small', href: `#/explorar?valor=${v0}` }, `Otros ${v0}`) : null),
          h('p', { class: 'small', style: { margin: '12px 0 0' } }, h('b', null, 'Nivel 2: '), h('a', { href: `#/pensar/cincop?t=${encodeURIComponent(t.id)}` }, 'analízalo tú en el laboratorio de las cinco P'), '.')),
        h('div', { class: 'card' },
          h('h2', null, 'Cómo citar esta ficha'),
          h('p', { class: 'cite' }, `${AUTORIA}. «${t.lema}». En PostLab. Consulta, juega y aprende con todo lo post. Con el Método BrainBox. ${url} [consulta: ${hoy}].`)))),
  );

  deTermino(ctx, t.id).then(ep => {
    if (!ep || !historia.isConnected) return;
    historia.replaceChildren(h('aside', { class: 'historia-humana', style: { '--c': `var(--v-${ep.valor})` } },
      h('b', { class: 'ct' }, 'Una historia'),
      h('p', null, inline(ep.historia_humana)),
      tras ? null : h('a', { class: 'btn small', href: `#/episodio/${encodeURIComponent(ep.id)}` }, '▶ Vívelo en un episodio de siete minutos')));
  }).catch(() => {});

  if (linea) lineaTiempo(linea, t, conexiones);

  ctx.contenido().then(mapa => {
    if (!sec.porque.isConnected) return;
    const c = mapa.get(t.id);
    if (!c) {
      sec.porque.replaceChildren(h('h2', null, h('span', { class: 'q' }, '¿Por qué? ¿Cómo?'), 'Cómo surgió'), h('p', { class: 'muted' }, 'Esta ficha todavía no tiene contexto escrito.'));
      sec.piensa.replaceChildren(...piensa(t, null));
      return;
    }
    sec.porque.replaceChildren(h('h2', null, h('span', { class: 'q' }, '¿Por qué? ¿Cómo?'), 'Cómo surgió'), h('div', { class: 'prosa' }, parrafos(c.contexto)));
    sec.paraque.hidden = false;
    sec.paraque.replaceChildren(h('h2', null, h('span', { class: 'q' }, '¿Para qué?'), c.ejemplos.length === 5 ? 'Cinco ejemplos' : `${['', 'Un', 'Dos', 'Tres', 'Cuatro'][c.ejemplos.length] || c.ejemplos.length} ejemplos`),
      h('ol', { class: 'ejemplos' }, c.ejemplos.map(e => h('li', null, h('div', null, h('b', null, inline(e.titulo)), h('span', null, inline(e.texto)))))));
    sec.ahora.hidden = false;
    sec.ahora.replaceChildren(h('h2', null, h('span', { class: 'q' }, '¿Y ahora qué?'), 'Qué tiene que ver con hoy'), h('div', { class: 'prosa' }, parrafos(c.implicaciones)));
    if (c.sabias_que) sec.sabias.replaceChildren(recuadro('sabias', null, inline(c.sabias_que)));
    sec.piensa.replaceChildren(...piensa(t, c));
  }).catch(() => { sec.porque.replaceChildren(h('p', { class: 'muted' }, 'No se ha podido cargar el resto de la ficha. Prueba a recargar la página.')); sec.piensa.replaceChildren(...piensa(t, null)); });
}

// Piénsalo: la pregunta y una primera reacción (eje I: sentir antes de pensar)
function piensa(t, c) {
  const previa = cuaderno.leer().entradas.find(e => e.tipo === 'reaccion' && e.datos?.id === t.id);
  const eco = h('p', { class: 'small muted', 'aria-live': 'polite', style: { margin: '8px 0 0' } });
  let espera, anotada = false;
  const tg = toggles(EMOCIONES, { multiple: true, valor: previa?.datos?.emociones || [], alCambiar: v => {
    clearTimeout(espera);
    if (!v.length) { eco.textContent = ''; return; }
    espera = setTimeout(() => {
      if (!anotada) {
        if (previa) cuaderno.borrarEntrada(previa.id);
        cuaderno.entrada('reaccion', t.lema, { id: t.id, emociones: v }, { ser: 2 });
        cuaderno.sentir();
        anotada = true;
      }
      eco.textContent = 'Anotado en tu cuaderno. Sentir algo no demuestra nada, pero es un buen sitio desde el que empezar a pensar.';
    }, 600);
  } });
  return [
    h('h2', null, h('span', { class: 'q' }, 'Tu turno'), 'Piénsalo'),
    recuadro('piensa', 'Una pregunta para ti', inline(c?.pregunta || `¿Dónde te has cruzado con «${t.lema}» o con algo que se le parezca?`)),
    h('div', { class: 'reaccion' },
      h('p', { style: { margin: '6px 0 8px', fontWeight: 600 } }, previa ? 'Ya anotaste lo que te provoca. ¿Sigue igual?' : 'Antes de pensar, sentir: ¿qué te provoca este término? Marca una o varias.'),
      tg, eco),
    h('div', { class: 'btns', style: { marginTop: '14px' } },
      h('a', { class: 'btn primary', href: `#/pensar/termometro?t=${encodeURIComponent(t.id)}` }, 'Tómale la temperatura →'),
      h('a', { class: 'btn', href: `#/pensar/cincop?t=${encodeURIComponent(t.id)}` }, 'Analízalo con las cinco P')),
  ];
}

function filaP(nombre, pregunta, texto) {
  return h('div', null, h('b', null, nombre, h('small', null, pregunta)), h('div', null, texto));
}

// Línea temporal de la ficha: el término, sus conexiones con fecha y las tres fases
function lineaTiempo(el, t, conexiones) {
  const d3 = window.d3;
  if (!d3) return;
  // a tamaño real (no escalado) para que el texto se lea en el móvil; los dos siglos de precursores van comprimidos
  const W = Math.max(300, Math.round(el.clientWidth || 640)), H = 66, Y = 36;
  const x = d3.scaleLinear().domain([1700, 1900, 2030]).range([6, W * 0.2, W - 6]);
  const fases = FASES.slice(1);
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img');
  const ancho = f => x(Math.min(f.hasta + 1, 2030)) - x(Math.max(f.desde, 1700));
  svg.selectAll('rect.f').data(fases).join('rect').attr('class', 'f')
    .attr('x', f => x(Math.max(f.desde, 1700)) + 1).attr('width', f => ancho(f) - 2).attr('y', Y - 8).attr('height', 16).attr('rx', 4)
    .attr('fill', (f, k) => (k === 1 ? 'var(--accent-bg)' : 'var(--surface-2)'));
  const vec = conexiones.filter(c => c.anio !== null && c.anio >= 1700);
  const puntos = [t.anio, ...vec.map(c => c.anio)].map(a => x(a));
  const rotuloFase = f => { // el nombre de la fase solo si cabe y ningún punto lo tapa
    const n = f.nombre.split(' ')[0], c = x(Math.max(f.desde, 1700)) + ancho(f) / 2, m = n.length * 3 + 8;
    return ancho(f) > n.length * 6 + 16 && !puntos.some(px => Math.abs(px - c) < m) ? n : '';
  };
  svg.selectAll('text.f').data(fases).join('text').attr('class', 'f').attr('x', f => x(Math.max(f.desde, 1700)) + ancho(f) / 2).attr('y', Y + 4)
    .attr('text-anchor', 'middle').style('font-size', '10px').style('fill', 'var(--muted)').text(rotuloFase);
  (W < 520 ? [1700, 1900, 1966, 1995, 2026] : [1700, 1800, 1900, 1945, 1966, 1995, 2026]).forEach(a => svg.append('text').attr('x', x(a)).attr('y', H - 4)
    .attr('text-anchor', a === 1700 ? 'start' : a === 2026 ? 'end' : 'middle').style('font-size', '10px').style('fill', 'var(--muted)').text(a));
  svg.selectAll('circle.v').data(vec).join('circle').attr('class', 'v').attr('cx', c => x(c.anio)).attr('cy', Y).attr('r', 5)
    .attr('fill', c => (c.valor[0] ? valColor(c.valor[0]) : 'var(--muted)')).attr('stroke', 'var(--surface)').attr('stroke-width', 2).style('cursor', 'pointer')
    .on('mousemove', (e, c) => tip.show(tipTerm(c), e.clientX, e.clientY)).on('mouseleave', () => tip.hide())
    .on('click', (e, c) => { tip.hide(); location.hash = `#/termino/${encodeURIComponent(c.id)}`; });
  const cx = x(t.anio), g = svg.append('g').attr('transform', `translate(${cx},${Y})`);
  g.append('line').attr('y1', -22).attr('y2', -9).attr('stroke', 'var(--ink)').attr('stroke-width', 2);
  g.append('circle').attr('r', 8).attr('fill', t.valor[0] ? valColor(t.valor[0]) : 'var(--ink)').attr('stroke', 'var(--surface)').attr('stroke-width', 2.5);
  const rotulo = `${t.lema} · ${anio(t.anio)}`, mitad = rotulo.length * 3.4;
  g.append('text').attr('y', -26).attr('text-anchor', cx + mitad > W ? 'end' : cx - mitad < 0 ? 'start' : 'middle')
    .style('font-size', '12px').style('font-weight', 700).style('fill', 'var(--ink)').text(rotulo);
  svg.attr('aria-label', `Línea temporal de 1700 a hoy: ${t.lema} en ${anio(t.anio)}${vec.length ? `, con ${vec.length} términos conectados` : ''}.`);
  el.append(Object.assign(document.createElement('figcaption'), {
    className: 'small muted',
    textContent: (vec.length ? `El punto grande es este término; los pequeños, sus ${vec.length} conexiones con fecha. Pulsa uno para ir a su ficha.` : 'Dónde cae este término en la historia de lo post.') + ' Los siglos XVIII y XIX van comprimidos a la izquierda para dar sitio al XX.',
  }));
}
