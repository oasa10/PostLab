import { h, poner, cabeza, recuadro, dialogo, pasos, toggles, descargar, fecha, inline, VALORES, CODIGOS, CINCO_P, chipValor, shuffle, corta } from '../lib.js';
import * as cuaderno from '../cuaderno.js';

// Pensar y aplicar: seis actividades que dejan huella en el cuaderno
const ACT = { termometro, cincop, caza, situaciones, relato, bautiza };

export async function render(root, ctx, parts, q) {
  const P = await ctx.pensar();
  const k = parts[0];
  if (ACT[k]) {
    const a = P.actividades.find(x => x.id === k);
    document.title = `${a.n} · PostLab`;
    root.append(h('nav', { class: 'crumbs', 'aria-label': 'Ruta' }, h('a', { href: '#/pensar' }, 'Pensar y aplicar'), ' › ', a.n));
    return ACT[k](root, ctx, P, q, a);
  }
  document.title = 'Pensar y aplicar · PostLab';
  return portada(root, ctx, P);
}

// ── Utilidades ──────────────────────────────────────────────
const enlaceFicha = t => h('a', { href: `#/termino/${encodeURIComponent(t.id)}`, target: '_blank', rel: 'noopener' }, t.lema, ' ↗');
function cabezaAct(a, ...extra) {
  return cabeza(2, a.n, a.d, h('div', { class: 'chips', style: { marginTop: '10px' } }, a.ejes.map(e => cuaderno.chipEje(e)), h('span', { class: 'chip' }, `Unos ${a.min} minutos`)), ...extra);
}
function selectorTermino(ctx, inicial, alCambiar) {
  const lista = ctx.terms.filter(t => t.nucleo && t.valor.length).sort((a, b) => a.lema.localeCompare(b.lema, 'es'));
  const sel = h('select', { 'aria-label': 'Elige un término' }, h('option', { value: '' }, 'Elige un término…'), lista.map(t => h('option', { value: t.id, selected: t.id === inicial ? true : null }, t.lema)));
  sel.addEventListener('change', () => alCambiar(ctx.byId.get(sel.value) || null));
  const azar = h('button', { class: 'btn small', type: 'button', onclick: () => { const t = lista[Math.floor(Math.random() * lista.length)]; sel.value = t.id; alCambiar(t); } }, '🎲 Uno al azar');
  return h('div', { class: 'btns', style: { flexWrap: 'nowrap' } }, sel, azar);
}
const hecho = (c, id) => ({
  termometro: c.entradas.some(e => e.tipo === 'sap'),
  cincop: c.entradas.some(e => e.tipo === 'cincop'),
  caza: c.entradas.filter(e => e.tipo === 'caza').length >= 3,
  situaciones: Object.keys(c.situaciones).length >= 6,
  relato: !!c.relato.texto,
  bautiza: c.entradas.some(e => e.tipo === 'bautizo'),
})[id];
const progreso = (c, id) => ({
  caza: `${Math.min(3, c.entradas.filter(e => e.tipo === 'caza').length)} de 3`,
  situaciones: `${Object.keys(c.situaciones).length} de 6`,
})[id];
function textarea(placeholder, valor = '', label) { return h('textarea', { placeholder, 'aria-label': label || placeholder }, valor); }
function campo(label, ayuda, control) { return h('div', { class: 'campo' }, h('label', null, label), ayuda ? h('p', { class: 'ayuda' }, ayuda) : null, control); }
function finActividad(...extra) {
  return h('div', { class: 'btns', style: { marginTop: '16px' } }, ...extra, h('a', { class: 'btn', href: '#/cuaderno' }, 'Ver mi cuaderno'), h('a', { class: 'btn', href: '#/pensar' }, 'Otra actividad'));
}

// ── Portada ─────────────────────────────────────────────────
function portada(root, ctx, P) {
  const c = cuaderno.leer();
  const explica = h('p', { class: 'ciclo-txt', 'aria-live': 'polite' });
  const svgNS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs = {}, ...kids) => { const el = document.createElementNS(svgNS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); el.append(...kids); return el; };
  const POS = [[260, 36], [430, 140], [260, 244], [90, 140]];
  const svg = S('svg', { viewBox: '0 0 520 280', role: 'group', 'aria-label': 'El ciclo de pensar y aplicar: observar, pensar, aplicar y revisar.' });
  svg.append(S('defs', {}, S('marker', { id: 'punta', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, S('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--muted)' }))));
  const arcos = [['M330,46 Q420,60 432,112'], ['M432,168 Q420,226 330,236'], ['M190,236 Q100,226 88,168'], ['M88,112 Q100,58 190,46']];
  arcos.forEach(([d]) => svg.append(S('path', { d, class: 'flecha', 'marker-end': 'url(#punta)' })));
  svg.append(S('text', { x: 260, y: 146, 'text-anchor': 'middle', style: 'font: 600 13px var(--sans); fill: var(--muted)' }, 'y vuelta a empezar'));
  let activo = 0, auto = null;
  const nodos = P.ciclo.map((n, i) => {
    const g = S('g', { class: 'nodo', tabindex: 0, role: 'button', 'aria-label': n.n, transform: `translate(${POS[i][0] - 70},${POS[i][1] - 20})`, style: 'cursor:pointer' },
      S('rect', { width: 140, height: 40, rx: 20 }), S('text', { x: 70, y: 25, 'text-anchor': 'middle' }, `${i + 1}. ${n.n}`));
    const ir = () => { clearInterval(auto); marcar(i); };
    g.addEventListener('click', ir);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } });
    svg.append(g);
    return g;
  });
  function marcar(i) {
    activo = i;
    nodos.forEach((g, k) => g.classList.toggle('on', k === i));
    poner(explica, h('b', null, P.ciclo[i].n, '. '), P.ciclo[i].t);
  }
  marcar(0);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) auto = setInterval(() => marcar((activo + 1) % 4), 3200);

  root.append(
    cabeza(2, 'Pensar y aplicar', 'Pensar para aplicar, y aplicar para pensar mejor. Aquí no se viene a leer: se viene a mirar el mundo de hoy con lo aprendido, a probarlo y a anotarlo. Todo lo que hagas queda en tu cuaderno.'),
    dialogo([['yano', '¿Pensar? Para eso ya está internet.'], ['todavia', 'Internet todavía no sabe qué te importa a ti.'], ['tu', 'Vale, pienso. ¿Por dónde empiezo?']]),
    h('section', { class: 'grid g2', style: { alignItems: 'center', margin: '8px 0 10px' } },
      h('div', { class: 'ciclo' }, svg),
      h('div', null, h('h2', { style: { marginTop: 0 } }, 'Un ciclo, no una línea'), explica,
        h('p', { class: 'small muted' }, 'Pulsa cada paso. Las seis actividades de abajo recorren el ciclo entero; empieza por la que te llame.'))),
    h('h2', null, 'Seis actividades'),
    h('div', { class: 'actividades' }, P.actividades.map((a, i) => h('a', { class: 'actividad', href: `#/pensar/${a.id}` },
      h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1), h('h3', null, a.n), h('p', null, a.d),
      h('div', { class: 'pie' }, a.ejes.map(e => cuaderno.chipEje(e)), h('span', null, `≈ ${a.min} min`),
        hecho(c, a.id) ? h('span', { class: 'hecha' }, '✓ Hecha') : progreso(c, a.id) ? h('span', null, progreso(c, a.id)) : null)))),
    recuadro('aclaracion', 'Tus respuestas son tuyas', 'Lo que escribes aquí no sale de tu navegador: no hay cuentas, ni servidores, ni nadie leyendo por encima del hombro. Puedes descargarlo o borrarlo cuando quieras desde ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.'),
  );
  return { destroy: () => clearInterval(auto) };
}

