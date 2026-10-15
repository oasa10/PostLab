# PostLab

**El mundo cambia antes de que entendamos qué cambia. PostLab te da las palabras para nombrarlo.**

*Ya no, todavía no.*

PostLab es un repositorio abierto de términos formados con el prefijo *pos-* o *post-*: posmodernidad, posverdad, post-punk, poscolonialismo, posguerra… Cada término tiene su ficha con el año y la obra que lo fijan, el valor del prefijo, su familia, sus conexiones, sus fuentes y su estado de verificación.

Web: https://oasa10.github.io/PostLab/

## Qué se puede hacer

Se entra por una sola puerta: **el episodio de hoy**, una palabra en siete tiempos y unos siete minutos (Choque, Reflejo, Giro, Peldaño, Misión, Tu historia y Vuelta). Hay treinta episodios, uno nuevo al día, sobre palabras verificadas; cada uno tiene una historia humana que también abre la ficha de su palabra. Junto a la puerta están el reto **¿Qué post es?**, con tu marca y tu peldaño, y el **modo clase** (`#/clase`): quien enseña elige cualquiera de las treinta palabras, la proyecta y el grupo vota sin nombres, con la ficha como guion. En modo clase no se guarda nada.

Debajo, todo lo demás, en dos niveles.

**Enterarte** (nivel 1, para consultar):

- **Explorar**: buscar y filtrar por área, familia, valor del prefijo, grado, década y estado de verificación. Cada ficha explica por qué y cómo surgió el término, cinco ejemplos y qué tiene que ver con hoy.
- **Viajar**: de 1700 a hoy, con las fases de lo post, los hitos y un viaje guiado en seis paradas.
- **Visualizar**: el mapa post-relacional, las tendencias y el pulso de lo post (un cardiograma de términos nuevos por año).

**Implicarte** (nivel 2, para hacer):

- **Aprender**: una ruta de diez paradas con preguntas, los seis valores del prefijo, las cinco P, un detector de saltos, la ley del relevo y un glosario.
- **Jugar**: ¿Qué post es?, Ordena la historia, Seis maneras de decir «después» y ¿Antes o después?
- **Pensar y aplicar**: seis actividades para mirar el presente con lo aprendido: el termómetro (sentir, actuar, pensar), el laboratorio de las cinco P, cazadores de posts, ¿y tú qué harías?, tu relato y bautiza el siguiente post.

Todo lo que se hace en el nivel 2 queda en **Tu cuaderno**, que ordena el recorrido en cuatro ejes (ser, saber, hacer, creer y crear) con insignias, y que guarda también los episodios: palabras, misiones, vueltas e historias. El cuaderno se guarda solo en el navegador de quien lo usa (`localStorage`); no sale de su ordenador.

Cada ficha y cada pregunta del reto llevan una de las seis imágenes de los valores del prefijo, y las fichas y los episodios tienen un botón **Escuchar** que usa la voz del dispositivo.

## Los datos

La fuente de verdad son tres tablas CSV en `data/csv/`:

| Archivo | Contenido |
|---|---|
| `terminos.csv` | Un término por fila. Las listas van separadas por ` ; ` y cada fuente es `título \| url`. |
| `relaciones.csv` | Las conexiones entre términos (origen, destino, tipo). |
| `hitos.csv` | Los hitos. Los que no tienen fuente no se muestran en la web. |
| `contenido.csv` | Los apartados de cada ficha: contexto, cinco ejemplos, implicaciones actuales, un dato curioso y una pregunta. |

Los treinta episodios están en `data/episodios.json`. Salen de las fichas verificadas, y cada Giro lleva un hecho con su fuente.

Estados de verificación:

- **verificada**: el año y la obra coinciden en al menos una fuente fiable (enciclopedia académica, catálogo de biblioteca o editorial, artículo indexado);
- **probable**: solo coinciden fuentes generales;
- **dudosa**: las fuentes se contradicen o no hay fuente. Se marca en rojo y no entra en los juegos.

Para regenerar los JSON que lee la web después de editar un CSV:

```sh
python3 tools/build_data.py      # necesita numpy para calcular las posiciones del mapa
python3 tools/aprender_src.py    # textos de la sección Aprender
python3 tools/pensar_src.py      # textos de Pensar y aplicar
```

## Ver la web en tu ordenador

```sh
python3 -m http.server 8000
```

y abre http://localhost:8000.

O, sin servidor ni conexión, genera la web entera en un solo archivo y ábrelo con doble clic:

```sh
python3 tools/build_html.py      # crea dist/PostLab.html
```

## Cómo está hecha

Es un sitio estático (HTML, CSS y JavaScript sin compilar), servido con GitHub Pages. No usa cookies, analítica ni servicios de terceros. Las bibliotecas van copiadas en `assets/vendor/` en una versión fija: D3 7.9.0, Cytoscape.js 3.34.3 y Fuse.js 7.5.0. El episodio usa un motor común a las webs del proyecto, sin dependencias, en `assets/vendor/episodio/`.

Hecha con el Método BrainBox.

## Errores y propuestas

Abre una incidencia en https://github.com/oasa10/PostLab/issues. Si propones una corrección, añade una fuente.

## Licencias

- **Datos y textos** (`data/` y los textos del sitio): [Creative Commons Atribución 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.es).
- **Código**: MIT (ver `LICENSE`), también el del motor del episodio.
- **Bibliotecas**: D3 (ISC), Cytoscape.js (MIT) y Fuse.js (Apache 2.0); sus licencias están en `assets/vendor/`.
- **Tipografías**: Inter y Fraunces, con la SIL Open Font License 1.1; las licencias están en `assets/fonts/`.

## Cómo se hizo

Los términos salen de un diccionario temático de lo post elaborado con ayuda de inteligencia artificial en octubre de 2026. Cada ficha se verificó después contra fuentes públicas, también con ayuda de inteligencia artificial, y los núcleos se redactaron de nuevo. Los episodios se escribieron también con ayuda de inteligencia artificial a partir de las fichas verificadas. Una persona revisa una muestra al azar antes de cada publicación.

## Versiones

- **2.1.1** (15 de octubre de 2026): «Escuchar» nuevo, con el Lector común: lee párrafo a párrafo, con pausas y marcando lo que suena; eliges la voz (las más naturales primero) y la velocidad, y puedes ir al párrafo anterior o al siguiente, pausar y parar.
- **2.1** (octubre de 2026): la promesa, el episodio del día, el reto con su marcador, el modo clase, las historias humanas, las seis imágenes, «Escuchar», el buscador que baja al resultado y el HTML de doble clic.
- **2.0** (12 de octubre de 2026): fichas con contexto, ejemplos e implicaciones, los dos niveles y Tu cuaderno.

## Cómo citar

Salazar, Osman (2026). *PostLab. Consulta, juega y aprende con todo lo post*. Con el Método BrainBox. https://oasa10.github.io/PostLab/
