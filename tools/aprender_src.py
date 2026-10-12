"""Fuente del contenido de la sección Aprender. Genera data/aprender.json.

Uso: python3 tools/aprender_src.py
"""
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ruta = [
  {"anio": "1703", "titulo": "Un después teológico",
   "texto": "El clérigo inglés Daniel Whitby sistematiza el posmilenarismo: la idea de que Cristo volverá después de un milenio de paz en la Tierra. Es el término post más antiguo de PostLab. Aquí el prefijo no juzga nada: solo ordena en el tiempo dos acontecimientos. Es el valor más sencillo, P1, «después de».",
   "terminos": ["posmilenarismo"], "valor": "P1"},
  {"anio": "1910", "titulo": "El primer movimiento con prefijo",
   "texto": "Roger Fry reúne en Londres a Cézanne, Gauguin y Van Gogh en la exposición «Manet and the Post-Impressionists». El nombre no dice qué tienen en común esos pintores, solo que vienen después del impresionismo y lo llevan más lejos (P3). Ya aparece el rasgo que se repetirá durante un siglo: el rótulo nombra lo que se deja atrás, no lo que llega.",
   "terminos": ["postimpresionismo"], "valor": "P3"},
  {"anio": "1917–1934", "titulo": "Tres fechas para «posmoderno»",
   "texto": "Rudolf Pannwitz escribe «hombre posmoderno» en 1917. En 1934 Federico de Onís llama «postmodernismo» a la poesía hispánica que reacciona contra el modernismo de Rubén Darío. El sentido filosófico llegará con Lyotard en 1979. Una misma palabra tiene un primer uso, una primera corriente y una obra que fija su sentido actual: conviene no confundirlos.",
   "terminos": ["postmodernismo-hispanico", "posmodernidad-posmodernismo-filosofico"], "valor": "P3"},
  {"anio": "1945", "titulo": "Una vanguardia en Madrid",
   "texto": "Eduardo Chicharro, Carlos Edmundo de Ory y Silvano Sernesi lanzan la revista Postismo. A diferencia de muchos rótulos posteriores, este es una autodenominación: sus autores lo eligieron para sí. El prefijo funciona como bandera de grupo y como broma a la vez.",
   "terminos": ["postismo"], "valor": "P3"},
  {"anio": "1966", "titulo": "Empieza la eclosión",
   "texto": "Jacques Derrida lee en Baltimore la conferencia que se suele tomar como arranque del posestructuralismo, y Robert Venturi publica Complexity and Contradiction in Architecture. Entre 1966 y 1994 el prefijo se convierte en la forma estándar de nombrar teorías nuevas. En esta fase domina la ruptura (P2): el post se usa sobre todo para decir contra qué se está.",
   "terminos": ["postestructuralismo", "arquitectura-posmoderna"], "valor": "P2"},
  {"anio": "1973", "titulo": "Después de la industria",
   "texto": "Daniel Bell publica The Coming of Post-Industrial Society: el conocimiento teórico y los servicios pasan a ocupar el lugar central que tenía la fábrica. El título dice qué deja de mandar, pero no qué manda ahora. Es uno de los post de la economía con más base empírica, y prepara el terreno al posfordismo.",
   "terminos": ["sociedad-postindustrial", "posfordismo"], "valor": "P1"},
  {"anio": "1979", "titulo": "La condición posmoderna",
   "texto": "Jean-François Lyotard escribe un informe para el Consejo de Universidades de Quebec y define lo posmoderno como incredulidad ante los grandes relatos que daban sentido al saber. El libro fija el sentido filosófico del término y lo convierte en el gran rótulo de una época. Combina la ruptura (P2) con el diagnóstico de un vaciamiento (P4).",
   "terminos": ["posmodernidad-posmodernismo-filosofico", "posmarxismo"], "valor": "P2"},
  {"anio": "1989–1991", "titulo": "El tiempo de los finales",
   "texto": "Francis Fukuyama publica «The End of History?» en 1989 y en 1991 se disuelve la Unión Soviética. El prefijo anuncia finales (P5, poshistoria) y, a la vez, ordena el mapa de lo que viene (P1, posguerra fría y espacio postsoviético). Pocas veces un después se ha dicho con tanta seguridad.",
   "terminos": ["posthistoria", "posguerra-fria", "postsovietico"], "valor": "P5"},
  {"anio": "2004–2016", "titulo": "Del post que rompe al post que lamenta",
   "texto": "Colin Crouch publica Post-Democracy y Ralph Keyes, The Post-Truth Era, ambos en 2004; en 2016 «post-truth» es la palabra del año de Oxford. El prefijo ya no promete nada: constata que algo sigue ahí, pero vaciado (P4). La democracia no ha desaparecido ni la verdad tampoco; lo que han perdido es autoridad.",
   "terminos": ["posdemocracia", "posverdad", "pospolitica"], "valor": "P4"},
  {"anio": "2023–2024", "titulo": "Parodia y técnica",
   "texto": "El proyecto POSTPOSTPOST publica un libro (2023) y una película (2024) que apilan el prefijo tres veces como gesto irónico. Ese mismo 2024 el NIST aprueba los primeros estándares de criptografía poscuántica, donde el prefijo vuelve a fechar sin juzgar (P1). Queda una pregunta abierta: ¿cómo se llamará lo que venga después de la posverdad?",
   "terminos": ["postpostpost", "criptografia-postcuantica", "post-posmodernismo"], "valor": "P4"},
]

