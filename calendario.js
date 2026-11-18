// Todos contra todos (método del círculo). Con número impar, una pareja descansa cada jornada.
export function todosContraTodos(ids) {
  const t = [...ids];
  if (t.length % 2) t.push(null);
  const n = t.length;
  const rondas = [];
  for (let r = 0; r < n - 1; r++) {
    const ronda = [];
    for (let i = 0; i < n / 2; i++) {
      const a = t[i], b = t[n - 1 - i];
      if (a && b) ronda.push(r % 2 ? [b, a] : [a, b]);
    }
    rondas.push(ronda);
    t.splice(1, 0, t.pop());
  }
  return rondas;
}
