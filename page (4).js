'use client';
import { useMemo, useState } from 'react';
import { useLiga } from '@/hooks/useLiga';
import { historialPareja } from '@/lib/clasificacion';
import Estado from '@/components/Estado';
import Forma from '@/components/Forma';
import HistorialPareja from '@/components/HistorialPareja';

const signo = (n) => (n > 0 ? `+${n}` : `${n}`);

export default function Clasificacion() {
  const { filas, partidos, jornadas, parejas, ajustes, cargando, error } = useLiga();
  const [abierta, setAbierta] = useState(null);

  const nombres = useMemo(() => new Map(parejas.map((p) => [p.id, p.nombre])), [parejas]);
  const historiales = useMemo(() => {
    const m = new Map();
    for (const f of filas) m.set(f.pareja_id, historialPareja(f.pareja_id, partidos, jornadas));
    return m;
  }, [filas, partidos, jornadas]);

  const seleccionada = filas.find((f) => f.pareja_id === abierta);
  const hayResultados = filas.some((f) => f.pj > 0);

  return (
    <div className="contenedor pagina">
      <h1 className="titulo-pagina">Clasificación</h1>
      <Estado cargando={cargando} error={error} />
      {!cargando && !error && (
        <>
          {ajustes && (
            <p className="nota">
              Victoria {ajustes.puntos_victoria} pts · derrota {ajustes.puntos_derrota} pts · derrota en 3 sets {ajustes.puntos_derrota_tres_sets} pt. Pulsa una pareja para ver su historial.
            </p>
          )}
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th className="c-pos">#</th>
                  <th className="c-pareja">Pareja</th>
                  <th title="Partidos jugados">PJ</th>
                  <th title="Ganados">G</th>
                  <th title="Perdidos">P</th>
                  <th title="Puntos" className="c-pts">Pts</th>
                  <th title="Sets a favor - en contra">Sets</th>
                  <th title="Juegos a favor - en contra">Juegos</th>
                  <th title="Diferencia de sets">DS</th>
                  <th title="Diferencia de juegos">DJ</th>
                  <th>Forma</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => {
                  const esLider = f.pos === 1 && hayResultados;
                  return (
                    <tr key={f.pareja_id} className={f.pos <= 3 && hayResultados ? `top top-${f.pos}` : ''}>
                      <td className="c-pos"><span className="pos">{f.pos}</span></td>
                      <td className="c-pareja">
                        <button className="nombre-btn" onClick={() => setAbierta(f.pareja_id)}>
                          {f.nombre}
                          {esLider && <span className="chapa-lider">Líder</span>}
                        </button>
                      </td>
                      <td>{f.pj}</td>
                      <td className="verde">{f.pg}</td>
                      <td className="rojo">{f.pp}</td>
                      <td className="c-pts"><strong>{f.puntos}</strong></td>
                      <td>{f.sets_favor}-{f.sets_contra}</td>
                      <td>{f.juegos_favor}-{f.juegos_contra}</td>
                      <td className={f.dif_sets > 0 ? 'verde' : f.dif_sets < 0 ? 'rojo' : ''}>{signo(f.dif_sets)}</td>
                      <td className={f.dif_juegos > 0 ? 'verde' : f.dif_juegos < 0 ? 'rojo' : ''}>{signo(f.dif_juegos)}</td>
                      <td><Forma historial={historiales.get(f.pareja_id) || []} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!hayResultados && <p className="vacio">Aún no hay resultados. La clasificación se rellenará sola en cuanto se introduzca el primero.</p>}
          {ajustes?.criterios_desempate?.length ? (
            <p className="nota">Desempate: puntos, {ajustes.criterios_desempate.map((c) => ({ dif_sets: 'diferencia de sets', dif_juegos: 'diferencia de juegos', sets_favor: 'sets a favor', juegos_favor: 'juegos a favor', enfrentamiento: 'enfrentamiento directo' }[c] || c)).join(', ')}.</p>
          ) : null}
        </>
      )}
      {seleccionada && (
        <HistorialPareja fila={seleccionada} historial={historiales.get(abierta) || []} nombres={nombres} onCerrar={() => setAbierta(null)} />
      )}
    </div>
  );
}