// ── 1. El termómetro (eje I) ────────────────────────────────
function termometro(root, ctx, P, q, a) {
  const T = P.termometro;
  let t = q.get('t') ? ctx.byId.get(q.get('t')) : null, paso = 0, guardado = false;
  const r = { emociones: [], intensidad: 5, accion: null, se: '', supongo: '', haria: '' };
  const cuerpo = h('div', { class: 'panel' });
  const NOMBRES = ['Elegir', 'Sentir', 'Actuar', 'Pensar', 'Comparar'];
  root.append(cabezaAct(a), recuadro('aclaracion', 'Por qué este orden', 'Ante algo nuevo solemos sentir primero, actuar después y pensar al final, si llegamos. El termómetro no te pide que dejes de sentir: te ayuda a notar el orden y a darle la vuelta cuando conviene.'), cuerpo);
  const EMO = Object.fromEntries(T.emociones), ACC = Object.fromEntries(T.acciones);

  function pintar() {
    const sig = (ok, txt = 'Siguiente →') => h('button', { class: 'btn primary', type: 'button', disabled: ok ? null : true, onclick: () => { paso++; pintar(); } }, txt);
    const atras = paso > 0 && paso < 4 ? h('button', { class: 'btn', type: 'button', onclick: () => { paso--; pintar(); } }, '← Anterior') : null;
    const ficha = t ? h('div', { class: 'card', style: { margin: '10px 0' } }, h('b', { style: { fontFamily: 'var(--serif)', fontSize: '1.3rem' } }, t.lema), ' ', t.valor.map(v => chipValor(v, { corto: true })), h('p', { class: 'small', style: { margin: '6px 0 0' } }, t.nucleo)) : null;
    let contenido;
    if (paso === 0) {
      contenido = [h('h2', null, '¿Qué término te tomas?'), h('p', null, 'Uno que te provoque algo, a favor o en contra. Si no se te ocurre, deja que decida el dado.'),
        selectorTermino(ctx, t?.id, x => { t = x; pintar(); }), ficha, h('div', { class: 'btns' }, sig(!!t, 'Empezar →'))];
    } else if (paso === 1) {
      const val = h('output', null, r.intensidad);
      const rango = h('input', { type: 'range', min: 0, max: 10, value: r.intensidad, 'aria-label': 'Intensidad' });
      rango.addEventListener('input', () => { r.intensidad = +rango.value; val.textContent = rango.value; });
      const tg = toggles(T.emociones, { multiple: true, valor: r.emociones, alCambiar: v => { r.emociones = v; boton.disabled = !v.length; } });
      const boton = sig(r.emociones.length);
      contenido = [h('h2', null, 'Sentir'), ficha, h('p', null, 'Sin pensarlo mucho: ¿qué te provoca? Marca una o varias.'), tg,
        campo('¿Con qué intensidad?', '0 es «ni fu ni fa»; 10, «no puedo dejar de pensar en ello».', h('div', { class: 'btns', style: { flexWrap: 'nowrap' } }, rango, val)), h('div', { class: 'btns' }, atras, boton)];
    } else if (paso === 2) {
      const boton = sig(r.accion);
      contenido = [h('h2', null, 'Actuar'), h('p', null, 'Y ahora, de primeras: si te encontraras este término en un titular o en una conversación, ¿qué te saldría hacer?'),
        toggles(T.acciones, { valor: r.accion, alCambiar: v => { r.accion = v; boton.disabled = !v; } }),
        recuadro('aclaracion', null, 'Actuar no es hacer. Actuar es lo que sale solo; hacer es lo que eliges después de pensarlo. Aquí buscamos lo primero.'), h('div', { class: 'btns' }, atras, boton)];
    } else if (paso === 3) {
      const areas = T.pensar.map(p => { const ta = textarea(p.ayuda, r[p.k], p.l); ta.addEventListener('input', () => { r[p.k] = ta.value; boton.disabled = !(r.se.trim() && r.haria.trim()); }); return campo(p.l, p.ayuda, ta); });
      const boton = sig(r.se.trim() && r.haria.trim(), 'Comparar →');
      contenido = [h('h2', null, 'Pensar'), h('p', null, 'Ahora sí, con calma. Puedes abrir la ficha para documentarte: ', enlaceFicha(t), '.'),
        recuadro('recuerda', 'Una pista para pensar', CINCO_P[t.valor[0]].prudencia), ...areas, h('div', { class: 'btns' }, atras, boton)];
    } else {
      const cambia = r.accion && !r.haria.toLowerCase().includes((ACC[r.accion] || '').toLowerCase().split(' ')[0]);
      if (!guardado) {
        guardado = true;
        cuaderno.entrada('sap', t.lema, { id: t.id, ...r, resumen: [
          ['Sentí', `${r.emociones.map(e => EMO[e]).join(', ')} (intensidad ${r.intensidad} de 10)`], ['Me salía', ACC[r.accion]],
          ['Sé', r.se], ['Supongo', r.supongo || '—'], ['Pensándolo, haría', r.haria]] }, { ser: 6, saber: 2 });
      }
      contenido = [h('h2', null, 'Tu temperatura'),
        h('div', { class: 'comparar' },
          h('div', null, h('p', { class: 'nivel', style: { color: 'var(--e-ser)' } }, 'En automático'), h('p', null, h('b', null, 'Sentiste: '), r.emociones.map(e => EMO[e].toLowerCase()).join(', '), ` (${r.intensidad}/10).`),
            h('p', { style: { margin: 0 } }, h('b', null, 'Te salía: '), ACC[r.accion].toLowerCase(), '.')),
          h('div', { class: 'modelo' }, h('p', { class: 'nivel' }, 'Pensándolo'), h('p', null, h('b', null, 'Sabes: '), r.se), r.supongo ? h('p', null, h('b', null, 'Supones: '), r.supongo) : null,
            h('p', { style: { margin: 0 } }, h('b', null, 'Harías: '), r.haria))),
        recuadro(cambia ? 'recuerda' : 'piensa', cambia ? 'Has dado la vuelta al orden' : 'Coinciden, y está bien',
          cambia ? 'Lo que harías pensándolo no es lo que te salía en automático. Esa distancia es justo lo que se entrena: la próxima vez la recorrerás más rápido.'
            : 'Lo que te salía y lo que harías pensándolo se parecen. A veces el primer impulso es bueno; la diferencia es que ahora sabes por qué.'),
        h('p', { class: 'small muted' }, 'Guardado en tu cuaderno, eje Ser. Con tres termómetros de términos distintos subes a «Entrenar».'),
        finActividad(h('button', { class: 'btn primary', type: 'button', onclick: () => { t = null; paso = 0; guardado = false; Object.assign(r, { emociones: [], intensidad: 5, accion: null, se: '', supongo: '', haria: '' }); pintar(); } }, 'Otro término'))];
    }
    poner(cuerpo, pasos(NOMBRES, paso), ...contenido.flat());
  }
  if (t) paso = 0;
  pintar();
}

