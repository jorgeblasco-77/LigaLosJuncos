// Pruebas de la lógica pura (clasificación, resultados, calendario).
// Ejecutar con: npm test  (requiere Node 22 o superior)
import test from 'node:test';
import assert from 'node:assert/strict';
import { ordenarClasificacion, resumenPartido, historialPareja } from '../lib/clasificacion.js';
import { todosContraTodos } from '../lib/calendario.js';

const fila = (id, nombre, o = {}) => ({ pareja_id: id, nombre, pj: 0, pg: 0, pp: 0, puntos: 0, sets_favor: 0, sets_contra: 0, juegos_favor: 0, juegos_contra: 0, dif_sets: 0, dif_juegos: 0, ...o });
const partido = (id, a, b, sets, estado = 'jugado', jornada_id = 'j1') => ({
  id, jornada_id, pareja_a: a, pareja_b: b, estado,
  sets: sets.map(([ja, jb], i) => ({ numero: i + 1, juegos_a: ja, juegos_b: jb })),
});

test('resumenPartido: 2-1 gana A', () => {
  const r = resumenPartido(partido('p', 'A', 'B', [[6, 4], [3, 6], [6, 2]]));
  assert.deepEqual([r.sa, r.sb, r.ja, r.jb, r.ganador], [2, 1, 15, 12, 'a']);
});

test('resumenPartido: pendiente no tiene ganador', () => {
  assert.equal(resumenPartido(partido('p', 'A', 'B', [], 'pendiente')).ganador, null);
});

test('orden por puntos y luego diferencia de sets', () => {
  const f = [fila('A', 'A', { puntos: 3, dif_sets: 1 }), fila('B', 'B', { puntos: 3, dif_sets: 2 }), fila('C', 'C', { puntos: 6 })];
  const o = ordenarClasificacion(f, [], new Set(), ['dif_sets', 'dif_juegos']);
  assert.deepEqual(o.map((x) => x.nombre), ['C', 'B', 'A']);
  assert.deepEqual(o.map((x) => x.pos), [1, 2, 3]);
});

test('el criterio configurable cambia el orden (juegos antes que sets)', () => {
  const f = [fila('A', 'A', { puntos: 3, dif_sets: 2, dif_juegos: 1 }), fila('B', 'B', { puntos: 3, dif_sets: 1, dif_juegos: 9 })];
  assert.equal(ordenarClasificacion(f, [], new Set(), ['dif_sets', 'dif_juegos'])[0].nombre, 'A');
  assert.equal(ordenarClasificacion(f, [], new Set(), ['dif_juegos', 'dif_sets'])[0].nombre, 'B');
});

test('enfrentamiento directo desempata y respeta jornadas desactivadas', () => {
  const f = [fila('A', 'A', { puntos: 3 }), fila('B', 'B', { puntos: 3 })];
  const ps = [partido('p1', 'A', 'B', [[2, 6], [3, 6]])]; // gana B
  assert.equal(ordenarClasificacion(f, ps, new Set(['j1']), ['enfrentamiento'])[0].nombre, 'B');
  // jornada desactivada: no cuenta, cae al orden alfabético
  assert.equal(ordenarClasificacion(f, ps, new Set(), ['enfrentamiento'])[0].nombre, 'A');
});

test('historial de pareja desde el punto de vista de cada lado', () => {
  const js = [{ id: 'j1', numero: 1 }];
  const ps = [partido('p1', 'A', 'B', [[6, 3], [4, 6], [2, 6]])]; // gana B 1-2
  const hA = historialPareja('A', ps, js)[0];
  const hB = historialPareja('B', ps, js)[0];
  assert.equal(hA.ganado, false); assert.equal(hB.ganado, true);
  assert.deepEqual(hA.sets[0], [6, 3]); assert.deepEqual(hB.sets[0], [3, 6]);
  assert.equal(hA.rival, 'B');
});

test('calendario todos contra todos con 13 parejas', () => {
  const ids = Array.from({ length: 13 }, (_, i) => `P${i + 1}`);
  const rondas = todosContraTodos(ids);
  assert.equal(rondas.length, 13);
  const vistos = new Set();
  for (const r of rondas) {
    assert.equal(r.length, 6);
    const enRonda = r.flat();
    assert.equal(new Set(enRonda).size, 12, 'nadie juega dos veces en la misma jornada');
    for (const [a, b] of r) { const k = [a, b].sort().join('|'); assert.ok(!vistos.has(k), 'enfrentamiento repetido'); vistos.add(k); }
  }
  assert.equal(vistos.size, 78); // 13*12/2
});

test('calendario con número par de parejas', () => {
  const rondas = todosContraTodos(['A', 'B', 'C', 'D']);
  assert.equal(rondas.length, 3);
  assert.ok(rondas.every((r) => r.length === 2));
});
