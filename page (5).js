'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiga } from '@/hooks/useLiga';
import Estado from '@/components/Estado';
import TarjetaPartido from '@/components/TarjetaPartido';

export default function Partidos() {
  const { jornadas, partidos, parejas, cargando, error } = useLiga();
  const [elegida, setElegida] = useState(null);
  const activoRef = useRef(null);

  const nombres = useMemo(() => new Map(parejas.map((p) => [p.id, p.nombre])), [parejas]);

  // Por defecto: la primera jornada con partidos sin jugar; si todo está jugado, la última.
  const porDefecto = useMemo(() => {
    const pendiente = jornadas.find((j) => partidos.some((p) => p.jornada_id === j.id && p.estado !== 'jugado'));
    return (pendiente || jornadas[jornadas.length - 1])?.id ?? null;
  }, [jornadas, partidos]);

  const idActual = elegida && jornadas.some((j) => j.id === elegida) ? elegida : porDefecto;
  const indice = jornadas.findIndex((j) => j.id === idActual);
  const jornada = jornadas[indice];
  const delDia = partidos.filter((p) => p.jornada_id === idActual);

  useEffect(() => {
    activoRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [idActual]);

  const completa = (j) => {
    const ps = partidos.filter((p) => p.jornada_id === j.id);
    return ps.length > 0 && ps.every((p) => p.estado === 'jugado');
  };

  return (
    <div className="contenedor pagina">
      <h1 className="titulo-pagina">Partidos</h1>
      <Estado cargando={cargando} error={error} />
      {!cargando && !error && jornadas.length === 0 && (
        <p className="vacio">Todavía no se ha creado ninguna jornada. Aparecerán aquí en cuanto se publiquen.</p>
      )}
      {!cargando && !error && jornada && (
        <>
          <div className="selector">
            <button className="selector-flecha" onClick={() => setElegida(jornadas[indice - 1].id)} disabled={indice <= 0} aria-label="Jornada anterior">‹</button>
            <div className="selector-lista" role="tablist" aria-label="Jornadas">
              {jornadas.map((j) => (
                <button
                  key={j.id}
                  ref={j.id === idActual ? activoRef : null}
                  role="tab"
                  aria-selected={j.id === idActual}
                  className={`chip ${j.id === idActual ? 'chip-activa' : ''} ${completa(j) ? 'chip-completa' : ''}`}
                  onClick={() => setElegida(j.id)}
                >
                  Jornada {j.numero}
                </button>
              ))}
            </div>
            <button className="selector-flecha" onClick={() => setElegida(jornadas[indice + 1].id)} disabled={indice >= jornadas.length - 1} aria-label="Jornada siguiente">›</button>
          </div>

          <h2 className="titulo-seccion">{jornada.nombre || `Jornada ${jornada.numero}`}</h2>
          {!jornada.activa && <p className="nota">Esta jornada está desactivada: sus resultados no cuentan para la clasificación.</p>}
          {delDia.length === 0 ? (
            <p className="vacio">Esta jornada aún no tiene enfrentamientos.</p>
          ) : (
            <div className="rejilla-partidos">
              {delDia.map((p) => <TarjetaPartido key={p.id} partido={p} nombres={nombres} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
