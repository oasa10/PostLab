import { h, plural, cabeza, recuadro, LOGO } from '../lib.js';
import { EJES, ORDEN_EJES } from '../cuaderno.js';
import { URL_BASE, AUTORIA } from './ficha.js';
import { PROMESA } from './inicio.js';

const tabla = (cabecera, filas, primeraEnNegrita = true) => h('div', { class: 'table-wrap' }, h('table', null,
  h('thead', null, h('tr', null, cabecera.map(c => h('th', { scope: 'col' }, c)))),
  h('tbody', null, filas.map(f => h('tr', null, f.map((x, i) => h('td', null, i === 0 && primeraEnNegrita ? h('b', null, x) : x)))))));

export function render(root, ctx) {
  document.title = 'Conocer PostLab · PostLab';
  const { terms, hitos, rels } = ctx;
  const n = e => terms.filter(t => t.estado === e).length;
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  root.append(h('div', { style: { maxWidth: '760px' } },
    cabeza(0, 'Conocer PostLab', `${PROMESA[0]} ${PROMESA[1]}`),
    h('p', null, 'PostLab es un laboratorio abierto de lo post: los términos que llevan el prefijo pos- o post-, desde la posguerra hasta la posverdad, contados de forma clara y con sus fuentes a la vista. Entras por un episodio de siete minutos y, si quieres más, tienes detrás las fichas, la historia, los mapas y los juegos.'),

    // W2: la propuesta de valor, en una ficha
    h('h2', { id: 'para-que' }, 'Para quién y para qué'),
    tabla(['', 'PostLab'], [
      ['Para quién', 'Para cualquier persona curiosa, y sobre todo para quien enseña o acompaña a un grupo: docentes, monitores, asociaciones y clubes.'],
      ['Qué le pasa', 'Oye «posverdad», «posmoderno» o «poshumano» en las noticias y en las conversaciones, y no sabe qué tienen en común ni por qué hay tantas.'],
      ['Qué gana', 'En siete minutos, una palabra post vivida: lo que le provoca, de dónde viene y algo que hará con ella. Con el tiempo, una clave para leer su época: «ya no, todavía no».'],
      ['Para qué le sirve', 'Leer una noticia y reconocer qué clase de «después» dice; hablar de su época con palabras precisas; preparar una clase con fichas verificadas y datos abiertos.'],
      ['Por qué vuelve', 'Una misión que revisar, un peldaño más y una historia humana detrás de cada palabra.'],
      ['Quién paga', 'Nadie: es abierta y gratuita.'],
      ['Qué no es', 'Una enciclopedia que hay que leer entera, ni un sustituto del buscador o del chat.']]),

    // W4: frente a un buscador o un chat
    h('h2', { id: 'chat' }, 'Frente a un buscador o un chat'),
    h('p', null, 'Un chat da una definición al momento, y PostLab no compite ahí. Hace lo que un chat no hace.'),
    tabla(['Lo que buscas', 'Un buscador o un chat', 'PostLab'], [
      ['Una definición', 'La da al momento', 'No compite: la ficha verificada está a un toque'],
      [`La lista de los ${terms.length} términos`, 'La da, sin orden', 'No la enseña de entrada: un episodio al día y los seis valores del «después»'],
      ['Ver qué te provoca una palabra y dónde saltas', 'No lo hace', 'Choque, Reflejo y Giro'],
      ['Saber en qué peldaño estás y subir uno', 'No lo hace', 'Peldaño, con el antes y el después'],
      ['Hacer algo fuera de la pantalla y volver', 'No lo hace', 'Misión y Vuelta'],
      ['Una lección para un grupo', 'No la prepara', h('a', { href: '#/clase' }, 'Modo clase')]]),

    h('h2', { id: 'episodio' }, 'El episodio'),
    h('p', null, 'Una palabra, siete tiempos y unos siete minutos. Primero sientes y decides, sin explicación; después llega el porqué. Al final eliges algo que hacer fuera de la pantalla y vuelves otro día a contar cómo fue.'),
    h('ol', { class: 'tiempos' },
      h('li', null, h('b', null, 'Choque. '), 'Una frase de la calle: ¿qué te provoca?'),
      h('li', null, h('b', null, 'Reflejo. '), 'Una decisión rápida, como en la vida.'),
      h('li', null, h('b', null, 'Giro. '), 'Un hecho con su fuente que lleva la contraria, y dónde saltaste.'),
      h('li', null, h('b', null, 'Peldaño. '), 'Tres preguntas para subir un escalón: ruido, datos, información, conocimiento y entendimiento.'),
      h('li', null, h('b', null, 'Misión. '), 'Algo pequeño que harás esta semana, con su día.'),
      h('li', null, h('b', null, 'Tu historia. '), 'Lo que pensabas, lo que hiciste y lo que harás, en tres líneas.'),
      h('li', null, h('b', null, 'Vuelta. '), 'Otro día cuentas cómo fue, y se abre la palabra siguiente.')),
    // W17: los impulsores que mueven por urgencia llevan su freno
    h('h3', null, 'Lo que engancha, con su freno'),
    h('p', null, 'Un episodio engancha a propósito, y por eso cada cosa que mete prisa lleva su freno. PostLab se usa con menores en clase.'),
    tabla(['Lo que engancha', 'Su freno'], [
      ['Un episodio al día', 'No se compra ni se acumula, y nada caduca.'],
      ['Cinco segundos para decidir', 'Solo en el Reflejo, nunca en los temas delicados, y se puede quitar en los ajustes del episodio.'],
      ['Una frase sin explicación', 'Siempre se resuelve en el mismo episodio.'],
      ['Un giro que lleva la contraria', 'Siempre con un hecho comprobado y su fuente; nunca premios al azar.'],
      ['La racha de vueltas', 'La racha se pausa, no se pierde.'],
      ['Ver el error que quieres evitar', 'Se señala el salto, nunca a la persona.']]),

    h('h2', null, 'El logo'),
    h('div', { class: 'logo-explica' },
      h('div', { class: 'logo-grande', html: LOGO }),
      h('p', null, 'Es la tesis de PostLab en un dibujo: ', h('b', null, 'ya no, todavía no'), '. La mitad llena es lo que ya no convence: está completa, pero se ha cerrado. La mitad punteada es lo que todavía no existe: se adivina la forma, pero falta trazarla. Y el borde recto entre las dos es el sitio exacto del prefijo, ese «después» que sabe de dónde viene y aún no sabe adónde va.')),

    h('h2', null, 'Dos niveles'),
    h('p', null, h('b', { style: { color: 'var(--n1)' } }, 'Enterarte'), ' (Explorar, Viajar y Visualizar) es el nivel de la información: lees las fichas, recorres la historia y miras los datos. ',
      h('b', { style: { color: 'var(--n2)' } }, 'Implicarte'), ' (Aprender, Jugar y Pensar y aplicar) es el nivel de la práctica: aprendes herramientas, las pones a prueba y las aplicas a tu propio mundo. El color de cada página te dice en qué nivel estás.'),

    h('h2', null, 'Cuatro ejes'),
    h('p', null, 'Lo que haces en el nivel 2 queda anotado en tu cuaderno, ordenado en cuatro ejes. No son notas ni exámenes: son una manera de ver por dónde vas.'),
    h('ul', null, ORDEN_EJES.map(e => h('li', null, h('b', null, EJES[e].nombre, ': '), EJES[e].sub.toLowerCase(), '. ', h('i', null, EJES[e].pregunta)))),

    h('h2', null, 'Qué hay dentro'),
    h('ul', null,
      h('li', null, `${plural(terms.length, 'término', 'términos')} con su año, su obra o hito, su valor del prefijo, su familia, sus conexiones y sus fuentes.`),
      h('li', null, `${plural(rels.length, 'conexión', 'conexiones')} entre términos y ${plural(hitos.length, 'hito', 'hitos')} con fuente.`),
      h('li', null, 'Para cada término, tres apartados: cómo surgió, para qué sirve (con ejemplos) y qué tiene que ver con hoy, además de un dato curioso y una pregunta para pensar.'),
      h('li', null, 'Treinta episodios de siete tiempos, uno por palabra verificada, cada uno con una historia humana que también abre su ficha.'),
      h('li', null, 'Seis imágenes, una por cada manera de decir «después».'),
      h('li', null, 'Una ruta guiada, las cinco P, un detector de saltos, un glosario, cuatro juegos y seis actividades para pensar y aplicar.')),

    // W18: las capas transversales, a la vista
    h('h2', { id: 'capas' }, 'Ética, inteligencia artificial y entorno'),
    h('h3', null, 'Lo que PostLab no hace y no guarda'),
    h('ul', null,
      h('li', null, 'No tiene cuentas, cookies, analítica ni publicidad, y no recoge datos personales.'),
      h('li', null, 'Tu cuaderno, tus episodios y tus marcas se guardan solo en tu navegador. En el modo clase no se guarda nada.'),
      h('li', null, 'No pone notas a nadie. Los ejes y los peldaños son una manera de ver por dónde vas, no un examen.'),
      h('li', null, 'En grupo se cuentan los votos del grupo, nunca a una persona.'),
      h('li', null, 'No vende nada ni guarda nada a cambio.')),
    h('h3', null, 'Qué se escribió con inteligencia artificial y cómo se revisó'),
    h('p', null, 'Con ayuda de inteligencia artificial se escribieron el diccionario de partida, los apartados de cada ficha y los treinta episodios. Las fichas se revisaron una a una contra fuentes públicas, como se explica más abajo. Los episodios salen de esas fichas verificadas, y cada Giro lleva un hecho con su fuente enlazada. Como con las fichas, una persona revisa una muestra al azar antes de cada publicación.'),
    h('h3', null, 'Con qué grupos se puede usar'),
    h('p', null, 'Con grupos de secundaria, de bachillerato y de universidad, en talleres de asociaciones y clubes, y en grupos de lectura o de conversación. También a solas, sin grupo. Con menores, quien guía conviene que lea antes la ficha de la palabra: algunos episodios tocan temas delicados y por eso van sin reloj.'),

    h('h2', null, 'Cómo se han hecho los datos'),
    h('p', null, 'La base de partida es un diccionario temático de lo post elaborado con ayuda de inteligencia artificial en octubre de 2026. Ese diccionario no estaba verificado, así que cada ficha se ha revisado una a una contra fuentes públicas (enciclopedias académicas, catálogos de bibliotecas y editoriales, artículos y, cuando no había más, Wikipedia). Los núcleos se han redactado de nuevo, sin copiar texto de las fuentes, y los lemas siguen la ortografía de la RAE («pos-», y «post-» solo ante s). La grafía original queda como variante para que se pueda buscar.'),
    h('p', null, 'Los apartados de cada ficha (contexto, ejemplos e implicaciones) se han escrito también con ayuda de inteligencia artificial, con una regla por encima de todas: no incluir nada que no sea seguro. Cuando un ejemplo o un dato no se ha podido confirmar, se ha quitado; por eso algunas fichas tienen cuatro ejemplos en lugar de cinco.'),
    h('p', null, 'La verificación también se ha hecho con ayuda de inteligencia artificial, y una persona revisa una muestra al azar antes de cada publicación. Por eso cada ficha muestra su estado:'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Estado'), h('th', { scope: 'col' }, 'Qué significa'), h('th', { scope: 'col', class: 'num' }, 'Fichas'))),
      h('tbody', null,
        h('tr', null, h('td', null, h('b', null, 'Verificada')), h('td', null, 'El año y la obra coinciden en al menos una fuente fiable: enciclopedia académica, catálogo de biblioteca o editorial, o artículo indexado.'), h('td', { class: 'num' }, n('verificada'))),
        h('tr', null, h('td', null, h('b', null, 'Probable')), h('td', null, 'Solo coinciden fuentes generales, como Wikipedia.'), h('td', { class: 'num' }, n('probable'))),
        h('tr', null, h('td', null, h('b', { style: { color: 'var(--danger)' } }, 'Dudosa')), h('td', null, 'Las fuentes se contradicen o no se ha encontrado fuente. Se marca en rojo y no entra en los juegos.'), h('td', { class: 'num' }, n('dudosa')))))),
    h('p', { class: 'small muted', style: { marginTop: '8px' } }, 'Los años son los de la obra o el hito que fija cada término, no los de su primer uso, que se indica aparte cuando se conoce. Las cifras de Tendencias describen esta selección de términos, no la frecuencia real de uso de cada palabra.'),

    h('h2', null, '¿Has visto un error?'),
    h('p', null, 'Seguro que los hay: hasta los diccionarios tienen fe de erratas. Puedes avisar abriendo una incidencia en ', h('a', { href: 'https://github.com/oasa10/PostLab/issues', rel: 'noopener', target: '_blank' }, 'el repositorio de GitHub'),
      ' (cada ficha tiene su enlace «Avísanos»). Si propones una corrección, añade una fuente.'),

    h('h2', null, 'Descarga los datos'),
    h('p', null, 'Los datos son cuatro tablas CSV en UTF-8, la fuente de verdad del sitio, y un archivo con los episodios:'),
    h('ul', null,
      h('li', null, h('a', { href: 'data/csv/terminos.csv', download: '' }, 'terminos.csv'), ': un término por fila.'),
      h('li', null, h('a', { href: 'data/csv/relaciones.csv', download: '' }, 'relaciones.csv'), ': las conexiones entre términos.'),
      h('li', null, h('a', { href: 'data/csv/hitos.csv', download: '' }, 'hitos.csv'), ': los hitos, incluidos los que aún no tienen fuente y por eso no se muestran.'),
      h('li', null, h('a', { href: 'data/csv/contenido.csv', download: '' }, 'contenido.csv'), ': el contexto, los ejemplos, las implicaciones, el dato curioso y la pregunta de cada ficha.'),
      h('li', null, h('a', { href: 'data/episodios.json', download: '' }, 'episodios.json'), ': los treinta episodios, con sus historias humanas y las fuentes de cada Giro.')),

    h('h2', null, 'Licencias'),
    h('p', null, 'Los datos y los textos de PostLab se publican con la licencia ', h('a', { href: 'https://creativecommons.org/licenses/by/4.0/deed.es', rel: 'license noopener', target: '_blank' }, 'Creative Commons Atribución 4.0 (CC BY 4.0)'),
      ': puedes copiarlos, adaptarlos y usarlos para lo que quieras, también con fines comerciales, siempre que cites la fuente. El código del sitio se publica con la licencia MIT.'),
    h('p', null, 'PostLab usa D3 (licencia ISC), Cytoscape.js (MIT) y Fuse.js (Apache 2.0), y las tipografías Inter y Fraunces (SIL Open Font License). Todo se sirve desde el propio sitio, sin llamadas a terceros.'),

    h('h2', null, 'Quién lo hace'),
    h('p', null, 'PostLab lo hace Osman Salazar. ', h('b', null, 'Hecha con el Método BrainBox.')),

    h('h2', null, 'Cómo citar PostLab'),
    h('p', { class: 'cite' }, `${AUTORIA}. PostLab. Consulta, juega y aprende con todo lo post. Con el Método BrainBox. ${URL_BASE} [consulta: ${hoy}].`),

    h('h2', null, 'Versiones'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Versión'), h('th', { scope: 'col' }, 'Qué trajo'))),
      h('tbody', null,
        h('tr', null, h('td', null, h('b', null, '2.1.1'), h('br'), h('span', { class: 'small muted' }, '15 de octubre de 2026')), h('td', null, '«Escuchar» nuevo: lee párrafo a párrafo, con pausas y marcando lo que suena; eliges la voz (las más naturales primero) y la velocidad, y puedes ir al párrafo anterior o al siguiente, pausar y parar.')),
        h('tr', null, h('td', null, h('b', null, '2.1'), h('br'), h('span', { class: 'small muted' }, 'Octubre de 2026')), h('td', null, 'La promesa, una sola puerta con el episodio del día, el reto con su marcador, el modo clase, una historia humana en treinta fichas, seis imágenes para los seis valores, el botón «Escuchar» y un buscador que baja al resultado.')),
        h('tr', null, h('td', null, h('b', null, '2.0'), h('br'), h('span', { class: 'small muted' }, '12 de octubre de 2026')), h('td', null, 'Fichas con contexto, ejemplos e implicaciones, los dos niveles y tu cuaderno con los cuatro ejes.'))))),
    h('p', { class: 'small muted', style: { marginTop: '8px' } }, 'La versión 2.0 queda entera en el historial del repositorio.'),

    h('h2', null, 'Privacidad'),
    h('p', null, 'PostLab no usa cookies, no tiene analítica ni publicidad y no recoge datos personales. Tu cuaderno, tus episodios, tus marcas en los juegos y el modo claro u oscuro se guardan solo en tu navegador: no viajan a ningún servidor y puedes borrarlos cuando quieras desde ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.'),
  ));
}
