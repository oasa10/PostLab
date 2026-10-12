# PostLab

**Consulta, juega y aprende con todo lo post.**

PostLab es un repositorio abierto de términos formados con el prefijo *pos-* o *post-*: posmodernidad, posverdad, post-punk, poscolonialismo, posguerra… Cada término tiene su ficha con el año y la obra que lo fijan, el valor del prefijo, su familia, sus conexiones, sus fuentes y su estado de verificación.

Web: https://oasa10.github.io/PostLab/

## Qué se puede hacer

La web tiene dos niveles.

**Enterarte** (nivel 1, para consultar):

- **Explorar**: buscar y filtrar por área, familia, valor del prefijo, grado, década y estado de verificación. Cada ficha explica por qué y cómo surgió el término, cinco ejemplos y qué tiene que ver con hoy.
- **Viajar**: de 1700 a hoy, con las fases de lo post, los hitos y un viaje guiado en seis paradas.
- **Visualizar**: el mapa post-relacional, las tendencias y el pulso de lo post (un cardiograma de términos nuevos por año).

**Implicarte** (nivel 2, para hacer):

- **Aprender**: una ruta de diez paradas con preguntas, los seis valores del prefijo, las cinco P, un detector de saltos, la ley del relevo y un glosario.
- **Jugar**: ¿Qué post es?, Ordena la historia, Seis maneras de decir «después» y ¿Antes o después?
- **Pensar y aplicar**: seis actividades para mirar el presente con lo aprendido: el termómetro (sentir, actuar, pensar), el laboratorio de las cinco P, cazadores de posts, ¿y tú qué harías?, tu relato y bautiza el siguiente post.

Todo lo que se hace en el nivel 2 queda en **Tu cuaderno**, que ordena el recorrido en cuatro ejes (ser, saber, hacer, creer y crear) con insignias. El cuaderno se guarda solo en el navegador de quien lo usa (`localStorage`); no sale de su ordenador.

## Los datos

La fuente de verdad son tres tablas CSV en `data/csv/`:

| Archivo | Contenido |
|---|---|
| `terminos.csv` | Un término por fila. Las listas van separadas por ` ; ` y cada fuente es `título \| url`. |
| `relaciones.csv` | Las conexiones entre términos (origen, destino, tipo). |
| `hitos.csv` | Los hitos. Los que no tienen fuente no se muestran en la web. |
| `contenido.csv` | Los apartados de cada ficha: contexto, cinco ejemplos, implicaciones actuales, un dato curioso y una pregunta. |

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

## Cómo está hecha

Es un sitio estático (HTML, CSS y JavaScript sin compilar), servido con GitHub Pages. No usa cookies, analítica ni servicios de terceros. Las bibliotecas van copiadas en `assets/vendor/` en una versión fija: D3 7.9.0, Cytoscape.js 3.34.3 y Fuse.js 7.5.0.

## Errores y propuestas

Abre una incidencia en https://github.com/oasa10/PostLab/issues. Si propones una corrección, añade una fuente.

## Licencias

- **Datos y textos** (`data/` y los textos del sitio): [Creative Commons Atribución 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.es).
- **Código**: MIT (ver `LICENSE`).
- **Bibliotecas**: D3 (ISC), Cytoscape.js (MIT) y Fuse.js (Apache 2.0); sus licencias están en `assets/vendor/`.
- **Tipografías**: Inter y Fraunces, con la SIL Open Font License 1.1; las licencias están en `assets/fonts/`.

## Cómo se hizo

Los términos salen de un diccionario temático de lo post elaborado con ayuda de inteligencia artificial en octubre de 2026. Cada ficha se verificó después contra fuentes públicas, también con ayuda de inteligencia artificial, y los núcleos se redactaron de nuevo. Una persona revisa una muestra al azar antes de cada publicación.
