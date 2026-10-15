/* Episodio en siete tiempos · motor común de las webs del proyecto (Método BrainBox 1.2, apartado 14.3).
   Sin dependencias y sin servidor: funciona dentro de un HTML de doble clic.
   Uso:
     const ep = Episodio.crear({ sitio: 'brainbox', nombre: 'BrainBox', episodios: [...] });
     ep.portada(el); ep.abrir(el, id[, { grupo: true }]); ep.vuelta(el, idMision); ep.lista(el); ep.cuaderno(el);
   Opcional, la pregunta de llegada (Método 1.2, apartado 3.4): con cfg.llegada, quien llega «con la cabeza a mil»
   recibe una versión corta del episodio (ep.corto: una pregunta y una acción pequeña).
   El formato de cada episodio está en LEEME.md. Todo se guarda solo en el dispositivo (localStorage), en la clave
   «sitio:episodios» (o cfg.clave), separada del cuaderno de la web. */
(function () {
  'use strict';

  // ------------------------------------------------------------------ el método, fijo
  const TIEMPOS = [
    { id: 'choque', nombre: 'Choque', verbo: 'Sentir', eje: 'Eje I · Ser', paso: 'Situar',
      imp: [['1.1', 'Significado épico', 'La palabra del día importa fuera de la pantalla'],
            ['7.1', 'Curiosidad', 'La frase llega sin explicación', 'Siempre se resuelve en el mismo episodio']] },
    { id: 'reflejo', nombre: 'Reflejo', verbo: 'Actuar', eje: 'Eje I · Ser', paso: 'Situar',
      imp: [['6.2', 'Impaciencia', 'Cinco segundos para decidir', 'Solo aquí, y nunca en temas con señal de riesgo'],
            ['8.2', 'Evitación', 'Se ve el error que se quiere evitar', 'Se señala el salto, nunca a la persona'],
            ['9.1', 'Sensación', 'Ritmo: reloj, sonido y vibración', 'Se puede apagar']] },
    { id: 'giro', nombre: 'Giro', verbo: 'Pensar', eje: 'Del eje I al II', paso: 'Comprender y elegir',
      imp: [['3.2', 'Retroalimentación', 'Te dice dónde saltaste', 'La respuesta no puntúa'],
            ['7.2', 'Impredecibilidad', 'Un hecho lleva la contraria', 'Siempre un hecho comprobado, con su fuente; nunca premios al azar']] },
    { id: 'peldano', nombre: 'Peldaño', verbo: 'Saber', eje: 'Eje II · Saber', paso: 'Comprender y elegir',
      imp: [['2.1', 'Desarrollo', 'El peldaño a la vista, con el antes y el después'],
            ['10.2', 'Completitud', 'Los siete tiempos marcados en la barra']] },
    { id: 'mision', nombre: 'Misión', verbo: 'Hacer', eje: 'Eje III · Hacer', paso: 'Preparar',
      imp: [['1.2', 'Vocación', 'Eliges tu misión entre dos'],
            ['2.2', 'Logro', 'La misión queda en tu cuaderno', 'Sin clasificación contra otros'],
            ['6.1', 'Escasez', 'Un episodio nuevo al día', 'No se compra ni se acumula; nada caduca']] },
    { id: 'historia', nombre: 'Tu historia', verbo: 'Creer y crear', eje: 'Eje IV · Creer / crear', paso: '',
      imp: [['3.1', 'Creatividad', 'Tu historia la escribes y la corriges tú'],
            ['5.2', 'Influencia social', 'Compartirla, si quieres', 'Nunca obligatorio; nada se publica solo'],
            ['10.1', 'Armonía y estética', 'Una pantalla limpia por tiempo']] },
    { id: 'vuelta', nombre: 'Vuelta', verbo: 'Volver', eje: 'Ejes I a IV', paso: 'Revisar y decidir',
      imp: [['4.1', 'Propiedad', 'El cuaderno es tuyo', 'Se guarda solo en tu dispositivo'],
            ['4.2', 'Posesión', 'Colección de palabras ganadas, desde el peldaño Datos'],
            ['5.1', 'Relación social', 'En grupo se vota y se compara sin nombres', 'Nada personal a la vista del grupo'],
            ['8.1', 'Pérdida', 'La racha de vueltas', 'La racha se pausa, no se pierde'],
            ['9.2', 'Placer', 'Sube el peldaño y se abre el siguiente episodio']] }
  ];
  const ESCALERA = [
    ['Ruido', 'lo has oído'], ['Datos', 'sabes de dónde viene'], ['Información', 'sabes para qué se usa'],
    ['Conocimiento', 'sabes explicarlo'], ['Entendimiento', 'sabes cuándo no vale']
  ];
  const PROC = {
    simulado: ['Simulado', 'Lo que hiciste en la pantalla'],
    declarado: ['Declarado', 'Lo que tú cuentas que pasó'],
    verificado: ['Verificado', 'Lo confirma otra persona o una prueba']
  };
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  // ------------------------------------------------------------------ utilidades
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const hoy = () => iso(new Date());
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function sumaDias(n) { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function fechaLarga(s) { const d = new Date(s + 'T12:00:00'); return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function h(tag, attrs, html) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) {
      if (k === 'on') { for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); }
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function btn(txt, cls, fn, extra) { return h('button', Object.assign({ type: 'button', class: cls || 'ep-btn', on: { click: fn } }, extra || {}), txt); }

  function almacen(clave, defecto) {
    return {
      leer() { try { const v = JSON.parse(localStorage.getItem(clave)); return v && typeof v === 'object' ? Object.assign(JSON.parse(JSON.stringify(defecto)), v) : JSON.parse(JSON.stringify(defecto)); } catch (e) { return JSON.parse(JSON.stringify(defecto)); } },
      guardar(v) { try { localStorage.setItem(clave, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: el episodio funciona igual */ } },
      borrar() { try { localStorage.removeItem(clave); } catch (e) { } }
    };
  }

  // ------------------------------------------------------------------ voz, sonido y vibración
  const VOZ = {
    ok: typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
    hablando: false,
    leer(texto, alAcabar) {
      if (!this.ok) return;
      this.parar();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-ES'; u.rate = 0.98;
      const voces = speechSynthesis.getVoices().filter(v => /^es(-|_)ES/i.test(v.lang));
      if (voces.length) u.voice = voces[0];
      u.onend = u.onerror = () => { this.hablando = false; if (alAcabar) alAcabar(); };
      this.hablando = true;
      speechSynthesis.speak(u);
    },
    parar() { if (window.Lector && window.Lector.ok) { window.Lector.parar(); } else if (this.ok) { try { speechSynthesis.cancel(); } catch (e) { } } this.hablando = false; }
  };
  let audioCtx = null;
  function pitido(prefs, tipo) {
    if (!prefs.sonido) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = tipo === 'fin' ? 392 : tipo === 'bien' ? 660 : 523;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.27);
    } catch (e) { }
    if (navigator.vibrate) { try { navigator.vibrate(tipo === 'fin' ? [60, 40, 60] : 30); } catch (e) { } }
  }

  // ------------------------------------------------------------------ el motor
  function crear(cfg) {
    const C = Object.assign({ nombre: 'Episodio', porDentro: false, grupo: true, demo: false, unoAlDia: true, minutos: 7 }, cfg);
    const EP = C.episodios || [];
    const POR_ID = {}; EP.forEach(e => { POR_ID[e.id] = e; });
    // El cuaderno del episodio va en su propia clave (sitio:episodios), aparte del cuaderno de la web.
    // Antes iba en sitio:cuaderno, que en PostLab y NeuroLab es también la clave del cuaderno de la web:
    // si ahí hay datos del episodio y la clave nueva está vacía, se copian una vez (sin borrar nada).
    const CAMPOS = ['palabras', 'misiones', 'retornos', 'historias', 'racha', 'nuevos'];
    const CLAVE = C.clave || (C.sitio + ':episodios');
    try {
      const viejo = JSON.parse(localStorage.getItem(C.sitio + ':cuaderno'));
      if (CLAVE !== C.sitio + ':cuaderno' && localStorage.getItem(CLAVE) === null && viejo && typeof viejo === 'object' && viejo.palabras && typeof viejo.palabras === 'object') {
        const nuevo = { v: 1 };
        CAMPOS.forEach(k => { if (viejo[k] !== undefined) nuevo[k] = viejo[k]; });
        localStorage.setItem(CLAVE, JSON.stringify(nuevo));
      }
    } catch (e) { /* sin almacenamiento: el episodio funciona igual */ }
    const datos = almacen(CLAVE, { v: 1, palabras: {}, misiones: [], retornos: [], historias: [], racha: 0, nuevos: {} });
    const ajustes = almacen(C.sitio + ':ajustes-episodio', { sonido: true, reloj: true, dentro: !!C.porDentroInicial, grupo: false, demo: !!C.demoInicial });
    let prefs = ajustes.leer();
    const guardarPrefs = () => ajustes.guardar(prefs);

    // ---------- estado del cuaderno
    function st() { return datos.leer(); }
    function nivel(id) { const p = st().palabras[id]; return p ? p.nivel : 0; }
    function empezados() { return Object.keys(st().palabras); }
    function deHoy() {
      const s = st(), d = hoy();
      if (s.nuevos[d] && POR_ID[s.nuevos[d]] && !(prefs.demo && s.palabras[s.nuevos[d]])) return POR_ID[s.nuevos[d]];
      const nuevo = EP.find(e => !s.palabras[e.id]);
      if (nuevo) return nuevo;
      return EP.slice().sort((a, b) => nivel(a.id) - nivel(b.id))[0];
    }
    function disponible(id) {
      if (prefs.demo || !C.unoAlDia) return true;
      const s = st();
      if (s.palabras[id]) return true;
      const d = hoy();
      if (s.nuevos[d]) return s.nuevos[d] === id;
      return deHoy() && deHoy().id === id;
    }
    function pendientes() {
      return st().misiones.filter(m => m.estado === 'pendiente').sort((a, b) => a.vuelta < b.vuelta ? -1 : 1);
    }
    function vencidas() { const d = hoy(); return pendientes().filter(m => m.vuelta <= d); }
    function rachaPausada() {
      const lim = sumaDias(-2);
      return pendientes().some(m => m.vuelta < lim);
    }

    // ---------- piezas comunes
    function cabecera(R) {
      const top = h('div', { class: 'ep-top' });
      top.appendChild(h('div', { class: 'ep-top-l' }, esc(C.nombre) + (R.grupo ? ' · modo grupo' : ' · episodio')));
      top.appendChild(h('div', { class: 'ep-top-r' }, esc(R.ep.palabra)));
      const barra = h('ol', { class: 'ep-barra', 'aria-label': 'Los siete tiempos' });
      TIEMPOS.forEach((t, i) => {
        const li = h('li', { class: i < R.i ? 'hecho' : i === R.i ? 'ahora' : '', title: (i + 1) + ' · ' + t.nombre },
          '<span class="ep-sr">' + (i + 1) + ' · ' + esc(t.nombre) + (i === R.i ? ' (ahora)' : '') + '</span>');
        barra.appendChild(li);
      });
      const wrap = h('div', { class: 'ep-cab' });
      wrap.appendChild(top); wrap.appendChild(barra);
      return wrap;
    }
    function rotulo(i, extra) {
      const t = TIEMPOS[i];
      return h('div', { class: 'ep-rotulo' }, '<span class="ep-n">' + (i + 1) + '</span><span>' + esc(t.nombre) + (extra ? ' · ' + esc(extra) : '') + '</span>');
    }
    function herramientas(R, cont) {
      const bar = h('div', { class: 'ep-herr' });
      if (window.Lector && window.Lector.ok) {
        // Lector 1.0: lee la pantalla por párrafos, con pausas, la voz elegida y el reproductor
        const b = window.Lector.boton(() => cont.querySelectorAll('.ep-leer'), { clase: 'ep-mini', etiqueta: 'Escuchar', titulo: R.ep && R.ep.palabra ? R.ep.palabra : 'Esta pantalla' });
        b.setAttribute('aria-label', 'Escuchar esta pantalla');
        bar.appendChild(b);
      } else if (VOZ.ok) {
        const b = btn('<span aria-hidden="true">🔊</span> Escuchar', 'ep-mini', () => {
          if (VOZ.hablando) { VOZ.parar(); b.innerHTML = '<span aria-hidden="true">🔊</span> Escuchar'; return; }
          const txt = Array.from(cont.querySelectorAll('.ep-leer')).map(n => n.innerText).join('. ');
          b.innerHTML = '<span aria-hidden="true">■</span> Parar';
          VOZ.leer(txt, () => { b.innerHTML = '<span aria-hidden="true">🔊</span> Escuchar'; });
        }, { 'aria-label': 'Escuchar esta pantalla' });
        bar.appendChild(b);
      }
      const aj = h('details', { class: 'ep-ajustes' });
      aj.appendChild(h('summary', { class: 'ep-mini' }, '<span aria-hidden="true">⚙</span> Ajustes'));
      const box = h('div', { class: 'ep-ajustes-box' });
      const opt = (clave, txt, cuando) => {
        const l = h('label', {});
        const c = h('input', { type: 'checkbox' }); c.checked = !!prefs[clave];
        c.addEventListener('change', () => { prefs[clave] = c.checked; guardarPrefs(); if (cuando) cuando(); });
        l.appendChild(c); l.appendChild(document.createTextNode(' ' + txt)); box.appendChild(l);
      };
      opt('reloj', 'Reloj de cinco segundos en el Reflejo');
      opt('sonido', 'Sonido y vibración');
      if (C.grupo) opt('grupo', 'Modo grupo (para proyectar en clase o en un taller)', () => { R.grupo = prefs.grupo; R.votos = {}; pintar(R); });
      if (C.porDentro) opt('dentro', 'Ver por dentro: eje, paso e impulsores de cada tiempo', () => pintar(R));
      if (C.demo) opt('demo', 'Modo demostración: todos los episodios abiertos y la vuelta, en el momento');
      aj.appendChild(box);
      bar.appendChild(aj);
      return bar;
    }
    function porDentro(i) {
      const t = TIEMPOS[i];
      const d = h('aside', { class: 'ep-dentro', 'aria-label': 'Por dentro' });
      let s = '<div class="ep-dentro-t">Por dentro · ' + esc(t.verbo) + ' · ' + esc(t.eje) + (t.paso ? ' · paso del recorrido: ' + esc(t.paso) : '') + '</div><ul>';
      t.imp.forEach(m => {
        s += '<li><b>' + m[0] + ' ' + esc(m[1]) + (m[3] ? ' ⚑' : '') + '.</b> ' + esc(m[2]) + (m[3] ? '. <span class="ep-freno">Freno: ' + esc(m[3]) + '</span>' : '') + '</li>';
      });
      d.innerHTML = s + '</ul>';
      return d;
    }
    function pie(R, cont, sigTxt, sigFn, opciones) {
      const p = h('div', { class: 'ep-pie' });
      if (R.i > 0 && !(opciones && opciones.sinAtras)) p.appendChild(btn('Atrás', 'ep-btn ep-sec', () => { R.i--; pintar(R); }));
      if (sigTxt) { const b = btn(sigTxt, 'ep-btn ep-pri', sigFn); if (opciones && opciones.desactivado) b.disabled = true; p.appendChild(b); R.sig = b; }
      cont.appendChild(p);
    }
    function saberMas(texto, titulo) {
      if (!texto) return null;
      const d = h('details', { class: 'ep-mas' });
      d.appendChild(h('summary', {}, esc(titulo || 'Saber más')));
      d.appendChild(h('div', { class: 'ep-mas-c' }, fmt(texto)));
      return d;
    }
    function votos(R, clave, opciones, onCambio) {
      // modo grupo: cada toque suma un voto; nada personal
      R.votos[clave] = R.votos[clave] || {};
      const V = R.votos[clave];
      const caja = h('div', { class: 'ep-votos' });
      function render() {
        caja.innerHTML = '';
        const total = opciones.reduce((a, o) => a + (V[o.id] || 0), 0);
        opciones.forEach(o => {
          const n = V[o.id] || 0, pct = total ? Math.round(100 * n / total) : 0;
          const fila = h('div', { class: 'ep-voto' });
          fila.appendChild(btn((o.e ? '<span aria-hidden="true">' + o.e + '</span> ' : '') + esc(o.t), 'ep-op', () => { V[o.id] = n + 1; render(); if (onCambio) onCambio(); }));
          fila.appendChild(h('div', { class: 'ep-vbar', 'aria-hidden': 'true' }, '<i style="width:' + pct + '%"></i>'));
          fila.appendChild(h('span', { class: 'ep-vn' }, n + (n === 1 ? ' voto' : ' votos')));
          if (n) fila.appendChild(btn('−', 'ep-mini ep-menos', () => { V[o.id] = n - 1; render(); if (onCambio) onCambio(); }, { 'aria-label': 'Quitar un voto a ' + o.t }));
          caja.appendChild(fila);
        });
        caja.appendChild(h('p', { class: 'ep-nota' }, 'Toca una opción por cada mano levantada. Sin nombres: solo cuenta el grupo.'));
      }
      render();
      return caja;
    }
    const mayoria = (R, clave, opciones) => {
      const V = R.votos[clave] || {};
      let best = null; opciones.forEach(o => { if (!best || (V[o.id] || 0) > (V[best.id] || 0)) best = o; });
      return best && V[best.id] ? best : null;
    };

    // ---------- los siete tiempos
    const PINTA = {
      choque(R, c) {
        const E = R.ep.choque;
        c.appendChild(rotulo(0));
        c.appendChild(h('p', { class: 'ep-frase ep-leer' }, fmt(E.frase)));
        if (R.grupo) {
          c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, '¿Qué os provoca? A mano alzada.'));
          c.appendChild(votos(R, 'choque', E.opciones));
          pie(R, c, 'Seguir', () => { const m = mayoria(R, 'choque', E.opciones); R.resp.choque = m ? m.id : E.opciones[0].id; R.i = 1; pintar(R); });
          return;
        }
        c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, esc(E.pregunta || '¿Qué te provoca?')));
        const g = h('div', { class: 'ep-ops' });
        E.opciones.forEach(o => {
          g.appendChild(btn('<span aria-hidden="true">' + (o.e || '') + '</span> ' + esc(o.t), 'ep-op' + (R.resp.choque === o.id ? ' on' : ''), () => {
            R.resp.choque = o.id; pitido(prefs, 'toque'); setTimeout(() => { R.i = 1; pintar(R); }, 220);
            g.querySelectorAll('.ep-op').forEach(x => x.classList.toggle('on', x.textContent.indexOf(o.t) >= 0));
          }));
        });
        c.appendChild(g);
        c.appendChild(h('p', { class: 'ep-nota' }, 'Un toque. Sin pensarlo mucho: aquí no hay respuesta buena.'));
      },
      reflejo(R, c) {
        const E = R.ep.reflejo;
        const conReloj = prefs.reloj && !R.ep.riesgo;
        const seg = E.segundos || 5;
        c.appendChild(rotulo(1, conReloj ? seg + ' segundos' : 'sin reloj'));
        c.appendChild(h('p', { class: 'ep-situacion ep-leer' }, fmt(E.situacion)));
        const barra = h('div', { class: 'ep-reloj', 'aria-hidden': 'true' }, '<i></i>');
        const g = h('div', { class: 'ep-ops ep-ops-dos' });
        let t0 = 0, timer = null, hecho = false;
        function decidir(id) {
          if (hecho) return; hecho = true;
          if (timer) clearTimeout(timer);
          R.resp.reflejo = id; R.resp.ms = Date.now() - t0;
          pitido(prefs, id ? 'toque' : 'fin');
          const s = datos.leer();
          const op = E.opciones.find(o => o.id === id);
          s.retornos.push({ ep: R.ep.id, palabra: R.ep.palabra, fecha: hoy(), proc: 'simulado',
            texto: op ? 'En la pantalla elegiste «' + op.t + '»' + (conReloj ? ' en ' + (R.resp.ms / 1000).toFixed(1).replace('.', ',') + ' segundos' : '') + '.' : 'En la pantalla se acabó el tiempo sin decidir.' });
          datos.guardar(s);
          setTimeout(() => { R.i = 2; pintar(R); }, 260);
        }
        if (R.grupo) {
          c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, 'Primero decidid cada uno, en silencio. Después, a mano alzada.'));
          const arr = btn(conReloj ? '▶ Empezar los ' + seg + ' segundos' : '▶ Decidid ya', 'ep-btn ep-pri', () => {
            arr.disabled = true;
            if (conReloj) { barra.classList.add('va'); barra.firstChild.style.animationDuration = seg + 's'; setTimeout(() => { pitido(prefs, 'fin'); barra.classList.add('fin'); }, seg * 1000); }
          });
          c.appendChild(arr); if (conReloj) c.appendChild(barra);
          c.appendChild(votos(R, 'reflejo', E.opciones));
          pie(R, c, 'Seguir', () => { const m = mayoria(R, 'reflejo', E.opciones); R.resp.reflejo = m ? m.id : null; R.resp.ms = null; R.i = 2; pintar(R); });
          return;
        }
        E.opciones.forEach(o => g.appendChild(btn(esc(o.t), 'ep-op ep-op-grande', () => decidir(o.id))));
        if (conReloj) c.appendChild(barra);
        c.appendChild(g);
        if (!conReloj) c.appendChild(h('p', { class: 'ep-nota' }, R.ep.riesgo ? 'Este tema no lleva reloj: decide con calma.' : 'Sin reloj. Decide lo primero que te salga.'));
        t0 = Date.now();
        if (conReloj) {
          requestAnimationFrame(() => { barra.classList.add('va'); barra.firstChild.style.animationDuration = seg + 's'; });
          timer = setTimeout(() => decidir(null), seg * 1000);
          R.limpia = () => { if (timer) clearTimeout(timer); hecho = true; };
        }
      },
      giro(R, c) {
        const E = R.ep.giro, op = R.ep.reflejo.opciones.find(o => o.id === R.resp.reflejo);
        c.appendChild(rotulo(2));
        let titulo;
        if (R.grupo) titulo = op ? 'El grupo eligió «' + op.t + '».' : 'El grupo no llegó a decidir.';
        else if (!op) titulo = 'Se acabaron los segundos sin decidir. También es una respuesta.';
        else if (R.resp.ms && prefs.reloj && !R.ep.riesgo) titulo = 'Elegiste «' + op.t + '» en ' + (R.resp.ms / 1000).toFixed(1).replace('.', ',') + ' segundos.';
        else titulo = 'Elegiste «' + op.t + '».';
        c.appendChild(h('p', { class: 'ep-giro-t ep-leer' }, esc(titulo)));
        c.appendChild(h('div', { class: 'ep-hecho ep-leer' }, fmt(E.hecho) + (E.fuente ? '<span class="ep-fuente">' + (E.url ? '<a href="' + esc(E.url) + '" target="_blank" rel="noopener">' + esc(E.fuente) + '</a>' : esc(E.fuente)) + '</span>' : '')));
        c.appendChild(h('div', { class: 'ep-busca ep-leer' }, '<b>Esto es lo que buscábamos.</b> ' + fmt(E.busca)));
        if (E.saltos && E.saltos.length) {
          c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, R.grupo ? '¿Dónde saltamos?' : '¿Dónde saltaste?'));
          const g = h('div', { class: 'ep-saltos' });
          E.saltos.forEach(s => {
            const d = h('details', { class: 'ep-salto' });
            d.appendChild(h('summary', {}, esc(s.t)));
            d.appendChild(h('p', {}, fmt(s.p)));
            g.appendChild(d);
          });
          c.appendChild(g);
          c.appendChild(h('p', { class: 'ep-nota' }, 'La respuesta no puntúa: abre el porqué de cada salto.'));
        }
        const m = saberMas(R.ep.saber_mas); if (m) c.appendChild(m);
        pie(R, c, 'Seguir', () => { R.i = 3; pintar(R); }, { sinAtras: true });
      },
      peldano(R, c) {
        const E = R.ep.peldano, P = E.preguntas || [];
        R.pq = R.pq || { k: 0, ok: 0, resp: [] };
        const desde = nivel(R.ep.id);
        c.appendChild(rotulo(3, 'estás aquí'));
        const esc5 = h('ol', { class: 'ep-escalera', 'aria-label': 'La escalera del saber' });
        ESCALERA.slice().reverse().forEach((p, k) => {
          const idx = ESCALERA.length - 1 - k;
          esc5.appendChild(h('li', { class: idx === desde ? 'aqui' : idx < desde ? 'bajo' : '' }, '<b>' + p[0] + '</b> ' + p[1]));
        });
        if (R.pq.k < P.length) {
          const q = P[R.pq.k];
          c.appendChild(esc5);
          c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, '<span class="ep-cnt">' + (R.pq.k + 1) + ' de ' + P.length + '.</span> ' + fmt(q.p)));
          const g = h('div', { class: 'ep-ops' });
          const fb = h('p', { class: 'ep-fb ep-leer', 'aria-live': 'polite' });
          q.o.forEach((t, j) => {
            g.appendChild(btn(esc(t), 'ep-op', ev => {
              if (R.grupo) return;
              if (g.dataset.hecho) return; g.dataset.hecho = '1';
              const bien = j === q.ok;
              if (bien) R.pq.ok++;
              pitido(prefs, bien ? 'bien' : 'toque');
              g.querySelectorAll('.ep-op').forEach((b, k2) => { b.classList.add(k2 === q.ok ? 'bien' : k2 === j ? 'mal' : 'no'); b.disabled = true; });
              fb.innerHTML = (bien ? '<b>Eso es.</b> ' : '<b>Casi.</b> ') + fmt(q.por || '');
              R.sig.disabled = false;
            }));
          });
          c.appendChild(g); c.appendChild(fb);
          if (R.grupo) {
            const ver = btn('Ver la respuesta', 'ep-btn ep-sec', () => {
              g.querySelectorAll('.ep-op').forEach((b, k2) => { b.classList.add(k2 === q.ok ? 'bien' : 'no'); b.disabled = true; });
              fb.innerHTML = fmt(q.por || ''); ver.remove(); R.sig.disabled = false;
            });
            c.appendChild(ver);
          }
          pie(R, c, 'Seguir', () => { R.pq.k++; pintar(R); }, { sinAtras: true, desactivado: true });
          return;
        }
        // resultado
        let sube = !R.grupo && R.pq.ok >= 2 && desde < ESCALERA.length - 1;
        if (!R.grupo && !R.pq.guardado) {
          const s = datos.leer();
          const p = s.palabras[R.ep.id] || { nivel: 0, veces: 0, desde: hoy() };
          p.veces = (p.veces || 0) + 1;
          if (sube) p.nivel = Math.min(ESCALERA.length - 1, (p.nivel || 0) + 1);
          s.palabras[R.ep.id] = p;
          if (!s.nuevos[hoy()] && !Object.values(s.nuevos).includes(R.ep.id)) s.nuevos[hoy()] = R.ep.id;
          datos.guardar(s); R.pq.guardado = true; R.pq.sube = sube; R.pq.desde = desde;
        }
        sube = R.pq.sube;
        const ahora = nivel(R.ep.id);
        esc5.querySelectorAll('li').forEach((li, k) => { const idx = ESCALERA.length - 1 - k; li.className = idx === ahora ? 'aqui' : idx < ahora ? 'bajo' : ''; });
        c.appendChild(esc5);
        let txt;
        if (R.grupo) txt = 'Así subís un peldaño juntos: de oírlo a saber de dónde viene. Cada persona, en su propio cuaderno, si quiere.';
        else if (sube) txt = 'Acertaste ' + R.pq.ok + ' de ' + P.length + ': subes de <b>' + ESCALERA[R.pq.desde][0] + '</b> a <b>' + ESCALERA[ahora][0] + '</b>. El siguiente peldaño, con la vuelta.';
        else if (R.pq.ok >= 2) txt = 'Acertaste ' + R.pq.ok + ' de ' + P.length + '. Ya estás arriba del todo: <b>' + ESCALERA[ahora][0] + '</b>.';
        else txt = 'Acertaste ' + R.pq.ok + ' de ' + P.length + '. Sigues en <b>' + ESCALERA[ahora][0] + '</b> por ahora: con la vuelta se sube.';
        c.appendChild(h('p', { class: 'ep-res ep-leer' }, txt));
        if (E.sabias) c.appendChild(h('p', { class: 'ep-sabias ep-leer' }, '<b>¿Sabías que?</b> ' + fmt(E.sabias)));
        pie(R, c, 'Seguir', () => { R.i = 4; pintar(R); }, { sinAtras: true });
      },
      mision(R, c) {
        const E = R.ep.mision;
        c.appendChild(rotulo(4, R.grupo ? 'la del grupo' : 'tu misión'));
        c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, R.grupo ? 'Elegid una misión para todo el grupo, fuera de la pantalla.' : 'Elige una, fuera de la pantalla. Pequeña, con su día y su vuelta.'));
        if (R.grupo) {
          const ops = E.opciones.map((o, k) => ({ id: 'm' + k, t: o.t }));
          c.appendChild(votos(R, 'mision', ops));
          pie(R, c, 'Seguir', () => { const m = mayoria(R, 'mision', ops); R.resp.mision = m ? +m.id.slice(1) : 0; R.i = 5; pintar(R); });
          return;
        }
        const g = h('div', { class: 'ep-ops' });
        E.opciones.forEach((o, k) => {
          g.appendChild(btn('<b>' + esc(o.corta || ('Misión ' + (k + 1))) + '</b><span>' + fmt(o.t) + '</span>', 'ep-op ep-mis' + (R.resp.mision === k ? ' on' : ''), () => {
            R.resp.mision = k; g.querySelectorAll('.ep-op').forEach((b, j) => b.classList.toggle('on', j === k)); comprobar();
          }));
        });
        c.appendChild(g);
        c.appendChild(h('p', { class: 'ep-pregunta' }, '¿Cuándo vuelves a contarlo?'));
        const dias = h('div', { class: 'ep-dias' });
        [[1, 'Mañana'], [3, 'En tres días'], [7, 'En una semana']].forEach(([n, t]) => {
          dias.appendChild(btn(t + '<small>' + fechaLarga(sumaDias(n)) + '</small>', 'ep-op ep-dia' + (R.resp.dias === n ? ' on' : ''), () => {
            R.resp.dias = n; dias.querySelectorAll('.ep-op').forEach(b => b.classList.toggle('on', b.textContent.indexOf(t) === 0)); comprobar();
          }));
        });
        c.appendChild(dias);
        if (E.retorno) c.appendChild(h('p', { class: 'ep-nota ep-leer' }, '<b>Tu retorno:</b> ' + fmt(E.retorno)));
        function comprobar() { if (R.sig) R.sig.disabled = !(R.resp.mision != null && R.resp.dias); }
        pie(R, c, 'Apuntarla en mi cuaderno', () => {
          const s = datos.leer();
          const texto = E.opciones[R.resp.mision].t;
          s.misiones = s.misiones.filter(m => !(m.ep === R.ep.id && m.estado === 'pendiente'));
          s.misiones.push({ id: R.ep.id + '-' + Date.now(), ep: R.ep.id, palabra: R.ep.palabra, texto, creada: hoy(), vuelta: sumaDias(R.resp.dias), estado: 'pendiente' });
          datos.guardar(s); pitido(prefs, 'bien');
          R.i = 5; pintar(R);
        }, { desactivado: !(R.resp.mision != null && R.resp.dias) });
      },
      historia(R, c) {
        const E = R.ep.historia || {};
        c.appendChild(rotulo(5));
        const mis = R.ep.mision.opciones[R.resp.mision || 0];
        const ch = R.resp.choque, rf = R.resp.reflejo || 'tiempo';
        const l1 = (E.pensaba && (E.pensaba[ch] || E.pensaba._)) || 'Entraste con una idea.';
        const l2 = (E.hice && (E.hice[rf] || E.hice._)) || 'Decidiste rápido.';
        const l3 = (E.ahora || 'Esta semana vas a: {mision}').replace('{mision}', (mis.historia || mis.t).replace(/\.$/, '').replace(/^./, x => x.toLowerCase()));
        const base = R.grupo ? [l1, l2, l3].map(x => x.replace(/^Entraste/, 'Entrasteis').replace(/^Elegiste/, 'Elegisteis')).join(' ') : [l1, l2, l3].join(' ');
        c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, R.grupo ? 'La historia del grupo, en tres líneas. Cambiadla si no os representa.' : 'Tu historia, en tres líneas. Es tuya: cámbiala si no te representa.'));
        const ta = h('textarea', { class: 'ep-hist', rows: 5, 'aria-label': 'Tu historia' });
        ta.value = R.resp.historia || base;
        ta.addEventListener('input', () => { R.resp.historia = ta.value; });
        c.appendChild(ta);
        c.appendChild(h('p', { class: 'ep-sr ep-leer' }, esc(ta.value)));
        const acc = h('div', { class: 'ep-acc' });
        const aviso = h('span', { class: 'ep-nota', 'aria-live': 'polite' });
        acc.appendChild(btn('Copiar', 'ep-mini', () => {
          const t = ta.value;
          (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { aviso.textContent = 'Copiada.'; }, () => { ta.select(); try { document.execCommand('copy'); aviso.textContent = 'Copiada.'; } catch (e) { } });
        }));
        if (navigator.share) acc.appendChild(btn('Compartir', 'ep-mini', () => { navigator.share({ text: ta.value }).catch(() => { }); }));
        acc.appendChild(aviso);
        c.appendChild(acc);
        c.appendChild(h('p', { class: 'ep-nota' }, 'Compartir es opcional. Nada se publica solo.'));
        pie(R, c, R.grupo ? 'Seguir' : 'Guardar en mi cuaderno', () => {
          if (!R.grupo) {
            const s = datos.leer();
            s.historias = s.historias.filter(x => !(x.ep === R.ep.id && x.fecha === hoy()));
            s.historias.push({ ep: R.ep.id, palabra: R.ep.palabra, fecha: hoy(), texto: ta.value.trim() });
            datos.guardar(s);
          }
          R.i = 6; pintar(R);
        });
      },
      vuelta(R, c) {
        c.appendChild(rotulo(6));
        if (R.grupo) {
          c.appendChild(h('p', { class: 'ep-frase ep-leer' }, 'En la próxima sesión, la vuelta.'));
          c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, 'A mano alzada: ¿quién lo hizo?, ¿qué pasó?, ¿mereció la pena? Se cuenta el grupo, nunca a una persona.'));
          const sig = siguiente(R.ep);
          if (sig) c.appendChild(h('p', { class: 'ep-res ep-leer' }, 'El siguiente episodio: <b>' + esc(sig.palabra) + '</b>.'));
          pie(R, c, 'Terminar', () => salir(R), { sinAtras: true });
          return;
        }
        const s = st();
        const m = s.misiones.filter(x => x.ep === R.ep.id && x.estado === 'pendiente').pop();
        if (m) {
          c.appendChild(h('p', { class: 'ep-frase ep-leer' }, 'Tu vuelta: el ' + esc(fechaLarga(m.vuelta)) + '.'));
          c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, 'Ese día te preguntaremos tres cosas: ¿lo hiciste?, ¿qué pasó?, ¿mereció la pena? Mientras, la misión ocurre fuera de la pantalla.'));
        }
        const sig = siguiente(R.ep);
        if (sig) c.appendChild(h('p', { class: 'ep-res ep-leer' }, 'El siguiente episodio, <b>' + esc(sig.palabra) + '</b>, ' + (disponible(sig.id) ? 'ya está abierto.' : 'se abre otro día. Uno nuevo al día, y nada caduca.')));
        c.appendChild(h('p', { class: 'ep-nota' }, 'Todo queda en tu cuaderno, solo en este dispositivo.'));
        const p = h('div', { class: 'ep-pie' });
        if (prefs.demo && m) p.appendChild(btn('Hacer la vuelta ahora (demostración)', 'ep-btn ep-sec', () => { limpiar(R); vuelta(R.el, m.id); }));
        p.appendChild(btn('Terminar', 'ep-btn ep-pri', () => salir(R)));
        c.appendChild(p);
      }
    };
    function siguiente(ep) {
      if (ep.vuelta && ep.vuelta.siguiente && POR_ID[ep.vuelta.siguiente]) return POR_ID[ep.vuelta.siguiente];
      const i = EP.indexOf(ep);
      return EP[(i + 1) % EP.length] !== ep ? EP[(i + 1) % EP.length] : null;
    }
    function limpiar(R) { VOZ.parar(); if (R.limpia) { R.limpia(); R.limpia = null; } }
    function salir(R) { limpiar(R); if (C.alSalir) C.alSalir(R.ep); else portada(R.el); }
    function pintar(R) {
      limpiar(R);
      const el = R.el;
      el.innerHTML = '';
      el.classList.add('ep');
      el.classList.toggle('ep-grupo', !!R.grupo);
      el.appendChild(cabecera(R));
      const cont = h('div', { class: 'ep-cuerpo ep-t-' + TIEMPOS[R.i].id });
      el.appendChild(cont);
      PINTA[TIEMPOS[R.i].id](R, cont);
      cont.insertBefore(herramientas(R, cont), cont.firstChild);
      if (prefs.dentro && C.porDentro) el.appendChild(porDentro(R.i));
      const foco = cont.querySelector('.ep-rotulo');
      if (foco && R.enfocar) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
      R.enfocar = true;
      if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
    }

    // ---------- pantallas públicas
    function abrir(el, id, op) {
      const ep = (id && POR_ID[id]) || deHoy();
      if (!ep) { el.innerHTML = '<p>No hay episodios.</p>'; return; }
      // en modo grupo quien guía elige cualquier palabra: no se guarda nada personal
      const grupo = !!(C.grupo && (op && op.grupo != null ? op.grupo : prefs.grupo));
      if (!grupo && !disponible(ep.id)) {
        el.innerHTML = '';
        el.classList.add('ep');
        el.appendChild(h('div', { class: 'ep-cuerpo' }, '<p class="ep-frase">«' + esc(ep.palabra) + '» se abre otro día.</p><p class="ep-pregunta">Un episodio nuevo al día. Los que ya abriste se pueden repetir siempre, y nada caduca.</p>'));
        const p = h('div', { class: 'ep-pie' });
        p.appendChild(btn('Ir al episodio de hoy', 'ep-btn ep-pri', () => abrir(el, deHoy().id)));
        el.appendChild(p);
        return;
      }
      const R = { el, ep, i: 0, resp: {}, votos: {}, grupo, enfocar: false };
      // La pregunta de llegada, si la web la usa: con la cabeza a mil, el episodio se acorta
      const L = C.llegada;
      if (L && !grupo && !(op && op.completo)) {
        const k = L.hoy ? L.hoy() : null;
        if (!k) { llegada(el, R); return; }
        if (k === L.corta && ep.corto) { corto(el, ep); return; }
      }
      pintar(R);
    }
    function marco(el, ep, etiqueta) {
      el.innerHTML = '';
      el.classList.add('ep');
      el.classList.remove('ep-grupo');
      const top = h('div', { class: 'ep-top' });
      top.appendChild(h('div', { class: 'ep-top-l' }, esc(C.nombre) + ' · ' + esc(etiqueta)));
      top.appendChild(h('div', { class: 'ep-top-r' }, esc(ep.palabra)));
      const cab = h('div', { class: 'ep-cab' }); cab.appendChild(top); el.appendChild(cab);
      const cont = h('div', { class: 'ep-cuerpo' }); el.appendChild(cont);
      return cont;
    }
    function llegada(el, R) {
      const L = C.llegada, c = marco(el, R.ep, 'antes de empezar');
      c.appendChild(h('p', { class: 'ep-frase' }, esc(L.pregunta || '¿Cómo llegas hoy?')));
      if (L.ayuda) c.appendChild(h('p', { class: 'ep-nota' }, esc(L.ayuda)));
      const g = h('div', { class: 'ep-ops' });
      (L.opciones || []).forEach(o => {
        g.appendChild(btn('<b>' + esc(o.t) + '</b>' + (o.s ? '<span>' + esc(o.s) + '</span>' : ''), 'ep-op ep-mis', () => {
          if (L.elegir) L.elegir(o.id);
          if (o.id === L.corta && R.ep.corto) corto(el, R.ep); else pintar(R);
        }));
      });
      c.appendChild(g);
      c.appendChild(h('p', { class: 'ep-nota' }, 'Describe cómo llegas hoy, no cómo eres. Puede cambiar mañana.'));
    }
    function corto(el, ep) {
      const K = ep.corto, c = marco(el, ep, 'versión corta');
      c.appendChild(h('div', { class: 'ep-rotulo' }, '<span class="ep-n">1</span><span>Una sola pregunta</span>'));
      c.appendChild(h('p', { class: 'ep-frase ep-leer' }, fmt(K.pregunta)));
      c.appendChild(h('p', { class: 'ep-nota' }, 'No hace falta contestarla aquí. Piénsala un momento, sin prisa.'));
      c.appendChild(h('div', { class: 'ep-rotulo' }, '<span class="ep-n">2</span><span>Una acción pequeña</span>'));
      c.appendChild(h('div', { class: 'ep-hecho ep-leer' }, fmt(K.accion)));
      const eco = h('p', { class: 'ep-res', 'aria-live': 'polite' });
      const p = h('div', { class: 'ep-pie' });
      const fin = t => { p.innerHTML = ''; eco.innerHTML = t; p.appendChild(btn('Ver el episodio completo', 'ep-btn ep-sec', () => abrir(el, ep.id, { completo: true }))); p.appendChild(btn('Terminar', 'ep-btn ep-pri', () => { VOZ.parar(); if (C.alSalir) C.alSalir(ep); else portada(el); })); };
      p.appendChild(btn('Ahora no', 'ep-btn ep-sec', () => fin('Vale. Con haber parado un momento ya basta por hoy. El episodio completo te espera cuando quieras.')));
      p.appendChild(btn('La apunto en mi cuaderno', 'ep-btn ep-pri', () => {
        const s = datos.leer();
        s.misiones = s.misiones.filter(m => !(m.ep === ep.id && m.estado === 'pendiente'));
        const m = { id: ep.id + '-' + Date.now(), ep: ep.id, palabra: ep.palabra, texto: K.accion, creada: hoy(), vuelta: sumaDias(3), estado: 'pendiente', corta: true };
        s.misiones.push(m); datos.guardar(s); pitido(prefs, 'bien');
        fin('Apuntada. Tu vuelta, el ' + esc(fechaLarga(m.vuelta)) + ': te preguntaremos cómo fue. El episodio completo te espera cuando tengas más calma.');
      }));
      c.appendChild(eco);
      if (C.llegada && C.llegada.cuidado) c.appendChild(h('p', { class: 'ep-nota ep-cuidado' }, C.llegada.cuidado));
      c.appendChild(p);
    }
    function vuelta(el, idMision) {
      const s = st();
      const m = s.misiones.find(x => x.id === idMision) || vencidas()[0] || pendientes()[0];
      el.innerHTML = ''; el.classList.add('ep');
      if (!m) { el.appendChild(h('p', {}, 'No tienes vueltas pendientes.')); return; }
      const ep = POR_ID[m.ep] || { palabra: m.palabra, id: m.ep };
      const r = {};
      const top = h('div', { class: 'ep-cab' }, '<div class="ep-top"><div class="ep-top-l">' + esc(C.nombre) + ' · tu vuelta</div><div class="ep-top-r">' + esc(m.palabra) + '</div></div>');
      el.appendChild(top);
      const c = h('div', { class: 'ep-cuerpo ep-t-vuelta' });
      el.appendChild(c);
      c.appendChild(rotulo(6, 'tu vuelta'));
      c.appendChild(h('p', { class: 'ep-situacion ep-leer' }, '<b>Tu misión era:</b> ' + fmt(m.texto)));
      const q = (txt, ops, clave) => {
        c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, esc(txt)));
        const g = h('div', { class: 'ep-ops ep-ops-fila' });
        ops.forEach(([id, t]) => g.appendChild(btn(esc(t), 'ep-op', () => { r[clave] = id; g.querySelectorAll('.ep-op').forEach(b => b.classList.toggle('on', b.textContent === t)); listo(); })));
        c.appendChild(g);
      };
      q('¿Lo hiciste?', [['si', 'Sí'], ['medias', 'A medias'], ['no', 'No']], 'hecho');
      c.appendChild(h('p', { class: 'ep-pregunta ep-leer' }, '¿Qué pasó? Una o dos líneas: qué hiciste y qué viste.'));
      const ta = h('textarea', { class: 'ep-hist', rows: 3, 'aria-label': 'Qué pasó' });
      c.appendChild(ta);
      q('¿Mereció la pena?', [['si', 'Sí'], ['nose', 'Aún no lo sé'], ['no', 'No']], 'merece');
      if (C.preguntaPrueba) q('Mientras lo hacías, ¿lo que sentías y lo que hacías iban juntos o por separado?', [['juntos', 'Juntos'], ['separado', 'Por separado'], ['nose', 'No me fijé']], 'prueba');
      q('¿Lo comprobó alguien más?', [['verificado', 'Sí, otra persona lo vio'], ['declarado', 'No, lo cuento yo']], 'proc');
      c.appendChild(h('p', { class: 'ep-nota' }, 'Lo que cuentas tú y lo que confirma otra persona se guardan por separado, sin mezclarlos.'));
      const p = h('div', { class: 'ep-pie' });
      const ok = btn('Guardar la vuelta', 'ep-btn ep-pri', () => {
        const s2 = datos.leer();
        const mm = s2.misiones.find(x => x.id === m.id);
        if (mm) mm.estado = r.hecho === 'si' ? 'hecha' : r.hecho === 'medias' ? 'medias' : 'no';
        s2.retornos.push({ ep: m.ep, palabra: m.palabra, fecha: hoy(), proc: r.proc, hecho: r.hecho, merece: r.merece, prueba: r.prueba || null, texto: ta.value.trim() });
        let subio = null;
        if (r.hecho !== 'no') {
          s2.racha = (s2.racha || 0) + 1;
          const pp = s2.palabras[m.ep] || { nivel: 0, veces: 1, desde: hoy() };
          if (pp.nivel < ESCALERA.length - 1) { pp.nivel++; subio = pp.nivel; }
          s2.palabras[m.ep] = pp;
        }
        datos.guardar(s2); pitido(prefs, 'bien');
        c.innerHTML = '';
        c.appendChild(rotulo(6, 'hecha'));
        let t;
        if (r.hecho === 'no') t = 'No pasa nada. Tu racha se pausa, no se pierde: sigue en ' + (s2.racha || 0) + '. Puedes volver a intentarlo cuando quieras.';
        else t = 'Vuelta hecha. Tu racha: ' + s2.racha + (s2.racha === 1 ? ' vuelta' : ' vueltas') + '.' + (subio != null ? ' Subes a <b>' + ESCALERA[subio][0] + '</b>: ' + ESCALERA[subio][1] + '.' : '');
        c.appendChild(h('p', { class: 'ep-frase ep-leer' }, t));
        const sig = POR_ID[m.ep] ? siguiente(POR_ID[m.ep]) : null;
        if (sig) c.appendChild(h('p', { class: 'ep-res' }, 'Se abre el siguiente episodio: <b>' + esc(sig.palabra) + '</b>.'));
        const p2 = h('div', { class: 'ep-pie' });
        if (r.hecho === 'no') p2.appendChild(btn('Darme otra semana', 'ep-btn ep-sec', () => {
          const s3 = datos.leer();
          s3.misiones.push({ id: m.ep + '-' + Date.now(), ep: m.ep, palabra: m.palabra, texto: m.texto, creada: hoy(), vuelta: sumaDias(7), estado: 'pendiente' });
          datos.guardar(s3); if (C.alSalir) C.alSalir(ep); else portada(el);
        }));
        if (sig) p2.appendChild(btn('Abrir «' + esc(sig.palabra) + '»', 'ep-btn ep-sec', () => abrir(el, sig.id)));
        p2.appendChild(btn('Terminar', 'ep-btn ep-pri', () => { if (C.alSalir) C.alSalir(ep); else portada(el); }));
        c.appendChild(p2);
      });
      ok.disabled = true;
      function listo() { ok.disabled = !(r.hecho && r.merece && r.proc && (!C.preguntaPrueba || r.prueba)); }
      p.appendChild(ok);
      c.appendChild(p);
    }
    function portada(el, opciones) {
      const o = Object.assign({ boton: 'Empieza', alAbrir: null, alVolver: null }, opciones);
      el.innerHTML = ''; el.classList.add('ep-portada');
      const v = vencidas()[0];
      if (v) {
        const caja = h('div', { class: 'ep-p-vuelta' }, '<div class="ep-p-k">Tienes una vuelta</div><p><b>' + esc(v.palabra) + '.</b> ' + fmt(v.texto) + '</p>');
        caja.appendChild(btn('Contar cómo fue', 'ep-btn ep-pri', () => (o.alVolver ? o.alVolver(v.id) : vuelta(el, v.id))));
        el.appendChild(caja);
      }
      const e = deHoy();
      if (!e) return;
      const yaHecho = !!st().palabras[e.id];
      const b = btn('<span class="ep-p-play" aria-hidden="true">▶</span> <span><b>' + esc(o.boton) + '</b><small>' + esc(e.palabra) + ' · 7 tiempos · unos ' + C.minutos + ' minutos</small></span>', 'ep-p-btn', () => (o.alAbrir ? o.alAbrir(e.id) : abrir(el, e.id)));
      el.appendChild(h('div', { class: 'ep-p-k' }, yaHecho ? 'Para repasar hoy' : 'El episodio de hoy'));
      el.appendChild(b);
      const s = st();
      const n = Object.keys(s.palabras).length;
      const ganadas = Object.values(s.palabras).filter(p => p.nivel >= 1).length;
      const nv = s.palabras[e.id] ? s.palabras[e.id].nivel : 0;
      el.appendChild(h('p', { class: 'ep-p-stats' }, n ? 'Tus palabras: <b>' + ganadas + '</b> ganadas de ' + EP.length + ' · racha: <b>' + (s.racha || 0) + '</b>' + (rachaPausada() ? ' (en pausa)' : '') + ' · peldaño de hoy: <b>' + ESCALERA[nv][0] + '</b>' : 'Siete tiempos: sientes, actúas, piensas, subes un peldaño, eliges una misión, cuentas tu historia y vuelves otro día.'));
    }
    function lista(el, opciones) {
      const o = Object.assign({ alAbrir: null }, opciones);
      el.innerHTML = '';
      const ul = h('ol', { class: 'ep-lista' });
      EP.forEach(e => {
        const s = st().palabras[e.id];
        const ab = disponible(e.id);
        const li = h('li', { class: s ? 'hecho' : ab ? 'abierto' : 'cerrado' });
        const est = s ? ESCALERA[s.nivel][0] : !ab ? 'Otro día' : (e.id === deHoy().id ? 'Hoy' : 'Abierto');
        const b = btn('<b>' + esc(e.palabra) + '</b><span>' + esc(e.resumen || '') + '</span><em>' + esc(est) + '</em>', 'ep-l-btn', () => (o.alAbrir ? o.alAbrir(e.id) : abrir(el, e.id)));
        if (!ab) b.setAttribute('aria-disabled', 'true');
        li.appendChild(b);
        ul.appendChild(li);
      });
      el.appendChild(ul);
      if (C.unoAlDia && !prefs.demo) el.appendChild(h('p', { class: 'ep-nota' }, 'Un episodio nuevo al día. Los que ya abriste se pueden repetir siempre, y nada caduca.'));
    }
    function cuaderno(el, opciones) {
      const o = Object.assign({ alVolver: null, alAbrir: null }, opciones);
      const s = st();
      el.innerHTML = '';
      const sec = (t) => { const d = h('section', { class: 'ep-c-sec' }); d.appendChild(h('h3', {}, esc(t))); el.appendChild(d); return d; };
      const nPal = Object.keys(s.palabras).length;
      const res = h('p', { class: 'ep-c-res' }, '<b>' + nPal + '</b> ' + (nPal === 1 ? 'palabra' : 'palabras') + ' · <b>' + (s.racha || 0) + '</b> ' + ((s.racha || 0) === 1 ? 'vuelta' : 'vueltas') + ' de racha' + (rachaPausada() ? ' (en pausa: se pausa, no se pierde)' : '') + ' · <b>' + s.historias.length + '</b> ' + (s.historias.length === 1 ? 'historia' : 'historias'));
      el.appendChild(res);
      // palabras
      const a = sec('Tus palabras');
      if (!nPal) a.appendChild(h('p', { class: 'ep-nota' }, 'Aún ninguna. Cada episodio deja aquí su palabra y su peldaño.'));
      else {
        const ul = h('ul', { class: 'ep-c-pal' });
        Object.keys(s.palabras).forEach(id => {
          const p = s.palabras[id], e = POR_ID[id];
          ul.appendChild(h('li', { class: p.nivel >= 1 ? 'ganada' : '' }, '<b>' + esc(e ? e.palabra : id) + '</b><span>' + ESCALERA[p.nivel][0] + ' · ' + ESCALERA[p.nivel][1] + '</span>'));
        });
        a.appendChild(ul);
        a.appendChild(h('p', { class: 'ep-nota' }, 'Una palabra se gana al llegar al peldaño Datos.'));
      }
      // misiones
      const b = sec('Tus misiones');
      const pend = pendientes();
      if (!s.misiones.length) b.appendChild(h('p', { class: 'ep-nota' }, 'Aún ninguna.'));
      s.misiones.slice().reverse().forEach(m => {
        const d = h('div', { class: 'ep-c-mis ' + m.estado });
        const est = m.estado === 'pendiente' ? 'Vuelta: ' + fechaLarga(m.vuelta) : m.estado === 'hecha' ? 'Hecha' : m.estado === 'medias' ? 'A medias' : 'No salió';
        d.innerHTML = '<b>' + esc(m.palabra) + '</b> · <span>' + esc(est) + '</span><p>' + fmt(m.texto) + '</p>';
        if (m.estado === 'pendiente' && (m.vuelta <= hoy() || prefs.demo)) d.appendChild(btn('Contar cómo fue', 'ep-mini', () => (o.alVolver ? o.alVolver(m.id) : vuelta(el, m.id))));
        b.appendChild(d);
      });
      if (pend.length) b.appendChild(h('p', { class: 'ep-nota' }, 'La vuelta se abre el día que elegiste.'));
      // retornos por procedencia
      const r = sec('Tus retornos');
      r.appendChild(h('p', { class: 'ep-nota' }, 'Cada retorno se guarda con su procedencia, sin mezclarlos.'));
      Object.keys(PROC).forEach(k => {
        const items = s.retornos.filter(x => x.proc === k);
        const d = h('div', { class: 'ep-c-proc ep-proc-' + k });
        d.appendChild(h('h4', {}, esc(PROC[k][0]) + ' <small>' + esc(PROC[k][1]) + ' · ' + items.length + '</small>'));
        if (items.length) {
          const ul = h('ul', {});
          items.slice(-8).reverse().forEach(x => ul.appendChild(h('li', {}, '<b>' + esc(x.palabra) + '</b> · ' + esc(fechaLarga(x.fecha)) + (x.hecho ? ' · ' + ({ si: 'hecha', medias: 'a medias', no: 'no salió' }[x.hecho] || '') : '') + (x.texto ? '. ' + esc(x.texto) : ''))));
          d.appendChild(ul);
        }
        r.appendChild(d);
      });
      // historias
      const hi = sec('Tus historias');
      if (!s.historias.length) hi.appendChild(h('p', { class: 'ep-nota' }, 'Aún ninguna.'));
      s.historias.slice().reverse().forEach(x => hi.appendChild(h('blockquote', { class: 'ep-c-hist' }, fmt(x.texto) + '<footer>' + esc(x.palabra) + ' · ' + esc(fechaLarga(x.fecha)) + '</footer>')));
      // propiedad
      const z = sec('Es tuyo');
      z.appendChild(h('p', {}, 'Todo esto se guarda solo en este dispositivo. Nadie más lo ve, ni siquiera quien hizo la web.'));
      const acc = h('div', { class: 'ep-acc' });
      acc.appendChild(btn('Descargar mi cuaderno', 'ep-mini', () => {
        const txt = textoCuaderno(datos.leer());
        const a2 = h('a', { href: URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' })), download: C.sitio + '-mi-cuaderno.txt' });
        document.body.appendChild(a2); a2.click(); setTimeout(() => { URL.revokeObjectURL(a2.href); a2.remove(); }, 500);
      }));
      acc.appendChild(btn('Borrar todo', 'ep-mini ep-peligro', () => {
        if (window.confirm('¿Borrar todo tu cuaderno de este dispositivo? No se puede deshacer.')) { datos.borrar(); cuaderno(el, opciones); }
      }));
      z.appendChild(acc);
    }
    function textoCuaderno(s) {
      const L = [C.nombre + ' · mi cuaderno · ' + fechaLarga(hoy()), ''];
      L.push('PALABRAS');
      Object.keys(s.palabras).forEach(id => L.push('- ' + (POR_ID[id] ? POR_ID[id].palabra : id) + ': ' + ESCALERA[s.palabras[id].nivel][0]));
      L.push('', 'MISIONES');
      s.misiones.forEach(m => L.push('- ' + m.palabra + ' (' + m.estado + ', vuelta ' + m.vuelta + '): ' + m.texto));
      L.push('', 'RETORNOS');
      s.retornos.forEach(r => L.push('- [' + PROC[r.proc][0] + '] ' + r.palabra + ' · ' + r.fecha + (r.texto ? ': ' + r.texto : '')));
      L.push('', 'HISTORIAS');
      s.historias.forEach(x => L.push('- ' + x.palabra + ' · ' + x.fecha + ': ' + x.texto));
      return L.join('\n');
    }

    return { abrir, vuelta, portada, lista, cuaderno, deHoy, vencidas, pendientes, TIEMPOS, ESCALERA, prefs: () => prefs, ajustar: (k, v) => { prefs[k] = v; guardarPrefs(); }, parar: () => VOZ.parar() };
  }

  window.Episodio = { crear, TIEMPOS, ESCALERA, version: '1.0' };
})();
