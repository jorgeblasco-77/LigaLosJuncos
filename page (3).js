'use client';
import { useMemo, useState } from 'react';
import { useLiga } from '@/hooks/useLiga';
import { historialPareja } from '@/lib/clasificacion';
import Estado from '@/components/Estado';
import TarjetaPareja from '@/components/TarjetaPareja';
import FichaJugador from '@/components/FichaJugador';

export default function Parejas() {
  const { filas, jugadores, partidos, jornadas, cargando, error } = useLiga();
  const [abierto, setAbierto] = useState(null);

  const porPareja = useMemo(() => {
    const m = new Map();
    for (const j of jugadores) if (j.pareja_id) m.set(j.pareja_id, [...(m.get(j.pareja_id) || []), j]);
    return m;
  }, [jugadores]);

  const sel = abierto && jugadores.find((j) => j.id === abierto);
  const filaSel = sel && filas.find((f) => f.pareja_id === sel.pareja_id);
  const companero = sel && (porPareja.get(sel.pareja_id) || []).find((j) => j.id !== sel.id);

  return (
    <div className="contenedor pagina">
      <h1 className="titulo-pagina">Parejas y jugadores</h1>
      <Estado cargando={cargando} error={error} />
      {!cargando && !error && (
        <>
          <p className="nota">Pulsa la foto de un jugador para ver su ficha.</p>
          <div className="rejilla-parejas">
            {filas.map((f) => (
              <TarjetaPareja
                key={f.pareja_id}
                fila={f}
                jugadores={porPareja.get(f.pareja_id) || []}
                historial={historialPareja(f.pareja_id, partidos, jornadas)}
                onAbrir={(j) => setAbierto(j.id)}
              />
            ))}
          </div>
        </>
      )}
      {sel && (
        <FichaJugador
          jugador={sel}
          companero={companero}
          fila={filaSel}
          historial={filaSel ? historialPareja(filaSel.pareja_id, partidos, jornadas) : []}
          onCerrar={() => setAbierto(null)}
        />
      )}
    </div>
  );
}