ejemplos = {
  "P1": ["posguerra", "postsovietico", "criptografia-postcuantica"],
  "P2": ["postpositivismo", "postdesarrollo", "poscolonialismo"],
  "P3": ["postestructuralismo", "postkeynesianismo", "postimpresionismo"],
  "P4": ["posdemocracia", "pospolitica", "posverdad"],
  "P5": ["posthistoria", "postideologia-fin-de-las-ideologias", "posthumanismo"],
  "P6": ["post-punk", "post-rock", "postminimalismo"],
}

cincop = {
  "intro": "Cinco preguntas para leer cualquier término post sin dar saltos. Las dos primeras salen del propio nombre; las tres últimas obligan a ir a la obra.",
  "preguntas": [
    {"p": "Partida", "q": "¿Después de qué?", "ej": "De la verdad, o de los hechos comprobados, como árbitros del debate público."},
    {"p": "Prefijo", "q": "¿Qué valor tiene?", "ej": "P4, agotamiento («lo que queda de»). No es P1: no dice que vivamos después de la verdad."},
    {"p": "Pérdida", "q": "¿Qué pierde autoridad, y ante quién?", "ej": "El hecho comprobado pierde peso frente a la emoción y la creencia, ante el público de los medios y las redes."},
    {"p": "Propuesta", "q": "¿Qué pone en su lugar, y con qué nombre?", "ej": "Nada. El término diagnostica, no propone; por eso es P4."},
    {"p": "Prudencia", "q": "¿Qué no se sigue de ahí?", "ej": "No se sigue que no haya verdad ni que todo sea opinión (saltos S1 y S3). Sí se sigue que hay que estudiar por qué los hechos pesan menos."},
  ],
  "ejemplo": "posverdad",
}

