import { h, VALORES, CODIGOS, anio, shuffle, storage, corta } from '../lib.js';

const JUEGOS = {
  quepost: { titulo: '¿Qué post es?', texto: 'Lee la definición y elige el término entre cuatro. Diez rondas.', f: quePost },
  ordena: { titulo: 'Ordena la historia', texto: 'Cinco términos al azar: ponlos en orden, del más antiguo al más reciente.', f: ordena },
  valores: { titulo: 'Seis maneras de decir «después»', texto: 'Sale un término y eliges qué clase de «después» expresa su prefijo. Diez rondas.', f: seisValores },
};

export function render(root, ctx, parts) {
  const k = parts[0];
  if (k && JUEGOS[k]) {
    document.title = `${JUEGOS[k].titulo} · Jugar · PostLab`;
    root.append(h('nav', { class: 'crumbs' }, h('a', { href: '#/jugar' }, 'Jugar'), ' › ', JUEGOS[k].titulo), h('h1', null, JUEGOS[k].titulo));
    const el = h('div', { class: 'game' });
    root.append(el);
    JUEGOS[k].f(el, ctx);
    return;
  }
  document.title = 'Jugar · PostLab';
  const n = ctx.terms.filter(ctx.juego).length;
  root.append(
    h('h1', null, 'Jugar'),
    h('p', { class: 'lead' }, `Tres juegos para aprender jugando con ${n} términos. Las fichas dudosas no entran. Tus mejores marcas se guardan solo en este navegador.`),
    h('div', { class: 'grid g3' }, Object.entries(JUEGOS).map(([k, j]) => {
      const m = storage(`mejor:${k}`);
      return h('a', { class: 'card tile', href: `#/jugar/${k}` }, h('h3', null, j.titulo), h('p', null, j.texto),
        h('p', { class: 'small muted', style: { marginTop: '10px' } }, m !== null && m !== undefined ? `Tu mejor marca: ${m}` : 'Aún no has jugado'));
    })),
    h('p', { style: { marginTop: '20px' } }, '¿Prefieres otro reto? Prueba el ', h('a', { href: '#/aprender/saltos' }, 'detector de saltos'), '.'));
}

function cabecera(i, total, puntos) {
  return h('div', { class: 'game-top' }, h('span', null, `Ronda ${i + 1} de ${total}`),
    h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${100 * i / total}%` } })), h('span', null, `${puntos} ${puntos === 1 ? 'punto' : 'puntos'}`));
}

function final(el, clave, puntos, total, otra, mensaje) {
  const previo = storage(`mejor:${clave}`);
  const mejor = Math.max(puntos, previo ?? 0);
  storage(`mejor:${clave}`, mejor);
  el.replaceChildren(h('div', { class: 'card' },
    h('p', { class: 'eyebrow' }, 'Resultado'),
    h('div', { class: 'score-big' }, `${puntos}/${total}`),
    h('p', null, mensaje(puntos / total)),
    h('p', { class: 'small muted' }, previo !== null && puntos > previo ? '¡Nueva mejor marca en este navegador!' : `Tu mejor marca en este navegador: ${mejor}/${total}`),
    h('div', { class: 'btns' }, h('button', { class: 'btn primary', type: 'button', onclick: otra }, 'Jugar otra vez'), h('a', { class: 'btn', href: '#/jugar' }, 'Otros juegos'))));
  el.querySelector('button').focus();
}
const frase = r => r === 1 ? 'Perfecto. Sabes más de lo post que mucha gente que lo usa a diario.' : r >= .7 ? 'Muy bien. Unos pocos se te han resistido.' : r >= .4 ? 'No está mal. Pasea un rato por Explorar y vuelve.' : 'Lo post es resbaladizo. Empieza por la ruta de Aprender y vuelve a intentarlo.';

// ¿Qué post es?
function quePost(el, ctx) {
  const pool = ctx.terms.filter(ctx.juego);
  const RONDAS = 10;
  let rondas, i, puntos;
  const nueva = () => { rondas = shuffle(pool).slice(0, RONDAS); i = 0; puntos = 0; pintar(); };
  function opciones(t) {
    // distractores: preferimos la misma familia para que no sea trivial
    const misma = shuffle(pool.filter(x => x.id !== t.id && x.familia === t.familia));
    const resto = shuffle(pool.filter(x => x.id !== t.id && x.familia !== t.familia));
    return shuffle([t, ...misma.slice(0, 2), ...resto].slice(0, 4));
  }
  function pintar() {
    if (i >= rondas.length) return final(el, 'quepost', puntos, rondas.length, nueva, frase);
    const t = rondas[i];
    const fb = h('div', { 'aria-live': 'polite' });
    const ops = opciones(t);
    const botones = ops.map((o, k) => h('button', { class: 'opt', type: 'button', onclick: () => elegir(o, k) }, h('span', { class: 'k' }, 'ABCD'[k]), o.lema));
    function elegir(o, k) {
      const ok = o.id === t.id;
      if (ok) puntos++;
      botones.forEach((b, j) => { b.disabled = true; if (ops[j].id === t.id) b.classList.add('ok'); });
      if (!ok) botones[k].classList.add('ko');
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` },
        h('b', { class: 't' }, ok ? '¡Correcto!' : `Era «${t.lema}».`),
        h('p', { style: { margin: 0 } }, `${anio(t.anio)} · ${t.obra}`), h('p', { class: 'small', style: { margin: '6px 0 0' } }, h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, 'Ver la ficha'))),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; pintar(); } }, i < rondas.length - 1 ? 'Siguiente →' : 'Ver resultado'));
      fb.querySelector('button.btn').focus();
    }
    el.replaceChildren(cabecera(i, rondas.length, puntos),
      h('p', { class: 'muted small', style: { margin: '14px 0 6px' } }, `¿Qué término post responde a esta definición? Pista: familia ${t.familia.toLowerCase()}.`),
      h('p', { class: 'clue', tabindex: '-1' }, t.nucleo),
      h('div', { class: 'quiz-opts' }, botones), fb);
    el.querySelector('.clue').focus({ preventScroll: true });
  }
  nueva();
}

