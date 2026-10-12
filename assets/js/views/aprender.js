import { h, poner, VALORES, CODIGOS, CINCO_P, anio, chipValor, shuffle, storage, plural, cabeza, recuadro, dialogo, inline } from '../lib.js';
import * as cuaderno from '../cuaderno.js';

const SECCIONES = [
  ['ruta', 'Ruta en diez paradas'], ['valores', 'Seis valores'], ['cincop', 'Las cinco P'],
  ['saltos', 'Detector de saltos'], ['relevo', 'El relevo'], ['glosario', 'Glosario'],
];

export function render(root, ctx, parts) {
  const sec = parts[0] || '';
  const A = ctx.aprender;
  const tabs = h('nav', { class: 'tabs', 'aria-label': 'Apartados de Aprender' },
    h('a', { href: '#/aprender', 'aria-current': sec === '' ? 'page' : null }, 'Inicio'),
    SECCIONES.map(([k, l]) => h('a', { href: `#/aprender/${k}`, 'aria-current': sec === k ? 'page' : null }, l)));
  root.append(cabeza(2, 'Aprender', 'Herramientas para leer cualquier término post sin dejarte llevar por el prefijo. Poco a poco, con ejemplos y sin exámenes (bueno, alguno hay, pero es voluntario).'), tabs);
  const cuerpo = h('div');
  root.append(cuerpo);
  const f = { '': inicio, ruta, valores, cincop, saltos, relevo, glosario }[sec];
  if (!f) { cuerpo.append(h('p', null, 'Apartado no encontrado. ', h('a', { href: '#/aprender' }, 'Volver'))); return; }
  document.title = `${sec ? SECCIONES.find(s => s[0] === sec)[1] + ' · ' : ''}Aprender · PostLab`;
  return f(cuerpo, ctx, A, parts.slice(1));
}

