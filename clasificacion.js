// Lógica de resultados y ordenación. Los números base los calcula la vista SQL
// "clasificacion"; aquí solo se aplica el orden configurable y el historial.

export function resumenPartido(p) {
  const sets = (p.sets || []).slice().sort((a, b) => a.numero - b.numero);
  let sa = 0, sb = 0, ja = 0, jb = 0;
  for (const s of sets) {
    ja += s.juegos_a; jb += s.juegos_b;
    if (s.juegos_a > s.juegos_b) sa++;
    else if (s.juegos_b > s.juegos_a) sb++;
  }
  const ganador = p.estado === 'jugado' && sa !== sb ? (sa > sb ? 'a' : 'b') : null;
  return { sets, sa, sb, ja, jb, ganador };
}

export function historialPareja(id, partidos, jornadas) {
  const porId = new Map(jornadas.map((j) => [j.id, j]));
  return partidos
    .filter((p) => p.estado === 'jugado' && (p.pareja_a === id || p.pareja_b === id))
    .map((p) => {
      const r = resumenPartido(p);
      const esA = p.pareja_a === id;
      return {
        partido: p,
        jornada: porId.get(p.jornada_id)?.numero ?? 0,
        rival: esA ? p.pareja_b : p.pareja_a,
        propios: esA ? r.sa : r.sb,
        ajenos: esA ? r.sb : r.sa,
        sets: r.sets.map((s) => (esA ? [s.juegos_a, s.juegos_b] : [s.juegos_b, s.juegos_a])),
        ganado: r.ganador === (esA ? 'a' : 'b'),
      };
    })
    .sort((x, y) => x.jornada - y.jornada);
}

export function ordenarClasificacion(filas, partidos, jornadasActivas, criterios = []) {
  const directo = (a, b) => {
    let ganA = 0, ganB = 0;
    for (const p of partidos) {
      if (p.estado !== 'jugado' || !jornadasActivas.has(p.jornada_id)) continue;
      const cruce = (p.pareja_a === a && p.pareja_b === b) || (p.pareja_a === b && p.pareja_b === a);
      if (!cruce) continue;
      const r = resumenPartido(p);
      if (!r.ganador) continue;
      const idGanador = r.ganador === 'a' ? p.pareja_a : p.pareja_b;
      if (idGanador === a) ganA++; else ganB++;
    }
    return ganA - ganB;
  };
  const claves = {
    dif_sets: (x, y) => y.dif_sets - x.dif_sets,
    dif_juegos: (x, y) => y.dif_juegos - x.dif_juegos,
    sets_favor: (x, y) => y.sets_favor - x.sets_favor,
    juegos_favor: (x, y) => y.juegos_favor - x.juegos_favor,
    enfrentamiento: (x, y) => directo(y.pareja_id, x.pareja_id),
  };
  return [...filas]
    .sort((x, y) => {
      if (y.puntos !== x.puntos) return y.puntos - x.puntos;
      for (const c of criterios) {
        const f = claves[c];
        if (f) { const r = f(x, y); if (r) return r; }
      }
      return x.nombre.localeCompare(y.nombre, 'es');
    })
    .map((f, i) => ({ ...f, pos: i + 1 }));
}