// Ordena la historia
function ordena(el, ctx) {
  const pool = ctx.terms.filter(t => ctx.juego(t) && t.anio !== null && t.anio >= 1700);
  const RONDAS = 5;
  let ronda, puntos, lista;
  const nueva = () => { ronda = 0; puntos = 0; repartir(); };
  function repartir() {
    // cinco términos con años distintos y separados al menos 3 años
    const elegidos = [];
    for (const t of shuffle(pool)) { if (elegidos.every(e => Math.abs(e.anio - t.anio) >= 3)) elegidos.push(t); if (elegidos.length === 5) break; }
    lista = shuffle(elegidos);
    pintar(false);
  }
  function pintar(resuelto) {
    const ul = h('ol', { class: 'order-list' });
    const correcto = lista.slice().sort((a, b) => a.anio - b.anio);
    lista.forEach((t, k) => {
      const ok = resuelto && correcto[k].id === t.id;
      ul.append(h('li', { class: resuelto ? (ok ? 'ok' : 'ko') : '' },
        h('span', { class: 'pos' }, k + 1),
        h('span', { class: 'name' }, t.lema, resuelto ? h('small', null, `${anio(t.anio)} · ${corta(t.obra, 90)}`) : h('small', null, famTagTexto(t))),
        resuelto ? null : [
          h('button', { type: 'button', 'aria-label': `Subir ${t.lema}`, disabled: k === 0, onclick: () => mover(k, -1) }, '↑'),
          h('button', { type: 'button', 'aria-label': `Bajar ${t.lema}`, disabled: k === lista.length - 1, onclick: () => mover(k, 1) }, '↓')]));
    });
    const aciertosRonda = resuelto ? lista.filter((t, k) => correcto[k].id === t.id).length : 0;
    el.replaceChildren(
      h('div', { class: 'game-top' }, h('span', null, `Ronda ${ronda + 1} de ${RONDAS}`), h('div', { class: 'progress', 'aria-hidden': 'true' }, h('i', { style: { width: `${100 * ronda / RONDAS}%` } })), h('span', null, `${puntos} puntos`)),
      h('p', { class: 'muted', style: { margin: '14px 0 0' } }, 'Ordena del más antiguo (arriba) al más reciente (abajo) con las flechas. Cuenta el año de la obra o el hito que fija cada término.'),
      ul,
      resuelto ? h('div', { class: `feedback ${aciertosRonda === 5 ? 'ok' : 'ko'}`, 'aria-live': 'polite' },
        h('b', { class: 't' }, aciertosRonda === 5 ? '¡Orden perfecto!' : `${aciertosRonda} de 5 en su sitio.`),
        aciertosRonda < 5 ? h('p', { style: { margin: 0 } }, 'El orden correcto: ', correcto.map(t => `${t.lema} (${anio(t.anio)})`).join(' → ')) : null) : null,
      h('div', { class: 'btns' }, resuelto
        ? h('button', { class: 'btn primary', type: 'button', onclick: () => { ronda++; if (ronda >= RONDAS) final(el, 'ordena', puntos, RONDAS * 5, nueva, frase); else repartir(); } }, ronda < RONDAS - 1 ? 'Siguiente ronda →' : 'Ver resultado')
        : h('button', { class: 'btn primary', type: 'button', onclick: () => { puntos += lista.filter((t, k) => correcto[k].id === t.id).length; pintar(true); el.querySelector('.feedback')?.scrollIntoView({ block: 'nearest' }); } }, 'Comprobar')));
  }
  function mover(k, d) {
    [lista[k], lista[k + d]] = [lista[k + d], lista[k]];
    pintar(false);
    el.querySelectorAll('.order-list li')[k + d]?.querySelector(`button[aria-label^="${d < 0 ? 'Subir' : 'Bajar'}"]:not([disabled])`)?.focus()
      || el.querySelectorAll('.order-list li')[k + d]?.querySelector('button:not([disabled])')?.focus();
  }
  nueva();
}
function famTagTexto(t) { return t.familia; }

