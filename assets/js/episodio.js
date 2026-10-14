// El episodio del día: une el motor común de las webs del proyecto (assets/vendor/episodio) con PostLab.
// Todo se guarda solo en este navegador, con la clave «postlab:cuaderno» del motor.
let motor = null, porTermino = null;

export async function episodios(ctx) {
  const lista = await ctx.episodios();
  if (!porTermino) porTermino = new Map(lista.map(e => [e.termino, e]));
  return lista;
}

// El episodio que corresponde a un término, si lo tiene (para la historia humana de la ficha)
export async function deTermino(ctx, id) {
  await episodios(ctx);
  return porTermino.get(id) || null;
}

export async function obtener(ctx) {
  if (motor) return motor;
  const datos = await episodios(ctx);
  if (!window.Episodio) throw new Error('Falta el motor del episodio');
  motor = window.Episodio.crear({
    sitio: 'postlab', nombre: 'PostLab', episodios: datos,
    porDentro: false, grupo: true, demo: true, unoAlDia: true, minutos: 7,
    // al terminar: desde el episodio, a la ficha (primero el juego, después la enciclopedia); desde la vuelta, al cuaderno
    alSalir: ep => {
      const ruta = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
      if (ruta === 'vuelta') location.hash = '#/cuaderno';
      else if (ruta === 'clase') location.hash = '#/clase';
      else location.hash = `#/termino/${encodeURIComponent(ep.termino)}?tras=episodio`;
    },
  });
  return motor;
}