const term = (ctx, id) => ctx.byId.get(id);
const enlaceT = (ctx, id) => { const t = term(ctx, id); return t ? h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(id)}` }, t.lema, h('span', { class: 'muted' }, anio(t.anio))) : null; };

function inicio(el, ctx, A) {
  el.append(
    dialogo([['yano', 'Si lleva «pos», es que lo anterior se acabó.'], ['todavia', 'O que todavía no sabemos cómo llamar a lo que viene. Depende del «pos».']]),
    h('p', { class: 'lead' }, 'Lo post no es una doctrina, sino una manera de nombrar. Aquí tienes una ruta para recorrer su historia y varias herramientas para leer cualquier término sin tropezar con el prefijo.'),
    h('div', { class: 'grid g3' },
      tile('#/aprender/ruta', 'Ruta en diez paradas', 'De 1703 a 2024, de la teología a la parodia, en diez momentos.'),
      tile('#/aprender/valores', 'Seis maneras de decir «después»', 'Después de, contra, más allá, lo que queda de, tras el final, hijo de.'),
      tile('#/aprender/cincop', 'Las cinco P', 'Partida, prefijo, pérdida, propuesta y prudencia: cinco preguntas para cualquier post.'),
      tile('#/aprender/saltos', 'Detector de saltos', `Ocho inferencias que el prefijo no autoriza y ${A.detector.length} frases para entrenar el ojo.`),
      tile('#/aprender/relevo', 'El después del después', 'Por qué casi nada se llama post-post y cómo termina en parodia.'),
      tile('#/aprender/glosario', 'Glosario', `${A.glosario.length} palabras para orientarse.`)),
    h('h2', null, 'La idea en una frase'),
    h('p', { class: 'kicker', style: { fontSize: '1.25rem', maxWidth: '38em' } }, 'Post es el prefijo del «ya no, todavía no»: declara que algo heredado ha perdido autoridad sin nombrar lo que lo sustituye. Romper sin proponer.'),
    h('p', { class: 'muted' }, 'Esta lectura es una propuesta de PostLab, no un consenso académico. Se puede discutir, y para eso están los datos.'));
}
function tile(href, t, p) { return h('a', { class: 'card tile', href }, h('h3', null, t), h('p', null, p)); }

function ruta(el, ctx, A, parts) {
  let i = Math.min(Math.max(parseInt(parts[0] || '1', 10) || 1, 1), A.ruta.length) - 1;
  const lista = h('ol', { 'aria-label': 'Paradas' });
  const parada = h('div', { class: 'parada', 'aria-live': 'polite' });
  const progreso = h('p', { class: 'small muted', 'aria-live': 'polite' });
  let contenido = null;
  ctx.contenido().then(m => { contenido = m; pintar(); }).catch(() => {});
  el.append(h('p', { class: 'lead' }, 'Diez momentos para entender cómo nace, se dispara y se agota el prefijo. En cada parada, una pregunta rápida: contestarla cuenta como parada hecha en tu cuaderno.'), progreso, h('div', { class: 'ruta' }, h('nav', null, lista), parada));
  function pintar() {
    lista.replaceChildren(...A.ruta.map((p, k) => h('li', null, h('a', { href: `#/aprender/ruta/${k + 1}`, 'aria-current': k === i ? 'step' : null,
      onclick: e => { e.preventDefault(); i = k; pintar(); history.replaceState(null, '', `#/aprender/ruta/${k + 1}`); } }, h('b', null, p.anio), h('span', null, p.titulo)))));
    const p = A.ruta[i];
    const hechas = cuaderno.leer().paradas;
    progreso.textContent = `${hechas.length} de ${A.ruta.length} paradas hechas.`;
    const t0 = p.terminos.map(id => ctx.byId.get(id)).find(t => contenido?.get(t?.id)?.sabias_que);
    const opciones = shuffle([p.valor, ...shuffle(CODIGOS.filter(c => c !== p.valor)).slice(0, 2)]);
    const fb = h('div', { 'aria-live': 'polite' });
    const quiz = h('div', { class: 'card', style: { margin: '16px 0 0' } },
      h('p', { style: { margin: '0 0 8px', fontWeight: 600 } }, hechas.includes(i + 1) ? '✓ Parada hecha. ¿Lo recuerdas?' : 'Pregunta rápida: ¿qué clase de «después» domina en esta parada?'),
      h('div', { class: 'btns' }, opciones.map(c => h('button', { class: 'btn small', type: 'button', onclick: e => {
        const ok = c === p.valor;
        e.currentTarget.parentNode.querySelectorAll('button').forEach(b => { b.disabled = true; });
        poner(fb, h('div', { class: `feedback ${ok ? 'ok' : 'ko'}`, style: { margin: '10px 0 0' } }, h('b', { class: 't' }, ok ? '¡Eso es!' : `Era ${p.valor}, ${VALORES[p.valor].nombre.toLowerCase()}.`), `«${VALORES[p.valor].llana}». ${VALORES[p.valor].pregunta}`));
        cuaderno.parada(i + 1);
        progreso.textContent = `${cuaderno.leer().paradas.length} de ${A.ruta.length} paradas hechas.`;
      } }, `${c} · ${VALORES[c].llana}`))), fb);
    parada.replaceChildren(
      h('p', { class: 'eyebrow' }, `Parada ${i + 1} de ${A.ruta.length}`),
      h('div', { class: 'anio' }, p.anio),
      h('h2', { style: { marginTop: '.3em' } }, p.titulo),
      h('p', { class: 'txt' }, p.texto),
      h('div', { class: 'chips', style: { margin: '14px 0' } }, p.terminos.map(id => enlaceT(ctx, id))),
      quiz,
      t0 ? recuadro('sabias', null, inline(contenido.get(t0.id).sabias_que), h('div', { class: 'small', style: { marginTop: '4px' } }, h('a', { href: `#/termino/${encodeURIComponent(t0.id)}` }, `De la ficha de ${t0.lema} →`))) : null,
      h('div', { class: 'btns', style: { marginTop: '24px' } },
        i > 0 ? h('button', { class: 'btn', type: 'button', onclick: () => ir(i - 1) }, '← Anterior') : null,
        i < A.ruta.length - 1 ? h('button', { class: 'btn primary', type: 'button', onclick: () => ir(i + 1) }, 'Siguiente parada →')
          : h('a', { class: 'btn primary', href: '#/aprender/cincop' }, 'Sigue con las cinco P →')));
  }
  function ir(k) { i = k; pintar(); history.replaceState(null, '', `#/aprender/ruta/${k + 1}`); parada.querySelector('h2')?.focus?.(); window.scrollTo({ top: 0 }); }
  pintar();
}