// Seis maneras de decir «después»
function seisValores(el, ctx) {
  const pool = ctx.terms.filter(t => ctx.juego(t) && t.valor.length && t.porQue);
  const RONDAS = 10;
  let rondas, i, puntos;
  // repartimos para que salgan valores variados
  const nueva = () => {
    const porValor = CODIGOS.map(c => shuffle(pool.filter(t => t.valor[0] === c)));
    rondas = [];
    for (let k = 0; rondas.length < RONDAS && k < 50; k++) for (const g of shuffle(porValor)) if (g.length && rondas.length < RONDAS) rondas.push(g.shift());
    rondas = shuffle(rondas); i = 0; puntos = 0; pintar();
  };
  function pintar() {
    if (i >= rondas.length) return final(el, 'valores', puntos, rondas.length, nueva, frase);
    const t = rondas[i];
    const fb = h('div', { 'aria-live': 'polite' });
    const botones = CODIGOS.map(c => h('button', { class: 'vbtn', type: 'button', style: { '--c': `var(--v-${c})` }, onclick: () => elegir(c) },
      h('b', null, `${c} · ${VALORES[c].nombre}`), h('span', null, `«${VALORES[c].llana}»`)));
    function elegir(c) {
      const ok = t.valor.includes(c);
      if (ok) puntos++;
      botones.forEach((b, j) => { b.disabled = true; if (t.valor.includes(CODIGOS[j])) b.classList.add('ok'); });
      if (!ok) botones[CODIGOS.indexOf(c)].classList.add('ko');
      fb.replaceChildren(h('div', { class: `feedback ${ok ? 'ok' : 'ko'}` },
        h('b', { class: 't' }, ok ? '¡Correcto!' : `Es ${t.valor.join(' y ')}.`),
        h('p', { style: { margin: 0 } }, t.porQue),
        h('p', { class: 'small', style: { margin: '6px 0 0' } }, h('a', { href: `#/termino/${encodeURIComponent(t.id)}` }, `Ficha de ${t.lema}`))),
        h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; pintar(); } }, i < rondas.length - 1 ? 'Siguiente →' : 'Ver resultado'));
      fb.querySelector('button.btn').focus();
    }
    el.replaceChildren(cabecera(i, rondas.length, puntos),
      h('div', { class: 'clue', tabindex: '-1', style: { marginTop: '14px' } },
        h('div', { style: { fontSize: '1.7em', fontWeight: 600 } }, t.lema),
        h('div', { class: 'small', style: { fontFamily: 'var(--sans)', color: 'var(--muted)', marginTop: '4px' } }, `${anio(t.anio)} · ${t.obra}`),
        t.base ? h('div', { class: 'small', style: { fontFamily: 'var(--sans)', color: 'var(--text-2)', marginTop: '8px' } }, `Base: ${t.base}`) : null),
      h('p', { class: 'muted small', style: { margin: '12px 0 0' } }, '¿Qué clase de «después» expresa su prefijo? Si lleva dos valores, cualquiera de los dos vale.'),
      h('div', { class: 'vgrid' }, botones), fb);
    el.querySelector('.clue').focus({ preventScroll: true });
  }
  nueva();
}
