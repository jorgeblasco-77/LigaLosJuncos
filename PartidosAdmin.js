'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mensajeError, aLocal, aISO } from '@/lib/admin';
import { todosContraTodos } from '@/lib/calendario';

function PartidoEditor({ partido, parejas, avisar, refrescar }) {
  const inicial = [1, 2, 3].map((n) => {
    const s = (partido.sets || []).find((x) => x.numero === n);
    return { a: s ? String(s.juegos_a) : '', b: s ? String(s.juegos_b) : '' };
  });
  const [pa, setPa] = useState(partido.pareja_a);
  const [pb, setPb] = useState(partido.pareja_b);
  const [fecha, setFecha] = useState(aLocal(partido.fecha));
  const [estado, setEstado] = useState(partido.estado);
  const [sets, setSets] = useState(inicial);
  const setSet = (i, k, v) => setSets((s) => s.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  async function guardar() {
    if (pa === pb) return avisar('Una pareja no puede jugar contra sí misma.', 'error');
    const llenos = sets.map((s, i) => ({ numero: i + 1, a: s.a, b: s.b })).filter((s) => s.a !== '' || s.b !== '');
    const ok = llenos.every((s, i) => s.numero === i + 1 && s.a !== '' && s.b !== '' && Number(s.a) >= 0 && Number(s.b) >= 0 && Number(s.a) !== Number(s.b));
    let setsA = 0, setsB = 0;
    llenos.forEach((s) => (Number(s.a) > Number(s.b) ? setsA++ : setsB++));
    if (llenos.length > 0 && (!ok || Math.max(setsA, setsB) !== 2 || llenos.length !== setsA + setsB)) {
      return avisar('Resultado no válido: se juega al mejor de 3 sets, sin huecos ni empates en un set, y un set extra solo si hay 1-1.', 'error');
    }
    let nuevoEstado = estado;
    if (llenos.length > 0 && estado === 'pendiente') nuevoEstado = 'jugado';
    if (llenos.length > 0 && estado === 'aplazado') return avisar('Un partido aplazado no puede tener resultado. Cambia el estado o borra los sets.', 'error');
    if (nuevoEstado === 'jugado' && llenos.length === 0) return avisar('Para marcarlo como jugado, introduce el resultado.', 'error');

    const filasSets = llenos.map((s) => ({ partido_id: partido.id, numero: s.numero, juegos_a: Number(s.a), juegos_b: Number(s.b) }));
    const guardarSets = async () => {
      if (filasSets.length) {
        const r = await supabase.from('sets').upsert(filasSets, { onConflict: 'partido_id,numero' });
        if (r.error) return r.error;
      }
      const r2 = await supabase.from('sets').delete().eq('partido_id', partido.id).gt('numero', llenos.length);
      return r2.error;
    };
    const guardarPartido = async () => {
      const r = await supabase.from('partidos').update({ pareja_a: pa, pareja_b: pb, fecha: aISO(fecha), estado: nuevoEstado }).eq('id', partido.id);
      return r.error;
    };
    // Orden pensado para que la clasificación no pase por estados intermedios raros.
    const [primero, segundo] = nuevoEstado === 'jugado' ? [guardarSets, guardarPartido] : [guardarPartido, guardarSets];
    const e1 = await primero(); if (e1) return avisar(mensajeError(e1), 'error');
    const e2 = await segundo(); if (e2) return avisar(mensajeError(e2), 'error');
    setEstado(nuevoEstado);
    avisar(nuevoEstado === 'jugado' ? 'Resultado guardado. La clasificación se ha actualizado.' : 'Partido guardado.');
    refrescar();
  }

  async function eliminar() {
    if (!confirm('¿Eliminar este partido y su resultado?')) return;
    const { error } = await supabase.from('partidos').delete().eq('id', partido.id);
    if (error) return avisar(mensajeError(error), 'error');
    avisar('Partido eliminado.'); refrescar();
  }

  const opciones = parejas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>);
  return (
    <div className="partido-editor">
      <div className="fila-campos">
        <label>Pareja A<select value={pa} onChange={(e) => setPa(e.target.value)}>{opciones}</select></label>
        <label>Pareja B<select value={pb} onChange={(e) => setPb(e.target.value)}>{opciones}</select></label>
      </div>
      <div className="fila-campos">
        <label>Fecha y hora<input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
        <label>Estado
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="pendiente">Pendiente</option><option value="jugado">Jugado</option><option value="aplazado">Aplazado</option>
          </select>
        </label>
      </div>
      <div className="sets-editor">
        <span>Juegos por set (A – B)</span>
        {sets.map((s, i) => (
          <span key={i} className="set-par">
            <small>Set {i + 1}</small>
            <input type="number" min="0" max="20" value={s.a} onChange={(e) => setSet(i, 'a', e.target.value)} aria-label={`Set ${i + 1} pareja A`} />
            <b>–</b>
            <input type="number" min="0" max="20" value={s.b} onChange={(e) => setSet(i, 'b', e.target.value)} aria-label={`Set ${i + 1} pareja B`} />
          </span>
        ))}
      </div>
      <div className="acciones">
        <button className="btn btn-primario" onClick={guardar}>Guardar partido</button>
        <button className="btn btn-peligro" onClick={eliminar}>Eliminar</button>
      </div>
    </div>
  );
}

