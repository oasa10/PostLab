import { h, poner, cabeza, recuadro, descargar, fecha, plural } from '../lib.js';
import * as cuaderno from '../cuaderno.js';
import { EJES, ORDEN_EJES, PELDANOS, INSIGNIAS } from '../cuaderno.js';
import { EMOCIONES } from './ficha.js';
import { obtener } from '../episodio.js';

const DONDE = { ser: '#/pensar/termometro', saber: '#/aprender', hacer: '#/jugar', crear: '#/pensar/relato' };
const TIPOS = { sap: 'Termómetro', cincop: 'Laboratorio de las cinco P', caza: 'Caza de posts', bautizo: 'Bautizo' };
const EMO = Object.fromEntries(EMOCIONES);

export function render(root, ctx) {
  document.title = 'Tu cuaderno · PostLab';
  const cuerpo = h('div');
  // Tus episodios (W16): palabras, misiones, vueltas e historias. La racha se pausa, no se pierde
  const episodios = h('div', { class: 'ep-cuaderno' });
  root.append(
    cabeza(2, 'Tu cuaderno', 'Aquí queda lo que haces en PostLab: tus episodios, con sus misiones y tus historias, y tus cuatro ejes: lo que sientes, lo que sabes, lo que haces y lo que crees. Vive solo en este navegador: nadie más lo ve, ni siquiera nosotros.'),
    h('section', { id: 'episodios' }, h('h2', null, 'Tus episodios'), episodios),
    cuerpo,
  );
  obtener(ctx).then(E => E.cuaderno(episodios, {
    alVolver: id => { location.hash = `#/vuelta/${encodeURIComponent(id)}`; },
    alAbrir: id => { location.hash = `#/episodio/${encodeURIComponent(id)}`; } })).catch(() => {});
  let creencias = null;
  ctx.pensar().then(p => { creencias = p.creencias; pintar(); }).catch(() => {});

  function pintar() {
    const c = cuaderno.leer();
    const total = Object.values(c.xp).reduce((a, b) => a + b, 0);
    const propias = c.entradas.filter(e => e.tipo !== 'reaccion');
    const reacciones = c.entradas.filter(e => e.tipo === 'reaccion');
    const ganadas = INSIGNIAS.filter(i => c.insignias[i.id]);
    poner(cuerpo, 
      total ? null : recuadro('aclaracion', 'Tu cuaderno está en blanco', 'Como todos los buenos cuadernos al principio. Se irá llenando solo a medida que leas fichas, juegues y pienses. ',
        h('a', { href: '#/explorar' }, 'Empieza por una ficha'), ' o ', h('a', { href: '#/pensar' }, 've directo a Pensar y aplicar'), '.'),
      h('h2', null, 'Tus cuatro ejes'),
      h('div', { class: 'ejes' }, ORDEN_EJES.map(e => eje(e, c))),
      recuadro('profundizar', 'Cómo se leen los ejes',
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Ser. '), 'Ante algo nuevo solemos sentir primero, actuar después y pensar al final. No se trata de dejar de sentir, sino de notar el orden y, cuando conviene, darle la vuelta.'),
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Saber. '), 'Una escalera: del ruido a los datos, de ahí a la información, al conocimiento y, arriba, al entendimiento, que es saber cuándo usar lo que sabes.'),
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Hacer. '), 'Otra escalera, de la aptitud a la experiencia cultivada. Ojo: actuar no es hacer. Actuar es lo que sale solo; hacer es lo que eliges y practicas.'),
        h('p', { style: { margin: 0 } }, h('b', null, 'Creer y crear. '), 'La historia que te cuentas sobre ti y sobre tu tiempo. Se revisa reencuadrando, recontextualizando y resignificando, hasta escribir una más informada.')),
      h('h2', null, 'Insignias ', h('span', { class: 'muted', style: { fontSize: '1rem' } }, `${ganadas.length} de ${INSIGNIAS.length}`)),
      h('div', { class: 'insignias' }, INSIGNIAS.map(i => h('div', { class: `insignia${c.insignias[i.id] ? '' : ' bloq'}`, style: { '--c': `var(--e-${i.eje})` }, title: c.insignias[i.id] ? `Conseguida el ${fecha(c.insignias[i.id])}` : 'Todavía no' },
        h('div', { class: 'med', 'aria-hidden': 'true' }, i.ico), h('b', null, i.n), h('span', null, c.insignias[i.id] ? `Conseguida el ${fecha(c.insignias[i.id])}` : i.d)))),
      h('h2', null, 'Tus entradas'),
      propias.length ? h('div', { class: 'entradas' }, propias.map(entrada)) : h('p', { class: 'muted' }, 'Aún no hay entradas. Las crean las actividades de ', h('a', { href: '#/pensar' }, 'Pensar y aplicar'), ': termómetros, análisis, cazas y bautizos.'),
      reacciones.length ? h('section', null, h('h2', null, 'Lo que te provocan los términos'),
        h('p', { class: 'muted small' }, 'Tus primeras reacciones, tal como las marcaste en cada ficha. Vuelve a ellas dentro de un tiempo: a veces lo que cambia no es el término, sino quien lo mira.'),
        h('div', { class: 'chips' }, reacciones.map(e => h('a', { class: 'chip', href: `#/termino/${encodeURIComponent(e.datos.id)}` }, h('b', null, e.titulo), ' ', (e.datos.emociones || []).map(x => EMO[x] || x).join(', ').toLowerCase())))) : null,
      relato(c),
      h('h2', null, 'Llévatelo'),
      h('div', { class: 'btns no-print' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => descargar('mi-cuaderno-postlab.txt', texto(c)) }, 'Descargar en texto'),
        h('button', { class: 'btn', type: 'button', onclick: () => print() }, 'Imprimir o guardar en PDF'),
        h('button', { class: 'btn', type: 'button', onclick: () => {
          if (confirm('¿Borrar todo tu cuaderno? Se perderán tus ejes, insignias y entradas, y no se puede deshacer.')) { cuaderno.borrarTodo(); pintar(); }
        } }, 'Borrar mi cuaderno')),
      h('p', { class: 'small muted' }, 'Se guarda en el almacenamiento de este navegador. Si lo borras, cambias de dispositivo o usas una ventana privada, empieza de cero.'),
    );
  }

  function eje(e, c) {
    const P = PELDANOS[e], p = cuaderno.peldano(e, c), E = EJES[e];
    const sig = p < P.length - 1 ? P[Math.max(p, 0)].pista : P[P.length - 1].pista;
    return h('article', { class: 'eje', 'data-eje': e },
      h('span', { class: 'xp' }, plural(c.xp[e] || 0, 'punto', 'puntos')),
      h('h3', null, h('span', { 'aria-hidden': 'true', style: { color: 'var(--c)' } }, E.ico, ' '), E.nombre),
      h('div', { class: 'sub' }, E.sub),
      h('div', { class: 'barra', role: 'img', 'aria-label': `${p + 1} de ${P.length} peldaños` }, h('i', { style: { '--w': `${Math.round(100 * (p + 1) / P.length)}%` } })),
      e === 'ser' ? h('div', { class: 'sap3' }, [['sentir', 'Sentir'], ['actuar', 'Actuar'], ['pensar', 'Pensar']].map(([k, l]) => h('div', null, h('b', null, c.sap[k] || 0), l))) : null,
      h('ol', { class: 'escalera', style: { marginTop: '10px' } }, P.map((x, i) => h('li', { class: i < p ? 'hecho' : i === p ? 'aqui' : '', style: { '--i': i }, title: x.d },
        x.n, i === p ? h('span', { class: 'sr-only' }, ' (estás aquí)') : null))),
      h('p', { class: 'siguiente' }, p >= 0 ? h('span', null, h('b', null, 'Estás en ', P[p].n.toLowerCase(), '. '), P[p].d, ' ') : null,
        h('br'), h('b', null, p < P.length - 1 ? 'Siguiente paso: ' : 'Y ahora: '), h('a', { href: DONDE[e] }, sig)),
      h('p', { class: 'small muted', style: { margin: '6px 0 0', fontStyle: 'italic' } }, E.pregunta));
  }

  function entrada(e) {
    const caja = h('div', { class: 'revisar', hidden: true });
    const ta = h('textarea', { 'aria-label': 'Tu revisión', placeholder: '¿Qué ves ahora que no veías entonces? ¿Lo harías igual?' });
    caja.append(ta, h('div', { class: 'btns', style: { marginTop: '8px' } },
      h('button', { class: 'btn small primary', type: 'button', onclick: () => { if (ta.value.trim()) { cuaderno.revisar(e.id, ta.value.trim()); pintar(); } } }, 'Guardar revisión'),
      h('button', { class: 'btn small', type: 'button', onclick: () => { caja.hidden = true; } }, 'Cancelar')));
    return h('article', { class: 'entrada' },
      h('div', { class: 'meta' }, h('span', { class: 'chip' }, TIPOS[e.tipo] || e.tipo), h('span', { class: 'muted small' }, fecha(e.fecha))),
      h('h3', null, e.titulo),
      e.datos?.resumen ? h('dl', { class: 'datos' }, e.datos.resumen.map(([k, v]) => [h('dt', null, k), h('dd', null, v)])) : null,
      e.revision ? recuadro('recuerda', `Revisada el ${fecha(e.revision.fecha)}`, e.revision.texto) : null,
      h('div', { class: 'btns no-print' },
        h('button', { class: 'btn small', type: 'button', onclick: () => { caja.hidden = false; ta.focus(); } }, e.revision ? 'Revisar otra vez' : 'Revisar'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { if (confirm('¿Borrar esta entrada?')) { cuaderno.borrarEntrada(e.id); pintar(); } } }, 'Borrar')),
      caja);
  }

  function relato(c) {
    const r = c.relato, cr = c.creencias;
    if (!r.texto && !cr.antes) return null;
    const filas = creencias && cr.antes ? creencias.map((x, i) => h('tr', null, h('td', null, x.texto), h('td', { class: 'num' }, cr.antes.resp[i] ?? '—'),
      h('td', { class: 'num' }, cr.despues ? (cr.despues.resp[i] ?? '—') : '—'))) : [];
    return h('section', null, h('h2', null, 'Tu relato'),
      r.texto ? h('div', { class: 'panel' },
        r.protagonista ? h('p', null, h('b', null, 'Protagonista: '), r.protagonista) : null,
        r.guion ? h('p', null, h('b', null, 'Guion: '), r.guion) : null,
        r.objetivo ? h('p', null, h('b', null, 'Objetivo: '), r.objetivo) : null,
        h('p', { style: { fontFamily: 'var(--serif)', fontSize: '1.1rem', whiteSpace: 'pre-wrap', margin: 0 } }, r.texto)) : h('p', { class: 'muted' }, 'Has empezado. ', h('a', { href: '#/pensar/relato' }, 'Sigue con tu relato'), '.'),
      filas.length ? h('div', { class: 'table-wrap', style: { marginTop: '14px' } }, h('table', null,
        h('caption', { class: 'small muted', style: { textAlign: 'left', padding: '8px 10px' } }, 'Lo que creo: de 1 (nada de acuerdo) a 5 (muy de acuerdo)'),
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Afirmación'), h('th', { scope: 'col', class: 'num' }, 'Antes'), h('th', { scope: 'col', class: 'num' }, 'Después'))),
        h('tbody', null, filas))) : null);
  }

  function texto(c) {
    const L = ['MI CUADERNO DE POSTLAB', `Descargado el ${fecha(new Date().toISOString())}`, ''];
    for (const e of ORDEN_EJES) { const p = cuaderno.peldano(e, c); L.push(`${EJES[e].nombre}: ${p >= 0 ? PELDANOS[e][p].n : 'sin empezar'} (${c.xp[e] || 0} puntos)`); }
    L.push('', `Fichas leídas: ${c.fichas.length}`, `Insignias: ${INSIGNIAS.filter(i => c.insignias[i.id]).map(i => i.n).join(', ') || 'ninguna todavía'}`, '');
    for (const e of c.entradas.filter(x => x.tipo !== 'reaccion')) {
      L.push(`— ${TIPOS[e.tipo] || e.tipo} · ${fecha(e.fecha)} · ${e.titulo}`);
      for (const [k, v] of e.datos?.resumen || []) L.push(`   ${k}: ${v}`);
      if (e.revision) L.push(`   Revisión (${fecha(e.revision.fecha)}): ${e.revision.texto}`);
      L.push('');
    }
    if (c.relato.texto) L.push('MI RELATO', `Protagonista: ${c.relato.protagonista || ''}`, `Guion: ${c.relato.guion || ''}`, `Objetivo: ${c.relato.objetivo || ''}`, '', c.relato.texto, '');
    L.push('PostLab · https://oasa10.github.io/PostLab/');
    return L.join('\n');
  }

  pintar();
  const quitar = cuaderno.alCambiar(() => pintar());
  return { destroy: quitar };
}