saltos = [
  {"id": "S1", "nombre": "Del prefijo a la tesis", "forma": "«Es post-X, luego X terminó o era falso.»", "ejemplo": "«Poscolonial» no prueba que terminara la dominación colonial; «poshumanismo» no anuncia que desaparezcan los humanos.", "sigue": "Que alguien cuestiona la autoridad de X; queda por ver qué cuestiona y con qué pruebas."},
  {"id": "S2", "nombre": "Del origen a la falsedad", "forma": "«Tiene historia, o la impulsó un grupo interesado, luego es falso.»", "ejemplo": "Una clasificación médica nacida en un contexto colonial no es falsa por eso.", "sigue": "Que conviene examinar sus sesgos."},
  {"id": "S3", "nombre": "De la mediación al «todo vale»", "forma": "«Todo conocimiento está mediado y hay muchas perspectivas, luego cualquier interpretación vale.»", "ejemplo": "Si un sensor está mal calibrado, que quienes lo leen se pongan de acuerdo no vuelve correcta la medida.", "sigue": "Que hay que comparar perspectivas con criterios."},
  {"id": "S4", "nombre": "De la contingencia a la facilidad", "forma": "«Pudo ser de otro modo, luego es fácil cambiarlo.»", "ejemplo": "Una presa, una deuda o una extinción pudieron no ocurrir, y aun así hoy son difíciles de deshacer.", "sigue": "Que en principio se puede cambiar, con costes."},
  {"id": "S5", "nombre": "De la contingencia a la política", "forma": "«No hay fundamento último, luego mi proyecto (o la democracia) está justificado.»", "ejemplo": "Un orden opresivo también puede reconocer que sus instituciones son históricas y modificables.", "sigue": "Que la política necesita razones normativas propias."},
  {"id": "S6", "nombre": "De la eficacia a la legitimidad", "forma": "«Funciona, luego es justo.»", "ejemplo": "Una administración puede saber con precisión cómo someter a una población.", "sigue": "Que la justicia se juzga aparte."},
  {"id": "S7", "nombre": "Del consenso a la verdad", "forma": "«Lo decidimos entre todos, luego es verdad.»", "ejemplo": "Una decisión muy participativa puede basarse en un dato falso.", "sigue": "Que una decisión puede ser legítima y a la vez errónea."},
  {"id": "S8", "nombre": "De la causa a la culpa", "forma": "«Todos participamos en el efecto, luego todos somos igual de responsables.»", "ejemplo": "Repartir la causa de un daño no reparte por igual la obligación de repararlo.", "sigue": "Que la responsabilidad se asigna según capacidades y relaciones."},
]

detector = [
  {"frase": "Vivimos en la era de la posverdad, así que ya no hay hechos: cada cual tiene los suyos.", "salto": "S1", "explica": "«Posverdad» dice que los hechos pesan menos en el debate público, no que hayan desaparecido. Del prefijo no se sigue la tesis (y el «cada cual tiene los suyos» añade el salto S3)."},
  {"frase": "Si existe una teoría poscolonial, es que el colonialismo ya terminó.", "salto": "S1", "explica": "El prefijo de «poscolonial» señala que se cuestiona la herencia colonial, no que esa herencia haya acabado."},
  {"frase": "Esta clasificación de enfermedades nació en un contexto colonial; por tanto, es falsa.", "salto": "S2", "explica": "Un origen sospechoso obliga a revisar los sesgos, pero no decide por sí solo si algo es verdadero o falso."},
  {"frase": "Todo conocimiento depende de un punto de vista, así que cualquier lectura de este termómetro vale lo mismo.", "salto": "S3", "explica": "Que haya perspectivas no las iguala: unas lecturas están mejor calibradas que otras, y eso se puede comprobar."},
  {"frase": "Las fronteras actuales pudieron trazarse de otra manera; cambiarlas mañana será sencillo.", "salto": "S4", "explica": "Lo contingente puede ser muy rígido: que algo pudiera ser distinto no dice nada del coste de cambiarlo hoy."},
  {"frase": "Como ningún orden político tiene un fundamento último, mi proyecto político queda justificado.", "salto": "S5", "explica": "La falta de fundamento último vale para todos los proyectos por igual. Justificar uno exige razones propias."},
  {"frase": "El algoritmo predice muy bien el gasto sanitario de cada paciente; por tanto, es justo usarlo para decidir quién necesita más cuidados.", "salto": "S6", "explica": "Predecir bien una variable (el gasto) no justifica decidir sobre otra (la necesidad). Es el caso que Obermeyer y su equipo analizaron en Science en 2019."},
  {"frase": "Lo hemos votado entre todos, así que el dato en el que nos basamos es verdadero.", "salto": "S7", "explica": "El acuerdo puede hacer legítima una decisión, pero no convierte en verdadero un dato falso."},
  {"frase": "Todos hemos contribuido a contaminar el río; por tanto, todos debemos pagar lo mismo por limpiarlo.", "salto": "S8", "explica": "Que todos seamos parte de la causa no reparte la responsabilidad a partes iguales: cuentan la capacidad y la contribución de cada uno."},
  {"frase": "Lyotard habla de incredulidad ante los grandes relatos; entonces conviene preguntar qué relatos pierden crédito y ante quién.", "salto": None, "explica": "Se sigue: es justo la pregunta de la pérdida, la tercera de las cinco P."},
  {"frase": "Si una teoría nació en un contexto de dominación, conviene examinar qué sesgos puede arrastrar.", "salto": None, "explica": "Se sigue: el origen no decide la verdad, pero sí justifica revisar con más cuidado."},
  {"frase": "Si el orden actual es contingente, en principio podría cambiarse, aunque tenga costes.", "salto": None, "explica": "Se sigue: es la conclusión modesta que sí autoriza la contingencia."},
  {"frase": "Una decisión puede ser legítima, porque se tomó bien, y a la vez errónea, porque se basó en un dato falso.", "salto": None, "explica": "Se sigue: separar legitimidad y verdad es justo lo que evita el salto S7."},
]

