'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { mensajeError, slug, numOrNull } from '@/lib/admin';
import Foto from '@/components/Foto';

function JugadorEditor({ jugador, parejas, avisar, refrescar }) {
  const [f, setF] = useState(jugador);
  const [subiendo, setSubiendo] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  async function guardar(extra = {}) {
    const d = { ...f, ...extra };
    const { error } = await supabase.from('jugadores').update({
      nombre: d.nombre.trim() || 'Jugador', edad: numOrNull(d.edad), altura_cm: numOrNull(d.altura_cm),
      mano: d.mano || null, posicion: d.posicion || null, foto_url: d.foto_url || null, pareja_id: d.pareja_id || null,
    }).eq('id', jugador.id);
    if (error) return avisar(mensajeError(error), 'error');
    avisar(`Jugador "${d.nombre}" guardado.`);
    refrescar();
  }

  async function subir(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) return avisar('El archivo debe ser una imagen.', 'error');
    if (archivo.size > 400 * 1024) avisar('La foto pesa más de 400 KB. Funciona, pero conviene reducirla (ver docs/FOTOS.md).', 'error');
    setSubiendo(true);
    const ext = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
    const ruta = `${slug(f.nombre) || 'jugador'}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('fotos').upload(ruta, archivo, { cacheControl: '31536000' });
    setSubiendo(false);
    if (error) return avisar(mensajeError(error), 'error');
    const { data } = supabase.storage.from('fotos').getPublicUrl(ruta);
    set('foto_url', data.publicUrl);
    await guardar({ foto_url: data.publicUrl });
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a ${jugador.nombre}? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('jugadores').delete().eq('id', jugador.id);
    if (error) return avisar(mensajeError(error), 'error');
    avisar('Jugador eliminado.');
    refrescar();
  }

  return (
    <div className="jugador-editor">
      <div className="je-foto">
        <Foto jugador={f} />
        <label className="btn btn-suave subir">
          {subiendo ? 'Subiendo…' : f.foto_url ? 'Cambiar foto' : 'Subir foto'}
          <input type="file" accept="image/*" onChange={subir} hidden disabled={subiendo} />
        </label>
      </div>
      <div className="je-campos">
        <label>Nombre<input value={f.nombre} onChange={(e) => set('nombre', e.target.value)} /></label>
        <div className="fila-campos">
          <label>Edad<input type="number" min="5" max="99" value={f.edad ?? ''} onChange={(e) => set('edad', e.target.value)} /></label>
          <label>Altura (cm)<input type="number" min="100" max="230" value={f.altura_cm ?? ''} onChange={(e) => set('altura_cm', e.target.value)} /></label>
        </div>
        <div className="fila-campos">
          <label>Mano dominante
            <select value={f.mano || ''} onChange={(e) => set('mano', e.target.value)}>
              <option value="">Sin datos</option><option value="derecha">Derecha</option><option value="izquierda">Izquierda</option>
            </select>
          </label>
          <label>Posición
            <select value={f.posicion || ''} onChange={(e) => set('posicion', e.target.value)}>
              <option value="">Sin datos</option><option value="drive">Drive</option><option value="reves">Revés</option>
            </select>
          </label>
        </div>
        <label>Pareja
          <select value={f.pareja_id || ''} onChange={(e) => set('pareja_id', e.target.value)}>
            <option value="">Sin pareja</option>
            {parejas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </label>
        <div className="acciones">
          <button className="btn btn-primario" onClick={() => guardar()}>Guardar jugador</button>
          <button className="btn btn-peligro" onClick={eliminar}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function ParejaBloque({ pareja, jugadores, parejas, avisar, refrescar }) {
  const [nombre, setNombre] = useState(pareja.nombre);

  async function guardar(cambios) {
    const { error } = await supabase.from('parejas').update(cambios).eq('id', pareja.id);
    if (error) return avisar(mensajeError(error), 'error');
    avisar('Pareja actualizada.'); refrescar();
  }
  async function eliminar() {
    if (!confirm(`¿Eliminar la pareja "${pareja.nombre}"?`)) return;
    const { error } = await supabase.from('parejas').delete().eq('id', pareja.id);
    if (error) return avisar(mensajeError(error), 'error');
    avisar('Pareja eliminada.'); refrescar();
  }
  async function anadirJugador() {
    const { error } = await supabase.from('jugadores').insert({ nombre: 'Nuevo jugador', pareja_id: pareja.id });
    if (error) return avisar(mensajeError(error), 'error');
    refrescar();
  }

  return (
    <details className="panel-caja pareja-admin">
      <summary>
        <strong>{pareja.nombre}</strong>
        {!pareja.activa && <span className="etiqueta-gris">Desactivada</span>}
      </summary>
      <div className="fila-campos alinear">
        <label>Nombre de la pareja<input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
        <button className="btn btn-primario" onClick={() => guardar({ nombre: nombre.trim() || pareja.nombre })}>Guardar nombre</button>
        <button className="btn btn-suave" onClick={() => guardar({ activa: !pareja.activa })}>{pareja.activa ? 'Desactivar' : 'Activar'}</button>
        <button className="btn btn-peligro" onClick={eliminar}>Eliminar pareja</button>
      </div>
      {jugadores.map((j) => (
        <JugadorEditor key={j.id + JSON.stringify(j)} jugador={j} parejas={parejas} avisar={avisar} refrescar={refrescar} />
      ))}
      {jugadores.length < 2 && <button className="btn btn-suave" onClick={anadirJugador}>+ Añadir jugador a esta pareja</button>}
    </details>
  );
}

export default function ParejasAdmin({ parejas, jugadores, avisar, refrescar }) {
  const [nueva, setNueva] = useState('');
  const sinPareja = jugadores.filter((j) => !j.pareja_id);

  async function crear(e) {
    e.preventDefault();
    if (!nueva.trim()) return;
    const { error } = await supabase.from('parejas').insert({ nombre: nueva.trim() });
    if (error) return avisar(mensajeError(error), 'error');
    setNueva(''); avisar('Pareja creada. Ábrela para añadir sus jugadores.'); refrescar();
  }

  return (
    <>
      <form className="panel-caja fila-campos alinear" onSubmit={crear}>
        <label>Nueva pareja<input value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Ej.: Ana / Luis" /></label>
        <button className="btn btn-primario">Crear pareja</button>
      </form>
      {parejas.map((p) => (
        <ParejaBloque key={p.id} pareja={p} jugadores={jugadores.filter((j) => j.pareja_id === p.id)} parejas={parejas} avisar={avisar} refrescar={refrescar} />
      ))}
      {sinPareja.length > 0 && (
        <div className="panel-caja">
          <h2>Jugadores sin pareja</h2>
          {sinPareja.map((j) => <JugadorEditor key={j.id + JSON.stringify(j)} jugador={j} parejas={parejas} avisar={avisar} refrescar={refrescar} />)}
        </div>
      )}
    </>
  );
}