function valores(el, ctx, A) {
  const cuenta = c => ctx.terms.filter(t => t.valor.includes(c)).length;
  el.append(
    h('p', { class: 'lead' }, 'El prefijo no siempre significa lo mismo. Estos son sus seis valores. P1 y P6 forman el registro débil: solo ordenan en el tiempo o en una familia. De P2 a P5, el registro fuerte: el prefijo emite un juicio sobre lo heredado.'),
    h('p', { class: 'small muted' }, 'Pulsa cada tarjeta para darle la vuelta.'),
    h('div', { class: 'flips' }, CODIGOS.map(c => {
      const b = h('button', { class: 'flip', type: 'button', 'aria-pressed': 'false', style: { '--c': `var(--v-${c})` }, onclick: () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')) },
        h('span', { class: 'in' },
          h('span', { class: 'cara' }, h('small', null, `${c} · registro ${VALORES[c].registro}`), h('span', { class: 'big' }, VALORES[c].nombre), h('i', null, `«${VALORES[c].llana}»`), h('span', { class: 'gira' }, '↻ Dale la vuelta')),
          h('span', { class: 'cara atras' }, h('small', null, `${c} · la pregunta`), h('b', null, VALORES[c].pregunta), h('span', { class: 'small' }, (A.ejemplos[c] || []).map(id => ctx.byId.get(id)?.lema).filter(Boolean).join(' · ')), h('span', { class: 'gira' }, '↻ Volver'))));
      return b;
    })),
    recuadro('recuerda', 'Para recordarlos en orden', h('i', null, 'Después de la fiesta, contra todo pronóstico, fuimos más allá; lo que quedó, tras el final, tuvo un hijo.')),
    h('h2', null, 'Los seis, con calma'),
    h('div', { class: 'grid g2' }, CODIGOS.map(c => h('div', { class: 'card', style: { borderTop: `4px solid var(--v-${c})` } },
      h('p', { class: 'eyebrow', style: { color: 'var(--muted)' } }, `${c} · registro ${VALORES[c].registro} · ${plural(cuenta(c), 'término', 'términos')}`),
      h('h3', { style: { marginTop: 0 } }, VALORES[c].nombre, ' ', h('span', { class: 'kicker' }, `«${VALORES[c].llana}»`)),
      h('p', null, h('b', null, 'Pregunta: '), VALORES[c].pregunta),
      h('p', { class: 'small', style: { color: 'var(--text-2)' } }, CINCO_P[c].perdida),
      h('div', { class: 'chips' }, (A.ejemplos[c] || []).map(id => enlaceT(ctx, id))),
      h('p', { class: 'small', style: { margin: '10px 0 0' } }, h('a', { href: `#/explorar?valor=${c}` }, `Ver todos los ${c} →`))))),
    h('p', null, h('a', { class: 'btn', href: '#/jugar/valores' }, 'Ponte a prueba: Seis maneras de decir «después» →')));
}

function cincop(el, ctx, A) {
  const C = A.cincop;
  const ej = term(ctx, C.ejemplo);
  const sel = h('select', { 'aria-label': 'Elige otro término' }, h('option', { value: '' }, 'Prueba con otro término…'),
    ctx.terms.filter(t => t.valor.length && t.estado !== 'dudosa').sort((a, b) => a.lema.localeCompare(b.lema, 'es')).map(t => h('option', { value: t.id }, t.lema)));
  const otro = h('div');
  sel.addEventListener('change', () => {
    const t = term(ctx, sel.value);
    if (!t) { otro.replaceChildren(); return; }
    const p = CINCO_P[t.valor[0]];
    otro.replaceChildren(h('div', { class: 'cincop', style: { marginTop: '12px' } },
      fila('Partida', '¿Después de qué?', t.base || '—'),
      fila('Prefijo', '¿Qué valor tiene?', `${t.valor.map(v => `${v}, ${VALORES[v].nombre.toLowerCase()}`).join(' y ')}. ${t.porQue}`),
      fila('Pérdida', 'Pista del valor', p.perdida), fila('Propuesta', 'Pista del valor', p.propuesta), fila('Prudencia', 'Pista del valor', p.prudencia)),
      h('p', { class: 'small' }, h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, `Ficha completa de ${t.lema} →`)));
  });
  const panelMano = h('div', { 'aria-live': 'polite' });
  const dedos = C.preguntas.map((p, i) => h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
    dedos.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
    poner(panelMano, h('div', { class: 'card' }, h('p', { class: 'nivel' }, `Dedo ${i + 1} · ${p.p}`), h('h3', { style: { marginTop: 0 } }, p.q), h('p', { style: { margin: 0 } }, h('b', null, `Con ${ej ? ej.lema.toLowerCase() : C.ejemplo}: `), p.ej)));
  } }, h('b', null, i + 1), p.p));
  el.append(
    h('p', { class: 'lead' }, C.intro),
    h('h2', null, 'Una mano, cinco preguntas'),
    h('p', { class: 'muted' }, `Cada dedo es una pregunta. Púlsalos en orden y mira cómo responden con ${ej ? ej.lema.toLowerCase() : C.ejemplo}.`),
    h('div', { class: 'mano', role: 'group', 'aria-label': 'Las cinco P' }, dedos),
    panelMano,
    recuadro('aclaracion', 'Por qué cinco', 'Las dos primeras (partida y prefijo) salen del propio nombre. Las tres últimas (pérdida, propuesta y prudencia) obligan a ir a la obra. La quinta es la que más saltos evita.'),
    h('details', null, h('summary', null, `Ver las cinco respuestas de ${ej ? ej.lema.toLowerCase() : C.ejemplo} juntas`), h('div', { class: 'cincop', style: { marginTop: '10px' } }, C.preguntas.map(p => fila(p.p, p.q, p.ej)))),
    h('h2', null, 'Ahora tú'),
    h('p', { class: 'muted' }, 'Elige un término y mira su lectura rápida. Partida y prefijo salen de su ficha; para las otras tres te damos la pista general de su valor.'),
    sel, otro,
    h('p', { style: { marginTop: '16px' } }, h('a', { class: 'btn primary', href: '#/pensar/cincop' }, 'Hazlo tú en el laboratorio de las cinco P →')));
}
function fila(n, q, t) { return h('div', null, h('b', null, n, h('small', null, q)), h('div', null, t)); }

