'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ordenarClasificacion } from '@/lib/clasificacion';

const TABLAS = ['ajustes', 'parejas', 'jugadores', 'jornadas', 'partidos', 'sets'];

// Carga todos los datos y los mantiene al día en tiempo real:
// cuando el admin guarda algo, todas las pantallas abiertas se refrescan solas.
export function useLiga() {
  const [datos, setDatos] = useState({ ajustes: null, parejas: [], jugadores: [], jornadas: [], partidos: [], clasif: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const temporizador = useRef(null);

  const cargar = useCallback(async () => {
    const res = await Promise.all([
      supabase.from('ajustes').select('*').eq('id', 1).maybeSingle(),
      supabase.from('parejas').select('*').order('nombre'),
      supabase.from('jugadores').select('*').order('nombre'),
      supabase.from('jornadas').select('*').order('numero'),
      supabase.from('partidos').select('*, sets(*)').order('fecha', { ascending: true, nullsFirst: false }),
      supabase.from('clasificacion').select('*'),
    ]);
    const fallo = res.find((r) => r.error);
    if (fallo) { setError(fallo.error.message); setCargando(false); return; }
    setError(null);
    setDatos({
      ajustes: res[0].data, parejas: res[1].data, jugadores: res[2].data,
      jornadas: res[3].data, partidos: res[4].data, clasif: res[5].data,
    });
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const refrescar = () => {
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(cargar, 300);
    };
    let canal = supabase.channel('liga-en-vivo');
    for (const t of TABLAS) canal = canal.on('postgres_changes', { event: '*', schema: 'public', table: t }, refrescar);
    canal.subscribe();
    return () => { clearTimeout(temporizador.current); supabase.removeChannel(canal); };
  }, [cargar]);

  const filas = useMemo(() => {
    const activas = new Set(datos.jornadas.filter((j) => j.activa).map((j) => j.id));
    return ordenarClasificacion(datos.clasif, datos.partidos, activas, datos.ajustes?.criterios_desempate || []);
  }, [datos]);

  return { ...datos, filas, cargando, error, recargar: cargar };
}