// ── 2. Laboratorio de las cinco P (ejes II y III) ───────────
function cincop(root, ctx, P, q, a) {
  const PREG = ctx.aprender.cincop.preguntas;
  let modo = 'termino', t = q.get('t') ? ctx.byId.get(q.get('t')) : null, frase = '', valor = null, actual = 0, guardado = false;
  const resp = ['', '', '', '', ''];
  const zona = h('div');
  const cuerpo = h('div', { class: 'panel' });
  root.append(cabezaAct(a), cuerpo);

  function modelo(i) {
    const v = modo === 'termino' ? t?.valor[0] : valor;
    if (i === 0) return modo === 'termino' ? (t.base ? `${t.base}.` : 'Lo que nombra la palabra tras el prefijo.') : 'Busca la palabra que va detrás del pos-: eso es lo que queda atrás.';
    if (i === 1) return v ? `${modo === 'termino' ? t.valor.map(x => `${x}, ${VALORES[x].nombre.toLowerCase()}`).join(' y ') : `${v}, ${VALORES[v].nombre.toLowerCase()}`}: «${VALORES[v].llana}». ${modo === 'termino' && t.porQue ? t.porQue : VALORES[v].pregunta}` : 'Elige primero un valor.';
    if (!v) return 'Elige primero el valor del prefijo (segunda P): la pista depende de él.';
    return CINCO_P[v][['perdida', 'propuesta', 'prudencia'][i - 2]];
  }
  const listo = () => (modo === 'termino' ? !!t : frase.trim().length > 3);

  function pintar() {
    const tg = toggles([['termino', 'Un término de PostLab'], ['frase', 'Una frase tuya']], { valor: modo, alCambiar: v => { if (v) { modo = v; pintar(); } else pintar(); } });
    const entrada = modo === 'termino'
      ? selectorTermino(ctx, t?.id, x => { t = x; pintar(); })
      : (() => {
        const inp = h('input', { type: 'text', value: frase, placeholder: 'Un titular, una frase que hayas oído, un eslogan…', 'aria-label': 'Tu frase con un término post' });
        inp.addEventListener('input', () => { frase = inp.value; botonMano.hidden = !listo(); });
        return h('div', null, inp, h('div', { class: 'chips', style: { marginTop: '8px' } }, h('span', { class: 'small muted' }, 'Ideas:'),
          P.cincop.frases.map(f => h('button', { class: 'chip', type: 'button', onclick: () => { frase = f; pintar(); } }, f))));
      })();
    const botonMano = h('button', { class: 'btn primary', type: 'button', hidden: !listo(), onclick: () => { actual = 0; mano(); } }, 'Ponerle la mano encima →');
    poner(cuerpo, h('h2', null, '¿Qué analizas?'), tg, entrada,
      modo === 'termino' && t ? h('p', { class: 'small', style: { marginTop: '8px' } }, t.nucleo) : null,
      h('div', { class: 'btns', style: { marginTop: '12px' } }, botonMano),
      h('details', { style: { marginTop: '14px' } }, h('summary', { class: 'small' }, 'Ver un ejemplo resuelto: posverdad'),
        h('dl', { class: 'datos' }, PREG.map(p => [h('dt', null, p.p), h('dd', null, p.ej)]))), zona);
    poner(zona);
  }

  function mano() {
    const titulo = modo === 'termino' ? t.lema : `«${frase.trim()}»`;
    const dedos = h('div', { class: 'mano', role: 'group', 'aria-label': 'Las cinco P' }, PREG.map((p, i) => h('button', { type: 'button', 'aria-pressed': String(i === actual), onclick: () => { actual = i; mano(); } },
      h('b', null, i + 1), p.p, resp[i].trim() ? h('span', { class: 'small', style: { color: 'var(--ok)' } }, '✓') : null)));
    const p = PREG[actual];
    const ta = textarea('Tu respuesta, con tus palabras', resp[actual], p.q);
    const pista = h('div', { hidden: true }, recuadro('recuerda', 'La pista de PostLab', modelo(actual)));
    ta.addEventListener('input', () => { resp[actual] = ta.value; comparar.disabled = resp.some(x => !x.trim()); });
    const comparar = h('button', { class: 'btn primary', type: 'button', disabled: resp.some(x => !x.trim()) ? true : null, onclick: final }, 'Comparar con el modelo');
    const extra = actual === 1 && modo === 'frase' ? h('div', null, h('p', { class: 'small', style: { margin: '8px 0 0' } }, '¿Qué clase de «después» es? Elige el valor que mejor encaje:'),
      toggles(CODIGOS.map(c => [c, `${c} · ${VALORES[c].llana}`]), { valor, alCambiar: v => { valor = v; poner(pista, recuadro('recuerda', 'La pista de PostLab', modelo(1))); } })) : null;
    poner(cuerpo, 
      h('h2', null, 'Analizando ', titulo), h('p', { class: 'small muted' }, 'Cinco dedos, cinco preguntas. Pulsa cada dedo, responde y, si quieres, mira la pista. Cuando tengas las cinco, compara.'),
      dedos,
      h('h3', null, `${actual + 1}. ${p.p}: ${p.q}`), extra, ta,
      h('div', { class: 'btns', style: { marginTop: '8px' } },
        h('button', { class: 'btn small', type: 'button', onclick: () => { pista.hidden = !pista.hidden; } }, 'Ver la pista'),
        actual < 4 ? h('button', { class: 'btn small', type: 'button', onclick: () => { actual++; mano(); } }, 'Siguiente dedo →') : null),
      pista,
      h('div', { class: 'btns', style: { marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px' } }, h('button', { class: 'btn', type: 'button', onclick: pintar }, '← Cambiar de término'), comparar));
    ta.focus({ preventScroll: true });
  }

  function final() {
    const titulo = modo === 'termino' ? t.lema : frase.trim();
    if (!guardado) {
      guardado = true;
      cuaderno.entrada('cincop', titulo, { id: t?.id || null, valor: modo === 'termino' ? t.valor[0] : valor, resumen: PREG.map((p, i) => [p.p, resp[i]]) }, { saber: 6, hacer: 4 });
    }
    poner(cuerpo, h('h2', null, 'Tu análisis frente al modelo'),
      h('p', { class: 'small muted' }, 'No hay una única respuesta buena: la pista de PostLab es general y la tuya puede ser más fina. Fíjate sobre todo en la quinta P, la prudencia: ¿has evitado algún salto?'),
      PREG.map((p, i) => h('div', { style: { margin: '12px 0' } }, h('b', null, `${i + 1}. ${p.p}`), h('div', { class: 'comparar', style: { marginTop: '6px' } },
        h('div', null, h('p', { class: 'small muted', style: { margin: '0 0 4px' } }, 'Tú'), resp[i]), h('div', { class: 'modelo' }, h('p', { class: 'small muted', style: { margin: '0 0 4px' } }, 'PostLab'), modelo(i))))),
      recuadro('piensa', '¿Y ahora qué?', 'Usa tu quinta P la próxima vez que oigas este término: es la frase que te ahorra un salto.'),
      finActividad(h('button', { class: 'btn primary', type: 'button', onclick: () => { resp.fill(''); t = null; frase = ''; valor = null; guardado = false; pintar(); } }, 'Analizar otro')));
  }
  pintar();
  if (t) { actual = 0; mano(); }
}

// ── 3. Caza de posts (eje III, entorno real) ────────────────
function caza(root, ctx, P, q, a) {
  const C = P.caza, SALTOS = ctx.aprender.saltos;
  const misiones = h('div');
  const mias = h('div');
  const form = h('div', { class: 'panel' });
  root.append(cabezaAct(a), recuadro('atencion', 'Falsos amigos', C.falsos), misiones, h('h2', null, 'Anota tu presa'), form, mias);
  const lemas = h('datalist', { id: 'lemas' }, ctx.terms.map(t => h('option', { value: t.lema })));
  let r;
  const nuevo = () => { r = { lugar: null, texto: '', termino: '', valor: null, salto: null, accion: '' }; };
  nuevo();

  function estado() {
    const cs = cuaderno.leer().entradas.filter(e => e.tipo === 'caza');
    const ok = [cs.length >= 1, new Set(cs.map(e => e.datos.lugar)).size >= 2, cs.some(e => e.datos.salto && e.datos.salto !== 'ninguno')];
    poner(misiones, h('h2', null, 'Tus misiones'), h('div', { class: 'grid g3' }, C.misiones.map((m, i) => h('div', { class: 'card', style: { borderTop: `4px solid ${ok[i] ? 'var(--ok)' : 'var(--line)'}` } },
      h('b', null, ok[i] ? '✓ ' : `${i + 1}. `, m.n), h('p', { class: 'small', style: { margin: '4px 0 0' } }, m.d)))));
    poner(mias, ...(cs.length ? [h('h2', null, `Tus presas (${cs.length})`), h('div', { class: 'entradas' }, cs.map(e => h('article', { class: 'entrada' },
      h('div', { class: 'meta' }, h('span', { class: 'chip' }, C.lugares.find(l => l[0] === e.datos.lugar)?.[1] || 'Otro sitio'), h('span', { class: 'muted small' }, fecha(e.fecha))),
      h('h3', null, e.titulo), h('p', { class: 'small', style: { margin: 0 } }, corta(e.datos.texto, 200)))))] : []));
  }

  function pintar(msg = '') {
    const ta = textarea('Copia la frase o describe lo que viste', r.texto, '¿Qué decía?');
    const ac = textarea('Una respuesta, una pregunta, una búsqueda, una conversación…', r.accion, '¿Qué haces con ello?');
    const ter = h('input', { type: 'text', list: 'lemas', value: r.termino, placeholder: 'Posverdad, posindustrial, post-rock…', 'aria-label': 'Término post' });
    const guardar = h('button', { class: 'btn primary', type: 'button', onclick: () => {
      if (!r.lugar || !r.texto.trim() || !r.termino.trim()) { aviso.textContent = 'Te falta el sitio, la frase o el término.'; return; }
      const t = ctx.terms.find(x => x.lema.toLowerCase() === r.termino.trim().toLowerCase());
      const saltoN = SALTOS.find(s => s.id === r.salto);
      cuaderno.entrada('caza', r.termino.trim(), { ...r, id: t?.id || null, resumen: [['Dónde', C.lugares.find(l => l[0] === r.lugar)[1]], ['Qué decía', r.texto],
        ['Valor', r.valor && r.valor !== 'nose' ? `${r.valor} · ${VALORES[r.valor].llana}` : 'Sin decidir'], ['Salto', saltoN ? `${saltoN.id} · ${saltoN.nombre}` : 'Ninguno'], ['Qué hago', r.accion || '—']] }, { hacer: 6, saber: 3 });
      nuevo(); pintar('¡Cazado! Ya está en tu cuaderno. ¿Otra?'); estado();
    } }, 'Guardar la presa');
    const aviso = h('p', { class: 'small', 'aria-live': 'polite', style: { margin: '8px 0 0', fontWeight: 600 } }, msg);
    ta.addEventListener('input', () => { r.texto = ta.value; });
    ac.addEventListener('input', () => { r.accion = ac.value; });
    ter.addEventListener('input', () => { r.termino = ter.value; });
    poner(form, lemas,
      campo('1. ¿Dónde lo has cazado?', null, toggles(C.lugares, { valor: r.lugar, alCambiar: v => { r.lugar = v; } })),
      campo('2. ¿Qué decía?', null, ta),
      campo('3. ¿Qué término post es?', 'Si está en PostLab, te lo sugerimos al escribir. Si no, mejor: quizá has encontrado uno nuevo.', ter),
      campo('4. ¿Qué clase de «después»?', null, toggles([...CODIGOS.map(c => [c, `${c} · ${VALORES[c].llana}`]), ['nose', 'No lo sé']], { valor: r.valor, alCambiar: v => { r.valor = v; } })),
      campo('5. ¿Da algún salto?', 'Un salto es concluir más de lo que el prefijo permite, como pasar de «después de la verdad» a «no hay verdad».',
        h('div', null, toggles([...SALTOS.map(s => [s.id, `${s.id} · ${s.nombre}`]), ['ninguno', 'Ninguno']], { valor: r.salto, alCambiar: v => { r.salto = v; } }),
          h('details', null, h('summary', { class: 'small' }, 'Recordar los ocho saltos'), h('dl', { class: 'datos' }, SALTOS.map(s => [h('dt', null, `${s.id} · ${s.nombre}`), h('dd', null, s.forma)]))))),
      campo('6. ¿Y ahora qué haces con ello?', 'Cazar es observar; esto es aplicar.', ac),
      h('div', { class: 'btns' }, guardar), aviso);
  }
  estado(); pintar();
}

// ── 4. ¿Y tú qué harías? (ejes III y I) ─────────────────────
function situaciones(root, ctx, P, q, a) {
  const SALTOS = Object.fromEntries(ctx.aprender.saltos.map(s => [s.id, s]));
  let reto = false, reloj = null;
  const cuerpo = h('div');
  root.append(cabezaAct(a), cuerpo);
  const parar = () => { clearInterval(reloj); reloj = null; };

  function lista() {
    parar();
    const hechas = cuaderno.leer().situaciones;
    poner(cuerpo, 
      dialogo([['yano', 'Para estas cosas no hace falta pensar: se nota.'], ['todavia', 'Se nota después. Cuando ya lo has dicho.']]),
      h('div', { class: 'panel', style: { marginBottom: '16px' } }, h('b', null, 'Modo reto'), h('p', { class: 'small', style: { margin: '4px 0 8px' } }, 'Veinte segundos por situación. En la vida real casi nunca hay más, y la prisa es justo cuando el automático toma el mando. Pone a prueba tu eje Ser.'),
        toggles([['no', 'Sin reloj'], ['si', 'Con reloj: 20 segundos']], { valor: reto ? 'si' : 'no', alCambiar: v => { reto = v === 'si'; } })),
      h('p', { class: 'muted' }, `${Object.keys(hechas).length} de ${P.situaciones.length} resueltas.`),
      h('div', { class: 'actividades' }, P.situaciones.map((s, i) => h('button', { class: 'actividad', type: 'button', style: { textAlign: 'left', font: 'inherit', cursor: 'pointer' }, onclick: () => jugar(i) },
        h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1), h('h3', null, s.titulo), h('p', null, s.pregunta),
        h('div', { class: 'pie' }, hechas[s.id] !== undefined ? h('span', { class: 'hecha' }, '✓ Resuelta') : h('span', null, 'Sin resolver'))))));
  }

  function jugar(i) {
    parar();
    const s = P.situaciones[i], t = ctx.byId.get(s.termino);
    const ops = shuffle(s.opciones.map((o, k) => ({ ...o, k })));
    const fb = h('div', { 'aria-live': 'polite' });
    const barra = h('i', { style: { '--w': '100%', '--c': 'var(--e-ser)', transition: 'width 1s linear' } });
    let tarde = false, resuelta = false;
    const botones = ops.map((o, n) => h('button', { class: 'opt', type: 'button', onclick: () => elegir(o, botones[n]) }, h('span', { class: 'k' }, 'ABCD'[n]), o.t));
    function elegir(o, b) {
      if (resuelta) return; resuelta = true; parar();
      botones.forEach((x, n) => { x.disabled = true; if (ops[n].ok) x.classList.add('ok'); });
      if (!o.ok) b.classList.add('ko');
      cuaderno.situacion(s.id, o.k, reto && !tarde);
      const mejor = ops.find(x => x.ok);
      const sal = SALTOS[s.salto];
      poner(fb, h('div', { class: `feedback ${o.ok ? 'ok' : 'ko'}` }, h('b', { class: 't' }, o.ok ? (tarde ? 'Buena respuesta, aunque fuera de tiempo.' : '¡Buena respuesta!') : 'Pensémoslo otra vez.'), o.fb),
        o.ok ? null : h('div', { class: 'feedback ok' }, h('b', { class: 't' }, 'La que mejor funciona'), mejor.t, h('div', { class: 'small', style: { marginTop: '4px' } }, mejor.fb)),
        sal ? recuadro('recuerda', `El salto de esta situación: ${sal.id}, ${sal.nombre.toLowerCase()}`, sal.forma, ' ', sal.sigue ? `Lo que sí se sigue: ${sal.sigue}` : '') : null,
        h('div', { class: 'btns', style: { marginTop: '12px' } },
          i < P.situaciones.length - 1 ? h('button', { class: 'btn primary', type: 'button', onclick: () => jugar(i + 1) }, 'Siguiente situación →') : null,
          h('button', { class: 'btn', type: 'button', onclick: lista }, 'Ver todas'), t ? h('a', { class: 'btn', href: `#/termino/${encodeURIComponent(t.id)}` }, `Ficha: ${t.lema}`) : null));
    }
    poner(cuerpo, h('div', { class: 'panel' },
      h('p', { class: 'nivel' }, `Situación ${i + 1} de ${P.situaciones.length}`),
      h('h2', { style: { marginTop: 0 } }, s.titulo),
      dialogo(s.dialogo),
      reto ? h('div', null, h('div', { class: 'barra', role: 'timer', 'aria-label': 'Tiempo restante' }, barra), h('p', { class: 'small muted', style: { margin: '4px 0 0' } }, 'El reloj corre.')) : null,
      h('p', { style: { fontWeight: 600, marginTop: '14px' } }, s.pregunta),
      h('div', { class: 'quiz-opts' }, botones), fb));
    if (reto) {
      let quedan = 20;
      requestAnimationFrame(() => barra.style.setProperty('--w', `${(quedan - 1) * 5}%`));
      reloj = setInterval(() => {
        quedan--;
        barra.style.setProperty('--w', `${Math.max(0, quedan - 1) * 5}%`);
        if (quedan <= 0) { parar(); tarde = true; poner(fb, recuadro('atencion', 'Se acabó el tiempo', 'En la vida real, a veces también. Elige igualmente: ¿qué te habría salido?')); }
      }, 1000);
    }
  }
  lista();
  return { destroy: parar };
}

// ── 5. Tu relato (eje IV, y vuelta al I) ────────────────────
function relato(root, ctx, P, q, a) {
  const R = P.relato, CR = P.creencias;
  const NOMBRES = ['Lo que creo', 'Reencuadrar', 'Recontextualizar', 'Resignificar', 'Tu relato', 'Otra vez', 'Antes y después'];
  const cuerpo = h('div', { class: 'panel' });
  root.append(cabezaAct(a), cuerpo);
  const c0 = cuaderno.leer();
  let paso = !c0.creencias.antes ? 0 : !c0.relato.reencuadre ? 1 : !c0.relato.contexto ? 2 : !c0.relato.sentido ? 3 : !c0.relato.texto ? 4 : !c0.creencias.despues ? 5 : 6;

  function likert(resp, alCambiar) {
    return h('div', null, CR.map((x, i) => {
      const esc = h('div', { class: 'esc', role: 'group', 'aria-label': `${x.texto} De 1 a 5` }, [1, 2, 3, 4, 5].map(n => h('button', { type: 'button', 'aria-pressed': String(resp[i] === n), 'aria-label': `${n}`, onclick: () => {
        resp[i] = n; esc.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k + 1 === n))); alCambiar();
      } }, n)));
      return h('div', { class: 'likert' }, h('span', null, x.texto), esc);
    }), h('p', { class: 'small muted' }, '1: nada de acuerdo · 3: ni sí ni no · 5: muy de acuerdo'));
  }
  const elegida = () => {
    const c = cuaderno.leer(), ant = c.creencias.antes?.resp || [];
    if (c.relato.afirmacion) return CR.findIndex(x => x.id === c.relato.afirmacion);
    let mejor = 0; ant.forEach((v, i) => { if (Math.abs(v - 3) > Math.abs(ant[mejor] - 3)) mejor = i; });
    return mejor;
  };

  function pintar() {
    const c = cuaderno.leer();
    const nav = (ok, f, txt = 'Guardar y seguir →') => h('div', { class: 'btns', style: { marginTop: '12px' } },
      paso > 0 && paso < 6 ? h('button', { class: 'btn', type: 'button', onclick: () => { paso--; pintar(); } }, '← Anterior') : null,
      h('button', { class: 'btn primary', type: 'button', disabled: ok ? null : true, onclick: () => { f(); paso++; pintar(); } }, txt));
    let contenido;
    if (paso === 0 || paso === 5) {
      const resp = Array(CR.length).fill(null);
      const boton = nav(false, () => cuaderno.creencias(paso === 0 ? 'antes' : 'despues', resp.slice()), paso === 0 ? 'Guardar y seguir →' : 'Comparar →');
      const b = boton.querySelector('.primary');
      contenido = [paso === 0 ? dialogo(R.intro) : null,
        h('h2', null, paso === 0 ? 'Lo que creo, hoy' : 'Lo que creo, ahora'),
        h('p', null, paso === 0 ? 'Ocho afirmaciones sobre nuestra época. Sin pensarlo demasiado ni buscar la respuesta correcta, que no la hay: ¿cuánto estás de acuerdo?' : 'Las mismas ocho afirmaciones. No mires lo que respondiste antes: contesta desde donde estás ahora.'),
        likert(resp, () => { b.disabled = resp.some(x => x === null); }), boton];
    } else if (paso >= 1 && paso <= 3) {
      const st = R.pasos[paso - 1], i = elegida(), cr = CR[i], t = ctx.byId.get(cr.termino);
      const ta = textarea(st.ej, c.relato[st.k] || '', st.n);
      const boton = nav(!!(c.relato[st.k] || '').trim(), () => cuaderno.relato({ [st.k]: ta.value.trim(), afirmacion: cr.id }));
      ta.addEventListener('input', () => { boton.querySelector('.primary').disabled = !ta.value.trim(); });
      const sel = paso === 1 ? h('select', { 'aria-label': 'Afirmación con la que trabajar' }, CR.map((x, k) => h('option', { value: k, selected: k === i ? true : null }, `${x.texto} (${c.creencias.antes?.resp[k] ?? '—'})`))) : null;
      sel?.addEventListener('change', () => { cuaderno.relato({ afirmacion: CR[+sel.value].id }); pintar(); });
      const nota = h('div');
      if (paso === 2) ctx.contenido().then(m => { const x = m.get(cr.termino); if (x?.sabias_que) poner(nota, recuadro('sabias', null, inline(x.sabias_que))); }).catch(() => {});
      contenido = [h('h2', null, st.n), h('p', null, h('b', null, 'Trabajas con: '), `«${cr.texto}»`, t ? [' · ', enlaceFicha(t)] : null), sel,
        h('p', { style: { marginTop: '12px' } }, st.q), nota, ta, boton];
    } else if (paso === 4) {
      const vals = { ...c.relato };
      const campos = R.campos.map(f => { const inp = h('input', { type: 'text', value: vals[f.k] || '', placeholder: f.ej, 'aria-label': f.l }); inp.addEventListener('input', () => { vals[f.k] = inp.value; }); return campo(`${f.l}: ${f.q}`, null, inp); });
      const ta = textarea('Tu época, contada por ti, en cinco líneas. Puedes empezar por «Vivo en un tiempo que…»', vals.texto || '', 'Tu relato');
      const boton = nav(!!(vals.texto || '').trim(), () => cuaderno.relato({ protagonista: (vals.protagonista || '').trim(), guion: (vals.guion || '').trim(), objetivo: (vals.objetivo || '').trim(), texto: ta.value.trim() }));
      ta.addEventListener('input', () => { boton.querySelector('.primary').disabled = !ta.value.trim(); });
      contenido = [h('h2', null, 'Tu relato'), h('p', null, 'Todo relato tiene un protagonista, un guion y un objetivo. Con lo que has reencuadrado, recontextualizado y resignificado, escribe el tuyo: más informado y más tuyo que el que traías.'),
        h('div', { class: 'card', style: { margin: '8px 0' } }, h('p', { class: 'small', style: { margin: 0 } }, h('b', null, 'Lo que has ido anotando. '), `Reencuadre: ${c.relato.reencuadre || '—'} · Contexto: ${c.relato.contexto || '—'} · Sentido: ${c.relato.sentido || '—'}`)),
        ...campos, campo('Tu relato', null, ta), boton];
    } else {
      const ant = c.creencias.antes?.resp || [], des = c.creencias.despues?.resp || [];
      const movidas = CR.filter((x, i) => ant[i] !== des[i]).length;
      contenido = [h('h2', null, 'Antes y después'),
        h('p', null, movidas ? `Has movido ${movidas} de ${CR.length} respuestas.` : 'No has movido ninguna respuesta.', ' ', movidas ? 'Pensar a veces cambia lo que crees.' : 'También vale: confirmar una creencia después de examinarla no es lo mismo que no haberla mirado nunca.'),
        h('div', { class: 'table-wrap' }, h('table', null, h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Afirmación'), h('th', { scope: 'col', class: 'num' }, 'Antes'), h('th', { scope: 'col', class: 'num' }, 'Después'), h('th', { scope: 'col', class: 'num' }, 'Cambio'))),
          h('tbody', null, CR.map((x, i) => { const d = (des[i] ?? 0) - (ant[i] ?? 0); return h('tr', null, h('td', null, h('a', { href: `#/termino/${encodeURIComponent(x.termino)}` }, x.texto)), h('td', { class: 'num' }, ant[i] ?? '—'), h('td', { class: 'num' }, des[i] ?? '—'),
            h('td', { class: 'num', style: { fontWeight: 700, color: d ? 'var(--ink)' : 'var(--muted)' } }, d > 0 ? `↑ ${d}` : d < 0 ? `↓ ${-d}` : '='));})))),
        h('div', { class: 'tarjeta-post', style: { marginTop: '18px', maxWidth: '680px' } },
          h('p', { class: 'nivel', style: { color: 'var(--e-crear)' } }, 'Mi relato'),
          c.relato.protagonista ? h('p', { style: { margin: '0 0 4px' } }, h('b', null, 'Protagonista: '), c.relato.protagonista) : null,
          c.relato.guion ? h('p', { style: { margin: '0 0 4px' } }, h('b', null, 'Guion: '), c.relato.guion) : null,
          c.relato.objetivo ? h('p', { style: { margin: '0 0 10px' } }, h('b', null, 'Objetivo: '), c.relato.objetivo) : null,
          h('p', { style: { fontFamily: 'var(--serif)', fontSize: '1.15rem', whiteSpace: 'pre-wrap', margin: 0 } }, c.relato.texto)),
        recuadro('piensa', 'Vuelve dentro de un mes', 'Los relatos se revisan. Repite «Lo que creo» más adelante y mira si tu historia sigue siendo la misma.'),
        finActividad(h('button', { class: 'btn primary', type: 'button', onclick: () => print() }, 'Imprimir o guardar en PDF'),
          h('button', { class: 'btn', type: 'button', onclick: () => descargar('mi-relato-postlab.txt', [`MI RELATO · ${fecha(new Date().toISOString())}`, '', `Protagonista: ${c.relato.protagonista || ''}`, `Guion: ${c.relato.guion || ''}`, `Objetivo: ${c.relato.objetivo || ''}`, '', c.relato.texto, '', 'PostLab · https://oasa10.github.io/PostLab/'].join('\n')) }, 'Descargar'),
          h('button', { class: 'btn', type: 'button', onclick: () => { paso = 5; pintar(); } }, 'Repetir «Lo que creo»'))];
    }
    poner(cuerpo, pasos(NOMBRES, paso), ...contenido.flat().filter(Boolean));
  }
  pintar();
}

