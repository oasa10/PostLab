import { h, plural, cabeza, recuadro } from '../lib.js';
import { EJES, ORDEN_EJES } from '../cuaderno.js';
import { URL_BASE } from './ficha.js';

export function render(root, ctx) {
  document.title = 'Conocer PostLab · PostLab';
  const { terms, hitos, rels } = ctx;
  const n = e => terms.filter(t => t.estado === e).length;
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  root.append(h('div', { style: { maxWidth: '760px' } },
    cabeza(0, 'Conocer PostLab', 'PostLab es un laboratorio abierto de lo post: los términos que llevan el prefijo pos- o post-, desde la posguerra hasta la posverdad, contados de forma clara y con sus fuentes a la vista.'),
    h('p', null, 'Está pensado para cualquier persona con curiosidad, para estudiantes y docentes de bachillerato y universidad, y para periodistas. No hace falta saber filosofía: hace falta querer entender un poco mejor la época en que vivimos.'),

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
      h('li', null, 'Una ruta guiada, las cinco P, un detector de saltos, un glosario, cuatro juegos y seis actividades para pensar y aplicar.')),

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
    h('p', null, 'Los datos son cuatro tablas CSV en UTF-8, la fuente de verdad del sitio:'),
    h('ul', null,
      h('li', null, h('a', { href: 'data/csv/terminos.csv', download: '' }, 'terminos.csv'), ': un término por fila.'),
      h('li', null, h('a', { href: 'data/csv/relaciones.csv', download: '' }, 'relaciones.csv'), ': las conexiones entre términos.'),
      h('li', null, h('a', { href: 'data/csv/hitos.csv', download: '' }, 'hitos.csv'), ': los hitos, incluidos los que aún no tienen fuente y por eso no se muestran.'),
      h('li', null, h('a', { href: 'data/csv/contenido.csv', download: '' }, 'contenido.csv'), ': el contexto, los ejemplos, las implicaciones, el dato curioso y la pregunta de cada ficha.')),

    h('h2', null, 'Licencias'),
    h('p', null, 'Los datos y los textos de PostLab se publican con la licencia ', h('a', { href: 'https://creativecommons.org/licenses/by/4.0/deed.es', rel: 'license noopener', target: '_blank' }, 'Creative Commons Atribución 4.0 (CC BY 4.0)'),
      ': puedes copiarlos, adaptarlos y usarlos para lo que quieras, también con fines comerciales, siempre que cites la fuente. El código del sitio se publica con la licencia MIT.'),
    h('p', null, 'PostLab usa D3 (licencia ISC), Cytoscape.js (MIT) y Fuse.js (Apache 2.0), y las tipografías Inter y Fraunces (SIL Open Font License). Todo se sirve desde el propio sitio, sin llamadas a terceros.'),

    h('h2', null, 'Cómo citar PostLab'),
    h('p', { class: 'cite' }, `PostLab. Consulta, juega y aprende con todo lo post (2026). ${URL_BASE} [consulta: ${hoy}].`),

    h('h2', null, 'Privacidad'),
    h('p', null, 'PostLab no usa cookies, no tiene analítica ni publicidad y no recoge datos personales. Tu cuaderno, tus marcas en los juegos y el modo claro u oscuro se guardan solo en tu navegador: no viajan a ningún servidor y puedes borrarlos cuando quieras desde ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.'),
  ));
}
