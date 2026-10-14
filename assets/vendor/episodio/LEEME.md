# Episodio en siete tiempos · motor común

Motor sin dependencias y sin servidor que usan las webs del proyecto (BrainBox, PostLab, NeuroLab…). Funciona también dentro de un HTML de doble clic. Todo se guarda solo en el dispositivo (`localStorage`, claves `<sitio>:cuaderno` y `<sitio>:ajustes-episodio`).

## Uso

```html
<link rel="stylesheet" href="episodio.css">
<script src="episodio.js"></script>
<script>
  const ep = Episodio.crear({ sitio: 'postlab', nombre: 'PostLab', episodios: LISTA,
    porDentro: false, grupo: true, demo: true, unoAlDia: true, minutos: 7, alSalir: ep => {} });
  ep.portada(el, { boton, alAbrir, alVolver });   // la puerta: el episodio de hoy y la vuelta pendiente
  ep.abrir(el, id);                               // un episodio; con { grupo: true }, en modo grupo y sin guardar nada
  ep.vuelta(el, idMision);                        // contar cómo fue la misión
  ep.lista(el, { alAbrir });  ep.cuaderno(el, { alVolver, alAbrir });
</script>
```

En modo grupo quien guía puede abrir cualquier episodio, aunque no sea el del día, y no se guarda nada personal.

## Formato de un episodio

| Campo | Qué es |
|---|---|
| `id`, `palabra`, `resumen` | Identificador, la palabra y una línea que la resume |
| `riesgo` | `true` si el tema es delicado: el Reflejo va sin reloj |
| `segundos` | Segundos del Reflejo (5 si no se dice) |
| `choque` | `frase` y `opciones` (`id`, `e` emoji, `t` texto) |
| `reflejo` | `situacion` y `opciones` (`id`, `t`) |
| `giro` | `hecho`, `fuente`, `url`, `busca` (lo que buscaba la frase) y `saltos` (`t`, `p`) |
| `peldano` | `preguntas` (`p`, `o` opciones, `ok` índice, `por`) y `sabias` |
| `mision` | `opciones` (`corta`, `t`, `historia`) y `retorno` |
| `historia` | `pensaba` (por id del choque), `hice` (por id del reflejo, más `tiempo`) y `ahora`, con `{mision}` |
| `vuelta` | `siguiente`: el id del episodio que se abre después |
| `saber_mas` | Lo técnico, plegado en «Saber más» |

Los textos admiten `**negrita**` y `*cursiva*`. Cada web puede añadir sus propios campos (PostLab: `valor`, `termino` e `historia_humana`).