relevo = {
  "ley": "Cuando un post se institucionaliza (entra en el canon universitario, en un manual o en la ortodoxia de un departamento), deja de romper y genera su propio sucesor. Ese sucesor casi nunca se llama post-post: prefiere un nombre nuevo, con un prefijo o un adjetivo que sí dice hacia dónde va.",
  "prefijos": [
    {"prefijo": "meta-", "termino": "metamodernismo", "autor": "Vermeulen y Van den Akker (2010)", "propone": "Oscilar entre la ironía y el entusiasmo"},
    {"prefijo": "hiper-", "termino": "hipermodernidad", "autor": "Lipovetsky (2004)", "propone": "Una modernidad intensificada, no superada"},
    {"prefijo": "alter-", "termino": "altermodernidad", "autor": "Bourriaud (2009)", "propone": "Una modernidad de traducciones y viajes"},
    {"prefijo": "trans-", "termino": "transmodernidad", "autor": "Rodríguez Magda; Dussel", "propone": "Atravesar la modernidad desde sus márgenes"},
    {"prefijo": "digi-", "termino": "digimodernismo", "autor": "Kirby (2009)", "propone": "La cultura que nace de lo digital"},
    {"prefijo": "nuevo", "termino": "nueva sinceridad, nuevos materialismos", "autor": "Wallace; Barad, Bennett, Braidotti", "propone": "Volver a lo real, a la materia y al afecto"},
  ],
  "recorridos": [
    {"familia": "Arqueología", "heredado": "Arqueología procesual (años sesenta)", "post": "Posprocesualismo (Hodder)", "inst": "Ortodoxia en los años noventa", "relevo": "Arqueología simétrica (2003–2012)"},
    {"familia": "Modernidad", "heredado": "Modernidad y vanguardias", "post": "Posmodernidad (Lyotard, 1979; Jameson, 1984)", "inst": "Canon universitario en los noventa", "relevo": "Metamodernismo, hipermodernidad, altermodernidad"},
    {"familia": "Verdad", "heredado": "Los hechos como árbitros del debate público", "post": "Posverdad (1992; 2004; palabra del año en 2016)", "inst": "Tema de manual y de política pública", "relevo": "Sin nombre todavía"},
  ],
  "parodia": "POSTPOSTPOST es el único post-post-post documentado, y no es una corriente académica, sino un proyecto editorial y artístico fundado por Al Hassan Elwan, con un libro (2023) y una película (2024). Se presenta como el «rechazo del rechazo» del posmodernismo y trabaja con la ironía sobre la ironía. Apilado tres veces, el prefijo ya no nombra un concepto: es un gesto.",
}