export default function PartidosAdmin({ jornadas, partidos, parejas, avisar, refrescar }) {
  const [sel, setSel] = useState(null);
  const [numNuevo, setNumNuevo] = useState('');
  const [nuevoA, setNuevoA] = useState('');
  const [nuevoB, setNuevoB] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nombreJ, setNombreJ] = useState('');

  const jornada = jornadas.find((j) => j.id === sel) || jornadas[0];
  const nombresPorId = useMemo(() => new Map(parejas.map((p) => [p.id, p.nombre])), [parejas]);
  const activas = parejas.filter((p) => p.activa);
  const delaJornada = jornada ? partidos.filter((p) => p.jornada_id === jornada.id) : [];
  useEffect(() => { setNombreJ(jornada?.nombre || ''); }, [jornada?.id, jornada?.nombre]);

  async function crearJornada(e) {
    e.preventDefault();
    const numero = Number(numNuevo) || Math.max(0, ...jornadas.map((j) => j.numero)) + 1;
    const { data, error } = await supabase.from('jornadas').insert({ numero }).select().single();
    if (error) return avisar(mensajeError(error), 'error');
    setNumNuevo(''); setSel(data.id); avisar(`Jornada ${numero} creada.`); refrescar();
  }
  async function cambiarJornada(cambios, msg) {
    const { error } = await supabase.from('jornadas').update(cambios).eq('id', jornada.id);
    if (error) return avisar(mensajeError(error), 'error');
    avisar(msg); refrescar();
  }
  async function borrarJornada() {
    if (!confirm(`¿Eliminar la Jornada ${jornada.numero} y todos sus partidos?`)) return;
    const { error } = await supabase.from('jornadas').delete().eq('id', jornada.id);
    if (error) return avisar(mensajeError(error), 'error');
    setSel(null); avisar('Jornada eliminada.'); refrescar();
  }
  async function anadirPartido(e) {
    e.preventDefault();
    if (!nuevoA || !nuevoB) return avisar('Elige las dos parejas.', 'error');
    if (nuevoA === nuevoB) return avisar('Una pareja no puede jugar contra sí misma.', 'error');
    const { error } = await supabase.from('partidos').insert({ jornada_id: jornada.id, pareja_a: nuevoA, pareja_b: nuevoB, fecha: aISO(nuevaFecha) });
    if (error) return avisar(mensajeError(error), 'error');
    setNuevoA(''); setNuevoB(''); setNuevaFecha(''); avisar('Partido añadido.'); refrescar();
  }
  async function generarCalendario() {
    if (!confirm(`Se crearán ${activas.length % 2 ? activas.length : activas.length - 1} jornadas con todos los enfrentamientos (todos contra todos). ¿Continuar?`)) return;
    const rondas = todosContraTodos(activas.map((p) => p.id));
    const { data: js, error } = await supabase.from('jornadas').insert(rondas.map((_, i) => ({ numero: i + 1 }))).select();
    if (error) return avisar(mensajeError(error), 'error');
    const porNumero = new Map(js.map((j) => [j.numero, j.id]));
    const filas = rondas.flatMap((r, i) => r.map(([a, b]) => ({ jornada_id: porNumero.get(i + 1), pareja_a: a, pareja_b: b })));
    const r2 = await supabase.from('partidos').insert(filas);
    if (r2.error) return avisar(mensajeError(r2.error), 'error');
    avisar('Calendario generado. Ahora puedes asignar fechas y horas a cada partido.'); refrescar();
  }

  return (
    <>
      {jornadas.length === 0 && (
        <div className="panel-caja">
          <h2>Calendario</h2>
          <p className="nota">Aún no hay jornadas. Puedes generar de golpe el calendario de todos contra todos con las {activas.length} parejas activas, o crear jornadas a mano.</p>
          <button className="btn btn-primario" onClick={generarCalendario} disabled={activas.length < 2}>Generar calendario todos contra todos</button>
        </div>
      )}
      <form className="panel-caja fila-campos alinear" onSubmit={crearJornada}>
        <label>Nueva jornada (número)<input type="number" min="1" value={numNuevo} onChange={(e) => setNumNuevo(e.target.value)} placeholder="Siguiente automático" /></label>
        <button className="btn btn-primario">Crear jornada</button>
      </form>

      {jornada && (
        <>
          <div className="panel-caja">
            <label>Jornada
              <select value={jornada.id} onChange={(e) => setSel(e.target.value)}>
                {jornadas.map((j) => <option key={j.id} value={j.id}>Jornada {j.numero}{j.activa ? '' : ' (desactivada)'}</option>)}
              </select>
            </label>
            <div className="fila-campos alinear">
              <label>Título (opcional)<input value={nombreJ} onChange={(e) => setNombreJ(e.target.value)} /></label>
              <button className="btn btn-suave" onClick={() => cambiarJornada({ nombre: nombreJ || null }, 'Título guardado.')}>Guardar título</button>
              <button className="btn btn-suave" onClick={() => cambiarJornada({ activa: !jornada.activa }, jornada.activa ? 'Jornada desactivada: ya no cuenta en la clasificación.' : 'Jornada activada.')}>{jornada.activa ? 'Desactivar' : 'Activar'}</button>
              <button className="btn btn-peligro" onClick={borrarJornada}>Eliminar jornada</button>
            </div>
          </div>

          <form className="panel-caja" onSubmit={anadirPartido}>
            <h2>Añadir enfrentamiento a la Jornada {jornada.numero}</h2>
            <div className="fila-campos alinear">
              <label>Pareja A<select value={nuevoA} onChange={(e) => setNuevoA(e.target.value)}><option value="">Elegir…</option>{activas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
              <label>Pareja B<select value={nuevoB} onChange={(e) => setNuevoB(e.target.value)}><option value="">Elegir…</option>{activas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
              <label>Fecha y hora<input type="datetime-local" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} /></label>
              <button className="btn btn-primario">Añadir partido</button>
            </div>
          </form>

          {delaJornada.length === 0 && <p className="vacio">Esta jornada no tiene partidos todavía.</p>}
          {delaJornada.map((p) => (
            <details key={p.id} className="panel-caja">
              <summary>
                <strong>{nombresPorId.get(p.pareja_a)} vs {nombresPorId.get(p.pareja_b)}</strong>
                <span className={`estado estado-${p.estado}`}>{p.estado}</span>
              </summary>
              <PartidoEditor key={p.id + JSON.stringify([p.estado, p.fecha, p.sets])} partido={p} parejas={parejas} avisar={avisar} refrescar={refrescar} />
            </details>
          ))}
        </>
      )}
    </>
  );
}