function saltos(el, ctx, A) {
  const S = Object.fromEntries(A.saltos.map(s => [s.id, s]));
  let orden = shuffle(A.detector), i = 0, aciertos = 0;
  const juego = h('div', { class: 'game' });
  el.append(
    h('p', { class: 'lead' }, 'El prefijo invita a dar saltos que no se siguen. Lee cada frase y decide: ¿se sigue de verdad, o es un salto? Spoiler: no todas son trampas.'),
    juego,
    h('h2', null, 'Los ocho saltos'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, ['', 'Salto', 'Forma', 'Ejemplo', 'Lo que sí se sigue'].map(x => h('th', { scope: 'col' }, x)))),
      h('tbody', null, A.saltos.map(s => h('tr', null, h('td', null, h('b', null, s.id)), h('td', null, s.nombre), h('td', null, s.forma), h('td', null, s.ejemplo), h('td', null, s.sigue)))))));
  function pintar() {
    if (i >= orden.length) {
      const mejor = Math.max(aciertos, storage('saltos') || 0); storage('saltos', mejor);
      cuaderno.detector(aciertos);
      juego.replaceChildren(h('div', { class: 'card' }, h('p', { class: 'eyebrow' }, 'Resultado'), h('div', { class: 'score-big' }, `${aciertos}/${orden.length}`),
        h('p', null, aciertos === orden.length ? 'Ojo de lince: ningún salto se te ha escapado.' : 'Repasa la tabla de abajo y vuelve a intentarlo.'),
        h('p', { class: 'small muted' }, `Tu mejor resultado en este navegador: ${mejor}/${orden.length}`),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { orden = shuffle(A.detector); i = 0; aciertos = 0; pintar(); } }, 'Otra vez')));
      return;
    }
    const d = orden[i];
    const fb = h('div', { 'aria-live': 'polite' });
    const b1 = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'k' }, '✓'), 'Se sigue');
    const b2 = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'k' }, '✗'), 'Es un salto');
    const responder = esSalto => {
      const ok = esSalto === Boolean(d.salto);
      if (ok) aciertos++;
      b1.disabled = b2.disabled = true;
      (d.salto ? b2 : b1).classList.add('ok');
      if (!ok) (esSalto ? b2 : b1).classList.add('ko');
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` },
        h('b', { class: 't' }, ok ? '¡Bien visto!' : 'No exactamente.'),
        d.salto ? h('p', { style: { margin: '0 0 6px' } }, h('b', null, `${d.salto} · ${S[d.salto].nombre}. `), S[d.salto].forma) : null,
        h('p', { style: { margin: 0 } }, d.explica)),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; pintar(); juego.querySelector('.clue')?.focus(); } }, i < orden.length - 1 ? 'Siguiente frase →' : 'Ver resultado'));
      fb.querySelector('button.btn').focus();
    };
    b1.addEventListener('click', () => responder(false));
    b2.addEventListener('click', () => responder(true));
    juego.replaceChildren(
      h('div', { class: 'game-top' }, h('span', null, `Frase ${i + 1} de ${orden.length}`), h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${100 * i / orden.length}%` } })), h('span', null, `${aciertos} aciertos`)),
      h('p', { class: 'clue', tabindex: '-1' }, `«${d.frase}»`),
      h('div', { class: 'quiz-opts two' }, b1, b2), fb);
  }
  pintar();
}