glosario = [
  ["Término post", "Rótulo formado con pos- o post- que nombra una corriente, una escuela, un periodo o una condición, y que tiene un uso publicado y atribuible."],
  ["Base", "Lo que viene «después»: la modernidad en posmodernidad, la verdad en posverdad, la guerra en posguerra."],
  ["Valor del prefijo", "Qué clase de «después» expresa el prefijo. PostLab distingue seis: cronológico, ruptura, radicalización, agotamiento, fin y derivación (P1 a P6)."],
  ["Registro débil y registro fuerte", "P1 y P6 solo ordenan en el tiempo o en una familia, sin juzgar (registro débil). De P2 a P5 el prefijo emite un juicio sobre lo heredado (registro fuerte)."],
  ["Grado", "Cuántas veces se apila el prefijo: primero (post), segundo (post-post) o tercero (post-post-post)."],
  ["Primer uso", "La primera vez documentada que aparece la palabra. No coincide necesariamente con la obra que fija su sentido."],
  ["Obra que fija el término", "El libro, el artículo, la exposición o el hito a partir del cual el término se usa con su sentido actual. Es el año que PostLab muestra."],
  ["Estatuto del rótulo", "Quién puso el nombre: sus propios autores (autodenominación), otros críticos o académicos (recepción) o una mirada retrospectiva (agrupación)."],
  ["Familia", "Grupo de términos que comparten una base parecida: la modernidad, el lenguaje, la colonia, la economía, la política, lo humano, las creencias, los estilos o las épocas."],
  ["Homonimia", "Cuando una misma forma nombra cosas distintas, como el poshumanismo crítico y lo poshumano transhumanista."],
  ["Ley del relevo", "Cuando un post se institucionaliza, su sucesor suele preferir un nombre nuevo (meta-, hiper-, alter-, trans-) en lugar de post-post."],
  ["Metarrelato", "Gran relato que daba sentido y legitimidad al saber o a la historia, como el progreso o la emancipación. Lyotard describió lo posmoderno como incredulidad ante ellos."],
  ["Cinco P", "Partida, prefijo, pérdida, propuesta y prudencia: cinco preguntas para leer cualquier término post sin dar saltos."],
  ["Salto", "Inferencia que el prefijo invita a hacer pero que no se sigue, como pasar de «después de la verdad» a «no hay verdad». PostLab reúne ocho."],
  ["Contingencia", "Que un orden pudo ser distinto. No implica que hoy sea fácil cambiarlo ni dice qué alternativa sería mejor."],
  ["Falibilidad", "La posibilidad de equivocarse y de corregir parte del error. No obliga a dudar de todo a la vez."],
  ["Autoridad epistémica", "Competencia reconocida en un campo del saber. No da poder para decidir ni protege frente a objeciones."],
  ["Objetividad", "Orientación al objeto con procedimientos capaces de detectar errores. El consenso por sí solo no la garantiza."],
  ["Justificación y verdad", "Tener buenas razones no es lo mismo que acertar: puede haber creencias justificadas que resulten falsas."],
  ["Influencia y afinidad", "La influencia exige pruebas de que una idea pasó de un autor a otro; la afinidad es un parecido que reconstruye quien compara."],
  ["Periodización", "Etiqueta que divide la historia en etapas, como posguerra o era posclásica. En PostLab entra cuando ordena historiografías enteras."],
  ["Estado de verificación", "Verificada: una fuente fiable confirma el año y la obra. Probable: solo coinciden fuentes generales. Dudosa: las fuentes se contradicen o no hay fuente."],
]

json.dump({"ruta": ruta, "ejemplos": ejemplos, "cincop": cincop, "saltos": saltos, "detector": detector, "relevo": relevo, "glosario": glosario},
          open(os.path.join(R, 'data', 'aprender.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('aprender.json:', len(ruta), 'paradas,', len(detector), 'frases del detector,', len(glosario), 'entradas del glosario')
