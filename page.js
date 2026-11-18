'use client';
import Link from 'next/link';
import { useLiga } from '@/hooks/useLiga';
import Estado from '@/components/Estado';

export default function Inicio() {
  const { ajustes, filas, partidos, parejas, cargando, error } = useLiga();
  const jugados = partidos.filter((p) => p.estado === 'jugado').length;
  const lider = filas.find((f) => f.pj > 0);
  const podio = filas.filter((f) => f.pj > 0).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-pista" aria-hidden="true" />
        <div className="contenedor hero-texto">
          <p className="hero-temporada">Temporada {ajustes?.temporada || ''}</p>
          <h1>{ajustes?.nombre_liga || 'Liga de Pádel Los Juncos'}</h1>
          {ajustes?.info ? <p className="hero-info">{ajustes.info}</p> : null}
          <Link href="/clasificacion" className="boton">Ver clasificación</Link>
        </div>
      </section>

      <div className="contenedor">
        <Estado cargando={cargando} error={error} />
        {!cargando && !error && (
          <>
            <section className="lider-bloque">
              <div className="lider-tarjeta">
                <span className="etiqueta-lider">Líder</span>
                <strong className="lider-nombre">{lider ? lider.nombre : 'Sin líder todavía'}</strong>
                <span className="lider-puntos">{lider ? `${lider.puntos} puntos en ${lider.pj} partidos` : 'Aparecerá al jugarse el primer partido.'}</span>
              </div>
              <dl className="cifras">
                <div><dt>Parejas</dt><dd>{parejas.filter((p) => p.activa).length}</dd></div>
                <div><dt>Partidos jugados</dt><dd>{jugados}</dd></div>
                <div><dt>Pendientes</dt><dd>{partidos.filter((p) => p.estado !== 'jugado').length}</dd></div>
              </dl>
            </section>

            {podio.length > 0 && (
              <section>
                <h2 className="titulo-seccion">Podio</h2>
                <ol className="podio">
                  {podio.map((f) => (
                    <li key={f.pareja_id} className={`puesto-${f.pos}`}>
                      <span className="podio-pos">{f.pos}</span>
                      <span className="podio-nombre">{f.nombre}</span>
                      <span className="podio-pts">{f.puntos} pts</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