// ── 6. Bautiza el siguiente post (ejes IV y III) ────────────
function bautiza(root, ctx, P, q, a) {
  const B = P.bautiza;
  const r = { base: null, otra: '', estrategia: 'relevo', prefijo: 'meta', libre: '', valor: null, nucleo: '', perdida: '', propuesta: '' };
  const cuerpo = h('div', { class: 'panel' });
  const tarjeta = h('div', { 'aria-live': 'polite' });
  root.append(cabezaAct(a), dialogo([['yano', 'Después de la posverdad ya no puede venir nada.'], ['todavia', 'Eso mismo dijeron después de la modernidad.']]), cuerpo, tarjeta);
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const base = () => (r.base === 'otra' ? r.otra.trim().toLowerCase() : r.base || '');
  const lema = () => {
    const b = base();
    if (r.estrategia === 'nuevo') return cap(r.libre.trim());
    if (!b) return '';
    if (r.estrategia === 'apilar') return `Post-pos${b}`;
    return cap(`${r.prefijo}${b}`);
  };
  let guardada = false;

  function pintar() {
    const libre = h('input', { type: 'text', value: r.otra, placeholder: 'Otra palabra: ciudad, amor, escuela…', 'aria-label': 'Otra base', hidden: r.base !== 'otra' });
    libre.addEventListener('input', () => { r.otra = libre.value; vista(); });
    const nombre = h('input', { type: 'text', value: r.libre, placeholder: 'Tu nombre nuevo', 'aria-label': 'Nombre nuevo', hidden: r.estrategia !== 'nuevo' });
    nombre.addEventListener('input', () => { r.libre = nombre.value; vista(); });
    const est = B.estrategias.find(e => e.k === r.estrategia);
    const nuc = textarea('Una frase: qué nombra tu término y por qué hace falta', r.nucleo, 'Definición');
    nuc.addEventListener('input', () => { r.nucleo = nuc.value; vista(); });
    const per = h('input', { type: 'text', value: r.perdida, placeholder: 'Por ejemplo: la idea de que todo dato es sospechoso', 'aria-label': 'Qué pierde autoridad' });
    per.addEventListener('input', () => { r.perdida = per.value; vista(); });
    const pro = h('input', { type: 'text', value: r.propuesta, placeholder: 'Por ejemplo: comprobar en comunidad, sin ingenuidad ni cinismo', 'aria-label': 'Qué propone' });
    pro.addEventListener('input', () => { r.propuesta = pro.value; vista(); });
    poner(cuerpo, 
      campo('1. ¿Después de qué?', 'Elige la base: lo que tu término deja atrás.', h('div', null,
        toggles([...B.bases.map(x => [x.base, cap(x.base)]), ['otra', 'Otra…']], { valor: r.base, alCambiar: v => { r.base = v; libre.hidden = v !== 'otra'; vista(); } }), libre)),
      campo('2. ¿Cómo lo nombras?', null, h('div', null,
        toggles(B.estrategias.map(e => [e.k, e.n]), { valor: r.estrategia, alCambiar: v => { r.estrategia = v || 'relevo'; pintar(); } }),
        h('p', { class: 'small muted', style: { margin: '4px 0 8px' } }, est.d),
        r.estrategia === 'relevo' ? toggles(B.prefijos.map(p => [p, `${p}-`]), { valor: r.prefijo, alCambiar: v => { r.prefijo = v || 'meta'; vista(); } }) : null, nombre)),
      campo('3. ¿Qué clase de «después» es?', null, toggles(CODIGOS.map(c => [c, `${c} · ${VALORES[c].llana}`]), { valor: r.valor, alCambiar: v => { r.valor = v; vista(); } })),
      campo('4. ¿Qué nombra?', null, nuc),
      h('div', { class: 'grid g2' }, campo('¿Qué pierde autoridad?', null, per), campo('¿Qué propone en su lugar?', null, pro)),
      recuadro('piensa', 'Un consejo', B.consejo));
    vista();
  }

  function vista() {
    const l = lema();
    if (!l) { poner(tarjeta); return; }
    const existe = ctx.terms.find(t => t.lema.toLowerCase() === l.toLowerCase() || t.variantes.some(v => v.toLowerCase() === l.toLowerCase()));
    const desde = B.bases.find(x => x.base === r.base);
    const grado = r.estrategia === 'apilar' ? 'Segundo grado (post-post)' : r.estrategia === 'relevo' ? 'Relevo de prefijo' : 'Nombre nuevo';
    guardada = false;
    const guardar = h('button', { class: 'btn primary', type: 'button', onclick: () => {
      if (guardada) return;
      guardada = true;
      cuaderno.entrada('bautizo', l, { ...r, lema: l, resumen: [['Después de', base() || '—'], ['Valor', r.valor ? `${r.valor} · ${VALORES[r.valor].llana}` : 'Sin decidir'], ['Qué nombra', r.nucleo || '—'], ['Pierde autoridad', r.perdida || '—'], ['Propone', r.propuesta || '—']] }, { crear: 8, hacer: 3 });
      guardar.textContent = '✓ Guardada en tu cuaderno'; guardar.disabled = true;
    } }, 'Guardar en mi cuaderno');
    const txt = () => [l.toUpperCase(), r.valor ? `${r.valor} · ${VALORES[r.valor].nombre} («${VALORES[r.valor].llana}»)` : '', grado, '', r.nucleo, '', r.perdida ? `Pierde autoridad: ${r.perdida}` : '', r.propuesta ? `Propone: ${r.propuesta}` : '', '', `Acuñado el ${fecha(new Date().toISOString())} en PostLab · https://oasa10.github.io/PostLab/`].filter((x, i, arr) => x || arr[i - 1]).join('\n');
    poner(tarjeta, h('h2', null, 'Tu tarjeta'),
      existe ? recuadro('atencion', 'Ya existe', 'Ese nombre ya está en PostLab: ', h('a', { href: `#/termino/${encodeURIComponent(existe.id)}` }, existe.lema), '. Puedes quedártelo como homenaje o buscar otro.') : null,
      h('div', { class: 'tarjeta-post' },
        h('p', { class: 'nivel', style: { color: 'var(--e-crear)' } }, grado),
        h('div', { class: 'lema' }, l),
        h('div', { class: 'chips', style: { margin: '8px 0' } }, r.valor ? chipValor(r.valor) : h('span', { class: 'chip' }, 'Valor por decidir'), desde ? h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(desde.desde)}` }, `Viene de: ${ctx.byId.get(desde.desde)?.lema || desde.base}`) : null),
        r.nucleo ? h('p', { style: { fontSize: '1.05rem' } }, r.nucleo) : h('p', { class: 'muted' }, 'Escribe qué nombra para completar la tarjeta.'),
        r.perdida ? h('p', { class: 'small', style: { margin: '0 0 4px' } }, h('b', null, 'Pierde autoridad: '), r.perdida) : null,
        r.propuesta ? h('p', { class: 'small', style: { margin: 0 } }, h('b', null, 'Propone: '), r.propuesta) : null,
        h('p', { class: 'small muted', style: { margin: '12px 0 0' } }, `Acuñado el ${fecha(new Date().toISOString())} en PostLab`)),
      h('div', { class: 'btns', style: { marginTop: '12px' } }, guardar,
        h('button', { class: 'btn', type: 'button', onclick: () => descargar(`${l.toLowerCase().replace(/[^a-z0-9áéíóúñü-]+/gi, '-')}.txt`, txt()) }, 'Descargar'),
        navigator.clipboard ? h('button', { class: 'btn', type: 'button', onclick: e => { navigator.clipboard.writeText(txt()).then(() => { e.target.textContent = '✓ Copiado'; }).catch(() => {}); } }, 'Copiar') : null,
        h('a', { class: 'btn', href: '#/cuaderno' }, 'Ver mi cuaderno')));
  }
  pintar();
}
