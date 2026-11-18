'use client';
import { supabase } from '@/lib/supabase';
import { mensajeError } from '@/lib/admin';

const TABLAS = ['ajustes', 'parejas', 'jugadores', 'jornadas', 'partidos', 'sets'];

function descargar(nombre, contenido, tipo) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement('a');
  a.href = url; a.download = nombre; a.click();
  URL.revokeObjectURL(url);
}

export default function CopiaAdmin({ avisar }) {
  const hoy = new Date().toISOString().slice(0, 10);

  async function copiaCompleta() {
    const copia = { generada: new Date().toISOString(), version: 1 };
    for (const t of TABLAS) {
      const { data, error } = await supabase.from(t).select('*');
      if (error) return avisar(mensajeError(error), 'error');
      copia[t] = data;
    }
    descargar(`copia-liga-${hoy}.json`, JSON.stringify(copia, null, 2), 'application/json');
    avisar('Copia de seguridad descargada.');
  }

  async function clasificacionCsv() {
    const { data, error } = await supabase.from('clasificacion').select('*').order('puntos', { ascending: false });
    if (error) return avisar(mensajeError(error), 'error');
    const cab = ['nombre', 'pj', 'pg', 'pp', 'puntos', 'sets_favor', 'sets_contra', 'juegos_favor', 'juegos_contra', 'dif_sets', 'dif_juegos'];
    const filas = data.map((f) => cab.map((c) => `"${String(f[c]).replaceAll('"', '""')}"`).join(';'));
    descargar(`clasificacion-${hoy}.csv`, '\ufeff' + [cab.join(';'), ...filas].join('\n'), 'text/csv');
  }

  return (
    <div className="panel-caja">
      <h2>Copia de seguridad</h2>
      <p className="nota">Descarga todos los datos de la liga (parejas, jugadores, jornadas, partidos, sets y ajustes) en un archivo. Guárdalo en tu ordenador o en la nube. Conviene hacerlo cada vez que termine una jornada.</p>
      <div className="acciones">
        <button className="btn btn-primario" onClick={copiaCompleta}>Descargar copia completa (JSON)</button>
        <button className="btn btn-suave" onClick={clasificacionCsv}>Descargar clasificación (CSV, abre en Excel)</button>
      </div>
      <p className="nota">Las fotos están en Supabase Storage (bucket "fotos"); conserva también los originales en tu ordenador.</p>
    </div>
  );
}
