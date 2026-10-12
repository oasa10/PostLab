// Utilidades comunes de PostLab: datos, DOM, colores y formatos.

export const VALORES = {
  P1: { nombre: 'Cronológico', llana: 'después de', pregunta: '¿Qué hecho o régimen terminó?', registro: 'débil' },
  P2: { nombre: 'Ruptura', llana: 'contra', pregunta: '¿Qué supuestos se abandonan?', registro: 'fuerte' },
  P3: { nombre: 'Radicalización', llana: 'más allá, desde dentro', pregunta: '¿Qué programa se lleva a su límite?', registro: 'fuerte' },
  P4: { nombre: 'Agotamiento', llana: 'lo que queda de', pregunta: '¿Qué sobrevive vaciado?', registro: 'fuerte' },
  P5: { nombre: 'Fin', llana: 'después del final', pregunta: '¿Qué se da por terminado para siempre?', registro: 'fuerte' },
  P6: { nombre: 'Derivación', llana: 'hijo de', pregunta: '¿De qué género desciende?', registro: 'débil' },
};
export const CODIGOS = Object.keys(VALORES);

export const FAMILIAS = ['Modernidad', 'Lenguaje y teoría', 'Ciencia y conocimiento', 'Colonia y orden mundial', 'Economía y trabajo',
  'Política y verdad', 'Humano y técnica', 'Creencias', 'Estilos', 'Épocas'];

export const FASES = [
  { n: 0, nombre: 'Antes de 1700', corto: 'Antiguas', desde: -10000, hasta: 1699 },
  { n: 1, nombre: 'Precursores', corto: 'Fase 1', desde: 1700, hasta: 1965 },
  { n: 2, nombre: 'Eclosión', corto: 'Fase 2', desde: 1966, hasta: 1994 },
  { n: 3, nombre: 'Diversificación y parodia', corto: 'Fase 3', desde: 1995, hasta: 2100 },
];

export const ESTADOS = {
  verificada: { nombre: 'Verificada', ayuda: 'El año y la obra coinciden en al menos una fuente fiable.' },
  probable: { nombre: 'Probable', ayuda: 'Solo coinciden fuentes generales.' },
  dudosa: { nombre: 'Dudosa', ayuda: 'Las fuentes se contradicen o no hay fuente: no entra en los juegos.' },
  'sin verificar': { nombre: 'Por verificar', ayuda: 'Todavía no se ha comprobado.' },
};

// Lectura con las cinco P, por valor del prefijo
export const CINCO_P = {
  P1: { perdida: 'Aquí el prefijo solo fecha: termina un hecho, una guerra o un régimen, y el término ordena lo que vino después.',
        propuesta: 'No propone nada: nombra un periodo. Lo que propone, si propone algo, está en las obras de ese periodo.',
        prudencia: 'Una fecha no es una tesis. «Después de» no dice si lo anterior era bueno o malo, ni que haya desaparecido del todo.' },
  P2: { perdida: 'Pierden autoridad los supuestos de la corriente anterior ante una comunidad (académica, artística o política) que deja de compartirlos.',
        propuesta: 'Rompe, pero el prefijo no dice qué pone en su lugar. Busca en la obra si lo nombra con otras palabras.',
        prudencia: 'Que alguien rompa con X no prueba que X fuera falso ni que haya terminado (salto S1).' },
  P3: { perdida: 'No se abandona lo anterior: se lleva más lejos y se discuten sus límites desde dentro.',
        propuesta: 'Propone continuar el programa por otros medios; conserva más de lo que el nombre sugiere.',
        prudencia: 'Ir «más allá» no es haberlo superado: hereda muchos supuestos de lo que critica.' },
  P4: { perdida: 'Algo sigue ahí, pero vaciado: conserva las formas y pierde la autoridad ante quienes antes confiaban en ello.',
        propuesta: 'Diagnostica, no propone: casi nunca dice qué debería sustituir a lo que se agota.',
        prudencia: 'Que algo pierda autoridad no significa que haya desaparecido ni que todo valga (saltos S1 y S3).' },
  P5: { perdida: 'Se da por terminado algo que parecía permanente: la historia, la ideología, lo humano.',
        propuesta: 'Anuncia un final y deja abierto lo que viene; a veces lo celebra y a veces lo lamenta.',
        prudencia: 'Anunciar un final no lo demuestra: hay que comprobar si lo que «terminó» sigue actuando.' },
  P6: { perdida: 'Un género pierde centralidad y de él nace otro que conserva parte de su sonido, su forma o su actitud.',
        propuesta: 'Propone un estilo nuevo que lleva en el nombre a su padre.',
        prudencia: 'Un estilo derivado no es una copia ni una superación: es una familia.' },
};

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') { for (const [p, x] of Object.entries(v)) { if (p.startsWith('--')) el.style.setProperty(p, x); else el.style[p] = x; } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function anio(a, tipo) {
  if (a === null || a === undefined) return 's. f.';
  if (a <= -5000) return `h. ${Math.abs(a).toLocaleString('es-ES')} a. C.`;
  if (a < 0) return `${Math.abs(a)} a. C.`;
  return String(a);
}

