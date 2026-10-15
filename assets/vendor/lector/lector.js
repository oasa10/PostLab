/* Lector 1.0 · «Escuchar» común de las webs hechas con el Método BrainBox (BrainBox, curso, PostLab, NeuroLab, CareLab).
   Lee por segmentos claramente separados (títulos, párrafos y puntos de una lista), con una pausa entre ellos y el
   segmento que suena marcado en la página. Deja elegir la voz entre las del dispositivo (las más naturales, primero) y la
   velocidad, y trae un reproductor: anterior, pausa, siguiente y parar.
   Sin dependencias, sin red y sin servidor: funciona también dentro de un HTML de doble clic.
   Guarda solo la voz y la velocidad elegidas, en este dispositivo (localStorage, clave '<sitio>:lector'). */
(function (w) {
  'use strict';
  const d = w.document;
  const OK = !!(w.speechSynthesis && typeof w.SpeechSynthesisUtterance === 'function');
  const S = OK ? w.speechSynthesis : null;

  const VELOCIDADES = [[0.75, '0,75×'], [0.9, '0,9×'], [1, '1× normal'], [1.1, '1,1×'], [1.25, '1,25×'], [1.5, '1,5×']];
  const PAUSA = { titulo: 700, parrafo: 480, item: 320, frase: 110 };   // milisegundos de silencio después, a velocidad normal
  const MAX = 160;                                                        // caracteres por enunciado: Chrome corta los largos
  const BASE = 'script,style,noscript,template,svg,canvas,button,input,textarea,select,option,[aria-hidden="true"],.lector,.no-leer';

  const cfg = { sitio: 'lector', subir: '', excluir: '' };
  const aj = { voz: '', vel: 1 };
  const fallidas = {};
  let VOCES = [];

  // ------------------------------------------------------------------ el dispositivo
  const UA = (w.navigator && w.navigator.userAgent) || '';
  const IOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/i.test(UA) && (w.navigator.maxTouchPoints || 0) > 1);
  const MAC = /Macintosh/i.test(UA) && !IOS;
  const ANDROID = /Android/i.test(UA);
  const EDGE = /Edg\//.test(UA);
  const WINDOWS = /Windows/i.test(UA);
  const REDUCIR = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------------------------------------------ ajustes
  const clave = () => cfg.sitio + ':lector';
  function cargarAjustes() {
    try {
      const v = JSON.parse(w.localStorage.getItem(clave()));
      if (v && typeof v === 'object') {
        aj.voz = typeof v.voz === 'string' ? v.voz : '';
        aj.vel = VELOCIDADES.some(x => x[0] === +v.vel) ? +v.vel : 1;
      }
    } catch (e) { /* sin almacenamiento: valen los de serie */ }
  }
  function guardarAjustes() { try { w.localStorage.setItem(clave(), JSON.stringify(aj)); } catch (e) { /* nada */ } }

  // ------------------------------------------------------------------ las voces: las más naturales, primero
  const NOVEDAD = /\b(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Fred|Good News|Grandma|Grandpa|Abuela|Abuelo|Jester|Junior|Kathy|Organ|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
  const PAIS = { ES: 'España', MX: 'México', US: 'Estados Unidos', AR: 'Argentina', CO: 'Colombia', CL: 'Chile', PE: 'Perú', VE: 'Venezuela',
    UY: 'Uruguay', CU: 'Cuba', DO: 'República Dominicana', EC: 'Ecuador', GT: 'Guatemala', HN: 'Honduras', NI: 'Nicaragua', PA: 'Panamá',
    PY: 'Paraguay', PR: 'Puerto Rico', SV: 'El Salvador', BO: 'Bolivia', CR: 'Costa Rica', GQ: 'Guinea Ecuatorial', 419: 'Latinoamérica' };

  function puntua(v) {
    const n = (v.name || '') + ' ' + (v.voiceURI || '');
    const l = (v.lang || '').replace('_', '-');
    let s = /^es-ES/i.test(l) ? 30 : /^es-(US|MX|419)/i.test(l) ? 18 : 15;
    if (/natural|neural/i.test(n)) s += 60;            // Edge y Windows: Elvira, Álvaro…
    else if (/premium/i.test(n)) s += 55;              // Apple
    else if (/enhanced|mejorad|siri/i.test(n)) s += 45; // Apple
    else if (/google/i.test(n)) s += 40;               // Chrome
    else if (/online/i.test(n)) s += 35;
    else if (ANDROID) s += 35;                         // en Android las da el motor de Google
    if (/marisol/i.test(n)) s += /premium/i.test(n) ? 12 : 4;   // la que eligió Osman en su Mac: si está, va primero
    if (/microsoft/i.test(n) && !/online|natural/i.test(n)) s -= 10;
    if (/espeak|mbrola|festival|pico/i.test(n)) s -= 40;
    if (NOVEDAD.test(v.name || '')) s -= 35;
    if (v.localService === false) s += 3;
    return s;
  }
  function nombreDe(v) {
    let n = String(v.name || '')
      .replace(/^Microsoft\s+/i, '')
      .replace(/\s+Online\s*\((Natural|Neural)\)/i, '')
      .replace(/\s*\((Natural|Neural|Enhanced|Premium|mejorada|mejorado)\)/ig, '')
      .replace(/\s*-\s*(Spanish|Español|Espagnol).*$/i, '')
      .replace(/\s*\((español|spanish)[^)]*\)+/i, '')
      .trim();
    if (/^google/i.test(n)) n = 'Google';
    if (!n || /^(spanish|español|espanol|es[-_])/i.test(n)) n = ANDROID ? 'Voz de Android' : 'Voz del sistema';
    const todo = (v.name || '') + ' ' + (v.voiceURI || '');
    if (/premium/i.test(todo)) n += ' Premium';
    else if (/enhanced|mejorad/i.test(todo)) n += ' (mejorada)';
    return n;
  }
  function regionDe(v) {
    const m = /^es[-_]([A-Za-z0-9]+)/.exec(v.lang || '');
    return m ? (PAIS[m[1].toUpperCase()] || m[1].toUpperCase()) : 'Español';
  }
  function cargarVoces() {
    if (!OK) return;
    let lista = [];
    try { lista = S.getVoices() || []; } catch (e) { /* nada */ }
    const vistos = {};
    VOCES = lista.filter(v => /^es([-_]|$)/i.test(v.lang || ''))
      .map(v => ({ v, id: v.voiceURI || v.name, s: puntua(v) }))
      .filter(o => !vistos[o.id] && (vistos[o.id] = true))
      .sort((a, b) => b.s - a.s || String(a.v.name).localeCompare(String(b.v.name), 'es'));
    const veces = {};
    VOCES.forEach(o => {
      o.nombre = nombreDe(o.v); o.region = regionDe(o.v);
      o.nivel = o.s >= 70 ? 'natural' : o.s >= 45 ? 'buena' : 'basica';
      const k = o.nombre + '|' + o.region; veces[k] = (veces[k] || 0) + 1;
      if (veces[k] > 1) o.nombre += ' ' + veces[k];
    });
    pintarVoces();
  }
  function vozActual() {
    if (aj.voz) { const x = VOCES.find(o => o.id === aj.voz && !fallidas[o.id]); if (x) return x; }
    return VOCES.find(o => !fallidas[o.id]) || null;
  }
  function consejo() {
    const natural = VOCES.some(o => o.nivel === 'natural');
    let t;
    if (IOS) t = 'Para una voz más natural, descarga gratis una voz «mejorada» o «premium» en español: Ajustes › Accesibilidad › Contenido leído › Voces › Español. Después, vuelve a abrir esta página. Las voces de Siri no se pueden usar desde una página web.';
    else if (MAC) t = 'Para una voz más natural, descarga gratis una voz «mejorada» o «premium» en español: Ajustes del Sistema › Accesibilidad › Contenido leído › Voz del sistema › Gestionar voces. Después, vuelve a abrir esta página. Las voces de Siri no se pueden usar desde una página web.';
    else if (EDGE) t = 'Las voces que pone «más natural» suenan casi como una persona y necesitan conexión; sin conexión, uso las del dispositivo.';
    else if (WINDOWS) t = 'En Windows, la voz más natural está en Microsoft Edge: abre esta página con Edge y elige Elvira o Álvaro (necesitan conexión).';
    else if (ANDROID) t = 'Para una voz más natural: Ajustes › Accesibilidad › Síntesis de voz › Servicios de voz de Google › Instalar datos de voz › Español (España), y elige la de mejor calidad.';
    else t = 'Para una voz más natural, abre esta página con Microsoft Edge o con Google Chrome.';
    return (natural ? '' : 'Este dispositivo solo tiene voces básicas. ') + t;
  }

  // ------------------------------------------------------------------ el texto: segmentos y frases
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2022}\u{FE0F}\u{200D}\u{20E3}]/gu;
  function normaliza(t) {
    return String(t)
      .replace(/https?:\/\/(www\.)?([^/\s]+)\S*/gi, '$2')
      .replace(/\bp\.\s?ej\./gi, 'por ejemplo')
      .replace(/\bEE\.\s?UU\./g, 'Estados Unidos')
      .replace(/\b[nN]\.?\s?º\s?/g, 'número ')
      .replace(/\bpágs\.\s?(?=\d)/gi, 'páginas ').replace(/\bpág\.\s?(?=\d)/gi, 'página ')
      .replace(/\baprox\./gi, 'aproximadamente')
      .replace(/\bvs\.?\s/gi, 'frente a ')
      .replace(/\bs\.\s?(?=[XVI]+\b)/g, 'siglo ')
      .replace(/\ba\.\s?C\./g, 'antes de Cristo').replace(/\bd\.\s?C\./g, 'después de Cristo')
      .replace(/(\d)\s?[–—]\s?(\d)/g, '$1 a $2')
      .replace(/\s*[→⟶➜]\s*/g, ', ')
      .replace(/\s*[—–]\s*/g, ', ')
      .replace(/\s+·\s+|\s*·\s*(?=\S)/g, ', ')
      .replace(EMOJI, ' ')
      .replace(/\*\*?/g, '')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([¿¡(«])\s*,\s*/g, '$1')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .replace(/,(\s*,)+/g, ',')
      .replace(/([.!?…:;])\s*,/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const ABREV = /\b(Sr|Sra|Srta|Dr|Dra|Ud|Uds|art|núm|cap|fig|vol|ed|eds|coord|trad|cf|tel|avda|pp)\.(?=\s)/g;
  function corta(f) {
    const out = [];
    while (f.length > MAX) {
      const tramo = f.slice(0, MAX);
      let k = Math.max(tramo.lastIndexOf('; '), tramo.lastIndexOf(': '));
      if (k < MAX * 0.4) k = tramo.lastIndexOf(', ');
      if (k < MAX * 0.4) k = tramo.lastIndexOf(' ');
      if (k <= 0) k = MAX - 1;
      out.push(f.slice(0, k + 1).trim()); f = f.slice(k + 1).trim();
    }
    if (f) out.push(f);
    return out;
  }
  function frases(t) {
    const p = t.replace(ABREV, '$1․').replace(/\b([A-ZÁÉÍÓÚÑ])\.(?=\s[A-ZÁÉÍÓÚÑ])/g, '$1․')
      .replace(/([.!?…]+["»”’)]*)\s+(?=["«“¿¡(\[]?[A-ZÁÉÍÓÚÜÑ0-9])/g, '$1\u0001')
      .split('\u0001');
    const out = [];
    p.forEach(x => { x = x.replace(/․/g, '.').trim(); if (/[\p{L}\p{N}]/u.test(x)) corta(x).forEach(y => out.push(y)); });
    return out;
  }
  const TITULO = /^(H[1-6]|SUMMARY|CAPTION|LEGEND|DT|TH)$/;
  function tipoDe(el, t) {
    if (el && TITULO.test(el.tagName)) return 'titulo';
    if (el && el.tagName === 'LI') return 'item';
    if (t.split(' ').length <= 8 && !/[.!?…:;,»"”)]$/.test(t)) return 'titulo';
    return 'parrafo';
  }
  function excluido(el, op) {
    return el.matches(BASE) || (!!cfg.excluir && el.matches(cfg.excluir)) || (!!op.excluir && el.matches(op.excluir));
  }
  function oculto(el, op) {
    if (op.leerOculto && el.closest(op.leerOculto)) return false;
    if (el.tagName === 'BR') return false;
    const det = el.closest('details:not([open])');
    if (det) return true;   // lo plegado no se lee, ni su título
    if (typeof el.checkVisibility === 'function') return !el.checkVisibility();
    return el.getClientRects().length === 0;
  }
  function enLinea(el) {
    const ds = w.getComputedStyle(el).display;
    return ds.indexOf('inline') === 0 || ds === 'contents' || ds.indexOf('ruby') === 0;
  }
  function textoLinea(n, op) {
    let t = '';
    for (let c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) t += c.nodeValue;
      else if (c.nodeType === 1 && !excluido(c, op) && !oculto(c, op)) t += c.tagName === 'BR' ? ' ' : textoLinea(c, op);
    }
    return t;
  }
  function recorre(el, op, out) {
    let buf = '';
    const vacia = () => { const t = buf.replace(/\s+/g, ' ').trim(); buf = ''; if (t) out.push({ el, texto: t }); };
    for (let c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { buf += c.nodeValue; continue; }
      if (c.nodeType !== 1 || excluido(c, op) || oculto(c, op)) continue;
      if (c.tagName === 'BR') { buf += ' '; continue; }
      if (enLinea(c)) { buf += textoLinea(c, op); continue; }
      vacia(); recorre(c, op, out);
    }
    vacia();
  }
  // fuente: un nodo, una lista de nodos, un texto, una lista de textos o una función que devuelva cualquiera de ellos
  function segmentos(fuente, op) {
    op = op || {};
    if (typeof fuente === 'function') fuente = fuente();
    if (fuente == null) return [];
    if (typeof fuente === 'string' || fuente.nodeType) fuente = [fuente];
    const crudos = [];
    Array.prototype.forEach.call(fuente, x => {
      if (!x) return;
      if (typeof x === 'string') { x.split(/\n+/).forEach(t => { if (t.trim()) crudos.push({ el: null, texto: t.trim() }); }); return; }
      if (x.nodeType === 1 && !excluido(x, op) && !oculto(x, op)) recorre(x, op, crudos);
    });
    const out = [];
    crudos.forEach(s => {
      const t = normaliza(s.texto);
      if (!/[\p{L}\p{N}]/u.test(t)) return;
      if (s.el && out.some(o => o.el === s.el && o.limpio === t)) return;   // el mismo nodo, pedido dos veces
      const fr = frases(t);
      if (fr.length) out.push({ el: s.el, texto: s.texto, limpio: t, tipo: tipoDe(s.el, t), frases: fr });
    });
    return out;
  }

  // ------------------------------------------------------------------ el reproductor
  const ICO = {
    ant: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.2v14H6zM19.5 5.3v13.4L9.4 12z"/></svg>',
    sig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 5H18v14h-2.2zM4.5 5.3v13.4L14.6 12z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>',
    seguir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
    parar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="5.5" width="13" height="13" rx="2"/></svg>',
    voz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2zm0 2.1c-3.3 0-7 1.7-7 4.2V21h14v-2.5c0-2.5-3.7-4.2-7-4.2zM17.7 4.6l-1.4 1.5a5.6 5.6 0 0 1 0 7.2l1.4 1.5a7.7 7.7 0 0 0 0-10.2zm2.8-2.9-1.4 1.5a9.7 9.7 0 0 1 0 13l1.4 1.5a11.8 11.8 0 0 0 0-16z"/></svg>'
  };
  const E = { segs: [], i: 0, f: 0, gen: 0, hecho: 0, estado: 'parado', t: null, wd: null, op: {}, titulo: '', empezo: false, reintentos: 0, marcado: null, tocado: 0 };
  let UI = null;

  function crearUI() {
    if (UI) return UI;
    const r = d.createElement('div');
    r.className = 'lector';
    r.hidden = true;
    r.setAttribute('role', 'region');
    r.setAttribute('aria-label', 'Reproductor de Escuchar');
    r.innerHTML =
      '<div class="lector-caja">' +
        '<div class="lector-cab"><span class="lector-onda" aria-hidden="true"><i></i><i></i><i></i></span><span class="lector-tit"></span><span class="lector-pos"></span></div>' +
        '<input class="lector-barra" type="range" min="1" max="1" step="1" value="1" aria-label="Ir a otro párrafo">' +
        '<div class="lector-fila">' +
          '<div class="lector-ctrl">' +
            '<button type="button" data-a="ant" aria-label="Párrafo anterior">' + ICO.ant + '<span>Anterior</span></button>' +
            '<button type="button" data-a="pp" class="lector-pp"></button>' +
            '<button type="button" data-a="sig" aria-label="Párrafo siguiente">' + ICO.sig + '<span>Siguiente</span></button>' +
            '<button type="button" data-a="parar" aria-label="Parar y cerrar">' + ICO.parar + '<span>Parar</span></button>' +
          '</div>' +
          '<div class="lector-aj">' +
            '<label class="lector-vel"><span>Velocidad</span><select aria-label="Velocidad de lectura"></select></label>' +
            '<button type="button" data-a="voces" class="lector-vozb" aria-expanded="false">' + ICO.voz + '<span class="lector-voz-n">Voz</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="lector-voces" hidden>' +
          '<label><span>Elige la voz</span><select class="lector-voz"></select></label>' +
          '<div class="lector-voces-pie"><button type="button" data-a="probar">Probar esta voz</button></div>' +
          '<p class="lector-nota"></p>' +
        '</div>' +
        '<p class="lector-aviso" hidden></p>' +
      '</div>';
    const vel = r.querySelector('.lector-vel select');
    VELOCIDADES.forEach(x => { const o = d.createElement('option'); o.value = String(x[0]); o.textContent = x[1]; vel.appendChild(o); });
    vel.addEventListener('change', () => { aj.vel = +vel.value || 1; guardarAjustes(); if (E.estado === 'leyendo') decir(); });
    r.querySelector('.lector-voz').addEventListener('change', ev => { aj.voz = ev.target.value; guardarAjustes(); pintarEstado(); if (E.estado === 'leyendo') decir(); else probar(); });
    const barra = r.querySelector('.lector-barra');
    barra.addEventListener('input', () => { pintarPos(+barra.value - 1); });
    barra.addEventListener('change', () => { ir(+barra.value - 1); });
    r.addEventListener('click', ev => {
      const b = ev.target.closest('button[data-a]'); if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'ant') ir(E.i - 1);
      else if (a === 'sig') ir(E.i + 1);
      else if (a === 'pp') { if (E.estado === 'leyendo') pausar(); else seguir(); }
      else if (a === 'parar') parar();
      else if (a === 'probar') probar();
      else if (a === 'voces') abrirVoces(b.getAttribute('aria-expanded') !== 'true');
    });
    r.addEventListener('keydown', ev => { if (ev.key === 'Escape') { ev.stopPropagation(); parar(); } });
    d.body.appendChild(r);
    UI = r;
    if (w.ResizeObserver) new w.ResizeObserver(medir).observe(r.querySelector('.lector-caja'));
    pintarVoces();
    return r;
  }
  function abrirVoces(si) {
    if (!UI) return;
    UI.querySelector('.lector-voces').hidden = !si;
    UI.querySelector('[data-a="voces"]').setAttribute('aria-expanded', String(si));
    if (si) UI.querySelector('.lector-nota').textContent = consejo();
    medir();
  }
  function pintarVoces() {
    if (!UI) return;
    const sel = UI.querySelector('.lector-voz');
    sel.innerHTML = '';
    const opt = (v, t) => { const o = d.createElement('option'); o.value = v; o.textContent = t; return o; };
    const mejor = VOCES[0];
    sel.appendChild(opt('', mejor ? 'Automática: la mejor (' + mejor.nombre + ')' : 'La del dispositivo'));
    const grupo = (t, lista) => {
      if (!lista.length) return;
      const g = d.createElement('optgroup'); g.label = t;
      lista.forEach(o => g.appendChild(opt(o.id, o.nombre + ' · ' + o.region + (o.nivel === 'natural' ? ' · más natural' : ''))));
      sel.appendChild(g);
    };
    grupo('Las más naturales', VOCES.filter(o => o.nivel === 'natural'));
    grupo('Otras voces del dispositivo', VOCES.filter(o => o.nivel !== 'natural'));
    sel.value = VOCES.some(o => o.id === aj.voz) ? aj.voz : '';
    pintarEstado();
  }
  function medir() {
    if (!UI) return;
    const h = UI.hidden ? 0 : Math.ceil(UI.getBoundingClientRect().height);
    d.documentElement.style.setProperty('--lector-alto', h + 'px');
  }
  function mostrar() {
    crearUI();
    UI.hidden = false;
    d.documentElement.classList.add('lector-abierto');
    medir();
  }
  function ocultar() {
    if (!UI) return;
    UI.hidden = true;
    abrirVoces(false);
    d.documentElement.classList.remove('lector-abierto');
    d.documentElement.style.setProperty('--lector-alto', '0px');
  }
  function pintarPos(k) {
    if (!UI) return;
    const n = E.segs.length;
    UI.querySelector('.lector-pos').textContent = n ? 'Párrafo ' + Math.min(k + 1, n) + ' de ' + n : '';
  }
  function pintarEstado() {
    if (!UI || UI.hidden) return;
    const n = E.segs.length, leyendo = E.estado === 'leyendo';
    UI.classList.toggle('en-pausa', !leyendo);
    UI.querySelector('.lector-tit').innerHTML = (leyendo ? 'Escuchando' : 'En pausa') + ': <b>' + esc(E.titulo) + '</b>';
    pintarPos(E.i);
    const barra = UI.querySelector('.lector-barra');
    barra.max = String(Math.max(1, n)); barra.value = String(Math.min(E.i + 1, Math.max(1, n)));
    barra.disabled = n < 2;
    const pp = UI.querySelector('[data-a="pp"]');
    pp.innerHTML = leyendo ? ICO.pausa + '<span>Pausa</span>' : ICO.seguir + '<span>Seguir</span>';
    pp.setAttribute('aria-label', leyendo ? 'Pausa' : 'Seguir escuchando');
    UI.querySelector('[data-a="ant"]').disabled = E.i <= 0;
    UI.querySelector('[data-a="sig"]').disabled = E.i >= n - 1;
    UI.querySelector('.lector-vel select').value = String(aj.vel);
    const o = vozActual();
    UI.querySelector('.lector-voz-n').textContent = o ? 'Voz: ' + o.nombre : 'Voz';
    const aviso = UI.querySelector('.lector-aviso');
    if (!aviso.dataset.fijo) {
      const basica = !VOCES.length || VOCES[0].nivel !== 'natural';
      aviso.hidden = !basica;
      aviso.innerHTML = basica ? '¿Suena robótica? <button type="button" data-a="voces">Cómo tener una voz más natural</button>' : '';
    }
  }
  function nota(t) {
    if (!UI) return;
    const a = UI.querySelector('.lector-aviso');
    a.hidden = false; a.textContent = t; a.dataset.fijo = '1';
    clearTimeout(nota.t);
    nota.t = setTimeout(() => { delete a.dataset.fijo; pintarEstado(); medir(); }, 7000);
    medir();
  }

  // ------------------------------------------------------------------ marcar lo que suena
  function desmarcar() { if (E.marcado) { E.marcado.classList.remove('lector-actual'); E.marcado = null; } }
  function marcar(s) {
    const el = s && s.el;
    if (E.marcado !== el) {
      desmarcar();
      if (el && el.isConnected) {
        if (E.op.alLlegar) { try { E.op.alLlegar(el); } catch (e) { /* nada */ } }
        el.classList.add('lector-actual'); E.marcado = el;
      }
    }
    if (el && el.isConnected && Date.now() - E.tocado > 4000) {
      const r = el.getBoundingClientRect();
      const abajo = w.innerHeight - (UI && !UI.hidden ? UI.getBoundingClientRect().height + 12 : 0);
      if (r.height && (r.top < 64 || r.bottom > abajo)) {
        try { el.scrollIntoView({ block: r.height > abajo * 0.6 ? 'start' : 'center', behavior: REDUCIR ? 'auto' : 'smooth' }); } catch (e) { el.scrollIntoView(); }
      }
    }
  }

  // ------------------------------------------------------------------ hablar
  function limpiarTimers() { clearTimeout(E.t); clearInterval(E.wd); E.t = null; E.wd = null; }
  function cancelar() { if (OK) { try { if (S.speaking || S.pending) S.cancel(); } catch (e) { /* nada */ } } }
  function enunciado(texto, o, rate) {
    const u = new w.SpeechSynthesisUtterance(texto);
    if (o) { u.voice = o.v; u.lang = o.v.lang; } else u.lang = 'es-ES';
    u.rate = Math.max(0.5, Math.min(2, rate));
    u.pitch = 1; u.volume = 1;
    return u;
  }
  function decir() {
    limpiarTimers();
    const g = ++E.gen;
    const s = E.segs[E.i];
    if (!s) { parar(); return; }
    if (E.f >= s.frases.length) E.f = 0;
    marcar(s);
    const texto = s.frases[E.f];
    const o = vozActual();
    const u = enunciado(texto, o, aj.vel * (s.tipo === 'titulo' ? 0.95 : 1));
    E.empezo = false;
    u.onstart = () => { if (g === E.gen) { E.empezo = true; E.reintentos = 0; } };
    u.onend = () => { if (g === E.gen) despues(g); };
    u.onerror = ev => {
      if (g !== E.gen) return;
      const er = ev && ev.error;
      if (er === 'interrupted' || er === 'canceled') return;
      fallo(er || 'error', o, g);
    };
    cancelar();
    try { if (S.paused) S.resume(); S.speak(u); } catch (e) { fallo('speak', o, g); return; }
    vigilar(g, texto, o);
    pintarEstado();
  }
  // por si el navegador no avisa de que ha empezado o acabado (pasa en algunos móviles)
  function vigilar(g, texto, o) {
    const arranque = o && o.v.localService === false ? 6000 : 2500;
    const maximo = 4000 + texto.length * 130 / aj.vel;
    const t0 = Date.now();
    let callado = 0;
    E.wd = setInterval(() => {
      if (g !== E.gen || E.estado !== 'leyendo') { clearInterval(E.wd); return; }
      const habla = S.speaking || S.pending;
      const dt = Date.now() - t0;
      if (!E.empezo && !habla && dt > arranque) {
        clearInterval(E.wd);
        if (E.reintentos < 1) { E.reintentos++; decir(); } else { E.reintentos = 0; fallo('no-arranca', o, g); }
        return;
      }
      callado = habla ? 0 : callado + 1;
      if ((E.empezo && callado >= 3) || dt > maximo) { clearInterval(E.wd); if (habla) cancelar(); despues(g); }
    }, 400);
  }
  function despues(g) {
    if (g !== E.gen || E.hecho === g) return;
    E.hecho = g;
    limpiarTimers();
    const s = E.segs[E.i];
    if (!s) { parar(); return; }
    // la posición avanza al acabar la pausa: si en la pausa se pulsa «Anterior», se cuenta desde lo que acaba de sonar
    let i = E.i, f = E.f, pausa;
    if (f < s.frases.length - 1) { f++; pausa = PAUSA.frase; }
    else { pausa = PAUSA[s.tipo] || PAUSA.parrafo; i++; f = 0; }
    if (i >= E.segs.length) { E.t = setTimeout(() => { if (g === E.gen) parar(); }, 250); return; }
    E.t = setTimeout(() => { if (E.estado === 'leyendo' && g === E.gen) { E.i = i; E.f = f; decir(); } }, pausa / aj.vel);
  }
  function fallo(er, o, g) {
    limpiarTimers();
    if (er === 'not-allowed') { pausar(); nota('Pulsa «Seguir» para empezar a escuchar.'); return; }
    if (o && !fallidas[o.id]) {
      fallidas[o.id] = true;
      const otra = vozActual();
      if (otra && otra !== o) {
        nota('La voz «' + o.nombre + '» no responde' + (o.v.localService === false ? ' sin conexión' : '') + '. Sigo con «' + otra.nombre + '».');
        decir();
        return;
      }
    }
    if (g === E.gen) { pausar(); nota('No consigo usar la voz del dispositivo. Prueba con otra voz o con otro navegador.'); }
  }
  function pausar() {
    if (E.estado !== 'leyendo') return;
    E.estado = 'pausa'; E.gen++;
    limpiarTimers(); cancelar();
    pintarEstado();
  }
  function seguir() {
    if (E.estado !== 'pausa' || !E.segs.length) return;
    E.estado = 'leyendo';
    decir();
  }
  function ir(k) {
    if (!E.segs.length) return;
    E.i = Math.max(0, Math.min(E.segs.length - 1, k)); E.f = 0;
    E.estado = 'leyendo';
    E.tocado = 0;
    decir();
  }
  function probar() {
    if (!OK) return;
    if (E.estado === 'leyendo') { decir(); return; }
    const o = vozActual();
    cancelar();
    try { S.speak(enunciado('Hola. Así suena ' + (o ? o.nombre : 'esta voz') + '. Si te gusta, déjala elegida.', o, aj.vel)); } catch (e) { /* nada */ }
  }
  function parar() {
    const op = E.op, habia = E.estado !== 'parado';
    E.estado = 'parado'; E.gen++;
    limpiarTimers(); cancelar();
    desmarcar(); ocultar();
    E.segs = []; E.op = {};
    if (habia && op.alCambiar) { try { op.alCambiar(false); } catch (e) { /* nada */ } }
  }
  // empieza a leer; devuelve false si no hay nada que leer
  function leer(fuente, op) {
    if (!OK) return false;
    op = op || {};
    const segs = segmentos(fuente, op);
    parar();
    if (!segs.length) return false;
    E.segs = segs; E.op = op;
    E.i = Math.max(0, Math.min(op.desde || 0, segs.length - 1)); E.f = 0;
    const tit = segs.slice(0, 3).find(x => x.tipo === 'titulo');
    const uno = segs[0].limpio;
    E.titulo = op.titulo || (tit ? tit.limpio : uno.length > 60 ? uno.slice(0, uno.lastIndexOf(' ', 58)) + '…' : uno);
    E.estado = 'leyendo'; E.tocado = 0;
    mostrar();
    if (op.alCambiar) { try { op.alCambiar(true); } catch (e) { /* nada */ } }
    decir();
    return true;
  }

  // ------------------------------------------------------------------ los botones «Escuchar» de cada web
  function enlazar(b, fuente, op) {
    op = op || {};
    const etq = op.etiqueta || 'Escuchar';
    const pon = on => {
      b.setAttribute('aria-pressed', String(on));
      if (op.pintar) op.pintar(b, on);
      else b.innerHTML = on ? '<span aria-hidden="true">■</span> Parar' : '<span aria-hidden="true">🔊</span> ' + esc(etq);
    };
    pon(false);
    b.addEventListener('click', ev => {
      ev.preventDefault();
      if (b.getAttribute('aria-pressed') === 'true') { parar(); return; }
      const o = Object.assign({}, op, { alCambiar: on => { pon(on); if (op.alCambiar) op.alCambiar(on); } });
      leer(fuente, o);
    });
    return b;
  }
  function boton(fuente, op) {
    if (!OK) return null;
    op = op || {};
    const b = d.createElement('button');
    b.type = 'button';
    b.className = op.clase || 'btn small escuchar';
    if (op.ayuda) b.title = op.ayuda;
    return enlazar(b, fuente, op);
  }
  function configurar(c) {
    c = c || {};
    if (c.sitio) cfg.sitio = c.sitio;
    if (c.excluir) cfg.excluir = c.excluir;
    if (c.subir) {
      cfg.subir = c.subir;
      const st = d.createElement('style');
      st.textContent = 'html.lector-abierto :is(' + c.subir + ') { translate: 0 calc(-1 * var(--lector-alto, 0px)); transition: translate .2s; }';
      (d.head || d.documentElement).appendChild(st);
    }
    if (c.color) d.documentElement.style.setProperty('--lector-ac', c.color);
    cargarAjustes();
    pintarEstado();
  }

  if (OK) {
    try { S.cancel(); } catch (e) { /* lo que quedara de otra página */ }
    cargarAjustes();
    cargarVoces();
    if (S.addEventListener) S.addEventListener('voiceschanged', cargarVoces); else S.onvoiceschanged = cargarVoces;
    w.addEventListener('pagehide', () => { try { S.cancel(); } catch (e) { /* nada */ } });
    const toca = () => { E.tocado = Date.now(); };
    w.addEventListener('wheel', toca, { passive: true });
    w.addEventListener('touchmove', toca, { passive: true });
  }

  w.Lector = {
    version: '1.0', ok: OK,
    configurar, leer, parar, pausar, seguir, boton, enlazar, segmentos,
    activo: () => E.estado !== 'parado',
    voces: () => VOCES.map(o => ({ id: o.id, nombre: o.nombre, region: o.region, nivel: o.nivel })),
    ajustes: () => ({ voz: aj.voz, vel: aj.vel })
  };
})(window);