function relevo(el, ctx, A) {
  const R = A.relevo;
  const g2 = ctx.terms.filter(t => t.grado === 2), g3 = ctx.terms.filter(t => t.grado === 3);
  el.append(
    h('h2', { style: { marginTop: 0 } }, 'La ley del relevo'),
    dialogo([['yano', 'Lo posmoderno ya pasó. Ahora toca lo post-posmoderno.'], ['todavia', 'Casi nadie lo llama así. Prefieren estrenar prefijo: meta-, hiper-, alter-…']]),
    h('p', { class: 'lead' }, R.ley),
    h('h3', null, 'Los prefijos del relevo'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, ['Prefijo', 'Término', 'Autor', 'Qué propone'].map(x => h('th', { scope: 'col' }, x)))),
      h('tbody', null, R.prefijos.map(p => h('tr', null, h('td', null, h('b', null, p.prefijo)), h('td', null, p.termino), h('td', null, p.autor), h('td', null, p.propone)))))),
    h('h3', null, 'Tres recorridos completos'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, ['', 'Lo heredado', 'El post', 'Se institucionaliza', 'El relevo'].map(x => h('th', { scope: 'col' }, x)))),
      h('tbody', null, R.recorridos.map(r => h('tr', null, h('td', null, h('b', null, r.familia)), h('td', null, r.heredado), h('td', null, r.post), h('td', null, r.inst), h('td', null, r.relevo)))))),
    h('h3', null, `El post-post: ${plural(g2.length, 'término', 'términos')} en PostLab`),
    h('p', { class: 'muted' }, 'La mayoría no tiene una obra que los fije; en la base aparecen como dudosos o probables.'),
    h('div', { class: 'chips' }, g2.map(t => enlaceT(ctx, t.id))),
    h('h3', null, 'Y la parodia'),
    h('p', null, R.parodia),
    h('div', { class: 'chips' }, g3.map(t => enlaceT(ctx, t.id))));
}

function glosario(el, ctx, A) {
  const filtro = h('input', { type: 'search', placeholder: 'Filtra el glosario', 'aria-label': 'Filtrar el glosario' });
  const dl = h('dl', { class: 'gl' });
  const pintar = () => {
    const q = filtro.value.trim().toLowerCase();
    dl.replaceChildren(...A.glosario.filter(([t, d]) => !q || (t + ' ' + d).toLowerCase().includes(q)).flatMap(([t, d]) => [h('dt', null, t), h('dd', null, d)]));
  };
  filtro.addEventListener('input', pintar);
  el.append(h('p', { class: 'lead' }, 'Las palabras que usa PostLab y algunas ideas útiles para pensar lo post.'), h('div', { style: { maxWidth: '420px' } }, filtro), dl);
  pintar();
}
