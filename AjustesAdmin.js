'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mensajeError } from '@/lib/admin';

const CRITERIOS = {
  dif_sets: 'Diferencia de sets',
  dif_juegos: 'Diferencia de juegos',
  sets_favor: 'Sets a favor',
  juegos_favor: 'Juegos a favor',
  enfrentamiento: 'Enfrentamiento directo',
};

export default function AjustesAdmin({ ajustes, avisar, refrescar }) {
  const [f, setF] = useState({
    nombre_liga: ajustes.nombre_liga, temporada: ajustes.temporada || '', info: ajustes.info || '',
    puntos_victoria: ajustes.puntos_victoria, puntos_derrota: ajustes.puntos_derrota,
    puntos_derrota_tres_sets: ajustes.puntos_derrota_tres_sets,
  });
  const [orden, setOrden] = useState(ajustes.criterios_desempate || []);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const mover = (i, d) => setOrden((o) => { const n = [...o]; const j = i + d; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const libres = Object.keys(CRITERIOS).filter((c) => !orden.includes(c));

  async function guardar(e) {
    e.preventDefault();
    const { error } = await supabase.from('ajustes').update({
      nombre_liga: f.nombre_liga.trim() || 'Liga de Pádel Los Juncos', temporada: f.temporada, info: f.info,
      puntos_victoria: Number(f.puntos_victoria), puntos_derrota: Number(f.puntos_derrota),
      puntos_derrota_tres_sets: Number(f.puntos_derrota_tres_sets), criterios_desempate: orden,
    }).eq('id', 1);
    if (error) return avisar(mensajeError(error), 'error');
    avisar('Ajustes guardados. La clasificación se ha recalculado.');
    refrescar();
  }

  return (
    <form className="panel-caja" onSubmit={guardar}>
      <h2>Información de la liga</h2>
      <label>Nombre de la liga<input value={f.nombre_liga} onChange={(e) => set('nombre_liga', e.target.value)} /></label>
      <label>Temporada<input value={f.temporada} onChange={(e) => set('temporada', e.target.value)} placeholder="2026/2027" /></label>
      <label>Texto de portada (opcional)<textarea rows={3} value={f.info} onChange={(e) => set('info', e.target.value)} /></label>

      <h2>Sistema de puntuación</h2>
      <div className="fila-campos">
        <label>Victoria<input type="number" min="0" value={f.puntos_victoria} onChange={(e) => set('puntos_victoria', e.target.value)} /></label>
        <label>Derrota<input type="number" min="0" value={f.puntos_derrota} onChange={(e) => set('puntos_derrota', e.target.value)} /></label>
        <label>Derrota en 3 sets<input type="number" min="0" value={f.puntos_derrota_tres_sets} onChange={(e) => set('puntos_derrota_tres_sets', e.target.value)} /></label>
      </div>

      <h2>Criterios de desempate</h2>
      <p className="nota">Se aplican en este orden cuando dos parejas tienen los mismos puntos.</p>
      <ol className="criterios">
        {orden.map((c, i) => (
          <li key={c}>
            <span>{i + 1}. {CRITERIOS[c] || c}</span>
            <span className="acciones">
              <button type="button" className="btn btn-suave" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button type="button" className="btn btn-suave" onClick={() => mover(i, 1)} disabled={i === orden.length - 1} aria-label="Bajar">↓</button>
              <button type="button" className="btn btn-suave" onClick={() => setOrden(orden.filter((x) => x !== c))}>Quitar</button>
            </span>
          </li>
        ))}
      </ol>
      {libres.length > 0 && (
        <div className="fila-campos">
          {libres.map((c) => <button key={c} type="button" className="btn btn-suave" onClick={() => setOrden([...orden, c])}>+ {CRITERIOS[c]}</button>)}
        </div>
      )}
      <button className="btn btn-primario">Guardar ajustes</button>
    </form>
  );
}
