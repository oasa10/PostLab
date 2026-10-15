# Lector · el «Escuchar» común

Versión 1.0 (15 de octubre de 2026). Sustituye al «Escuchar» de las cinco webs (BrainBox, curso, PostLab, NeuroLab y CareLab), que leía todo del tirón, con la primera voz que encontraba y sin poder tocar nada. Sin dependencias, sin red y sin servidor: funciona también dentro de un HTML de doble clic.

## Qué hace

- **Lee por segmentos**: cada título, párrafo y punto de una lista es un segmento, con un silencio después (700 ms tras un título, 480 tras un párrafo, 320 tras un punto y 110 entre frases, a velocidad normal). Los títulos van un poco más despacio. El segmento que suena se marca en la página y, si no se ve, la página baja hasta él (salvo que la persona acabe de mover la página).
- **Reproductor** fijo abajo: Anterior, Pausa / Seguir, Siguiente, Parar, una barra para saltar a cualquier párrafo, la velocidad (0,75×, 0,9×, 1×, 1,1×, 1,25× y 1,5×) y la voz. Escape lo para.
- **Voces**: solo las de español, las más naturales primero (Marisol Premium si está; luego las «natural» de Edge, las «premium» y «mejoradas» de Apple, las de Google y las de Android; al final, las básicas y las de broma de Apple). «Automática» elige la mejor. Si una voz falla (por ejemplo, las de Edge o Google sin conexión), sigue con la siguiente y lo dice. Si el dispositivo solo tiene voces básicas, dice cómo conseguir una más natural en ese sistema. Las voces de Siri no están disponibles para las páginas web.
- **Texto**: quita emojis y símbolos, lee «p. ej.» como «por ejemplo», «EE. UU.» como «Estados Unidos», «1990–2026» como «1990 a 2026» y las direcciones web solo por su dominio; no corta frases en «Sr.», «Dra.», «pág.»…; parte las frases de más de 160 caracteres por sus comas (Chrome corta los enunciados largos).
- **Guarda** la voz y la velocidad en el dispositivo (`localStorage`, clave `<sitio>:lector`). Nada más.

## Uso

```html
<link rel="stylesheet" href="lector.css">
<script src="lector.js"></script>
<script>
  Lector.configurar({ sitio: 'postlab', subir: '.toasts', color: '#1D6E74' });  // subir: lo fijo abajo que debe apartarse
  const b = Lector.boton(() => document.querySelectorAll('.leer'), { etiqueta: 'Escuchar la ficha', titulo: 'Posverdad' });
  Lector.enlazar(botonQueYaExiste, nodo, { pintar: (b, on) => {} });  // para un botón que ya está en la página
  Lector.leer(nodo, { excluir: '.pager', leerOculto: '.resto', alLlegar: el => {}, alCambiar: on => {} });
  Lector.parar();
</script>
```

La fuente puede ser un nodo, una lista de nodos, un texto, una lista de textos o una función que devuelva cualquiera de ellos. De cada nodo se leen sus bloques visibles; nunca botones, campos, SVG, lo marcado con `aria-hidden="true"` o `.no-leer`, ni lo plegado en un `<details>` cerrado. `excluir` añade selectores; `leerOculto` lee también lo oculto dentro de esos selectores (en el curso, el resto de «Seguir leyendo», que `alLlegar` despliega al llegar).

Colores: `--lector-ac` (el botón principal y la barra; por defecto, ámbar) y `--lector-marca` (el fondo del segmento que suena).

## Pruebas

Las voces no existen en el navegador sin pantalla, así que se prueba con una voz simulada que cuenta lo que se dice (scratchpad `lector/mock.js` y `prueba*.js`): segmentos, pausas, anterior y siguiente, pausa, velocidad, cambio de voz en marcha, voz que falla, sin voces, el botón que para y la página que se aparta.