export function norm(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function chipValor(code, opts = {}) {
  const v = VALORES[code];
  if (!v) return null;
  return h('span', { class: 'chip chip-v', 'data-v': code, title: `${code} · ${v.nombre}: «${v.llana}»` },
    h('span', { class: 'dot', 'aria-hidden': 'true' }), opts.corto ? code : `${code} · ${v.nombre}`);
}

export function marcaEstado(estado) {
  if (estado === 'verificada') return null;
  const e = ESTADOS[estado] || ESTADOS['sin verificar'];
  return h('span', { class: `estado estado-${norm(estado).replace(/\s+/g, '-')}`, title: e.ayuda }, e.nombre);
}

export function link(href, ...kids) { return h('a', { href }, ...kids); }

export function storage(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem('postlab:' + key));
    localStorage.setItem('postlab:' + key, JSON.stringify(val));
  } catch (e) { return null; }
}

export function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

export function plural(n, uno, varios) { return `${n.toLocaleString('es-ES')} ${n === 1 ? uno : varios}`; }

export function corta(s, n = 140) {
  s = String(s || '');
  if (s.length <= n) return s;
  return s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:.]$/, '') + '…';
}

// Familias: clase de color y nombre corto
export const FAM_SLUG = {
  'Estilos': 'estilos', 'Modernidad': 'modernidad', 'Economía y trabajo': 'economia', 'Ciencia y conocimiento': 'ciencia',
  'Humano y técnica': 'humano', 'Lenguaje y teoría': 'lenguaje', 'Colonia y orden mundial': 'colonia', 'Política y verdad': 'politica',
  'Creencias': 'creencias', 'Épocas': 'epocas',
};
// Orden del anillo del mapa (los vecinos tienen colores distinguibles)
export const FAM_ANILLO = ['Estilos', 'Modernidad', 'Economía y trabajo', 'Ciencia y conocimiento', 'Humano y técnica', 'Lenguaje y teoría',
  'Colonia y orden mundial', 'Política y verdad', 'Creencias', 'Épocas'];
export const famVar = f => `var(--f-${FAM_SLUG[f] || 'epocas'})`;
export const famColor = f => cssVar(`--f-${FAM_SLUG[f] || 'epocas'}`);
export const valColor = v => cssVar(`--v-${v}`);

export function famTag(f) {
  return h('span', { class: 'fam', style: { '--fc': famVar(f) } }, f);
}

export function termCard(t) {
  const v0 = t.valor[0];
  return h('a', { class: `tcard${t.estado === 'dudosa' ? ' dudosa' : ''}`, href: `#/termino/${encodeURIComponent(t.id)}` },
    h('div', { class: 'row' }, h('h3', null, t.lema), h('span', { class: 'yr' }, anio(t.anio))),
    h('p', null, corta(t.nucleo, 150)),
    h('div', { class: 'meta' }, t.valor.map(v => chipValor(v, { corto: true })), famTag(t.familia), marcaEstado(t.estado)));
}

// Ventana flotante para los gráficos
export const tip = {
  el: null,
  show(content, x, y) {
    const el = this.el || (this.el = document.getElementById('tip'));
    el.replaceChildren(...(Array.isArray(content) ? content : [content]));
    el.classList.add('on');
    const r = el.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = Math.max(8, x - r.width - 14);
    if (top + r.height > innerHeight - 8) top = Math.max(8, y - r.height - 14);
    el.style.left = left + 'px'; el.style.top = top + 'px';
  },
  hide() { (this.el || document.getElementById('tip'))?.classList.remove('on'); },
};

export function tipTerm(t) {
  return [h('b', null, t.lema), h('div', { class: 'm' }, [anio(t.anio), t.valor.map(v => `${v} · ${VALORES[v].nombre}`).join(' / '), t.familia].join(' · ')),
    h('div', null, corta(t.nucleo, 120))];
}

export function seccion(titulo, ...kids) { return h('section', null, h('h2', null, titulo), ...kids); }

// Aleatorio con semilla (para que una partida se pueda repetir si hace falta)
export function rng(seed = Date.now()) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Texto legible sobre un color de relleno: blanco o tinta oscura, el que más contraste
export function tintaSobre(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return '#fff';
  const n = parseInt(m[1], 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.0277) ? '#fff' : '#14202A';
}
