import { resumenPartido } from '@/lib/clasificacion';
import { fechaPartido } from '@/lib/fechas';

const ESTADOS = { pendiente: 'Pendiente', jugado: 'Jugado', aplazado: 'Aplazado' };

function Equipo({ nombre, lado, r, gana }) {
  const total = lado === 'a' ? r.sa : r.sb;
  return (
    <div className={`equipo ${gana ? 'gana' : ''}`}>
      <span className="equipo-nombre">{nombre}</span>
      <span className="equipo-sets">
        {[0, 1, 2].map((i) => {
          const s = r.sets[i];
          const mio = s ? (lado === 'a' ? s.juegos_a : s.juegos_b) : null;
          const otro = s ? (lado === 'a' ? s.juegos_b : s.juegos_a) : null;
          return <span key={i} className={`set ${s && mio > otro ? 'set-ganado' : ''}`}>{s ? mio : ''}</span>;
        })}
      </span>
      <span className="equipo-total">{r.sets.length ? total : ''}</span>
    </div>
  );
}

export default function TarjetaPartido({ partido, nombres }) {
  const r = resumenPartido(partido);
  const a = nombres.get(partido.pareja_a) || 'Pareja';
  const b = nombres.get(partido.pareja_b) || 'Pareja';
  return (
    <article className={`partido estado-${partido.estado}`}>
      <header className="partido-cab">
        <span className={`estado estado-${partido.estado}`}>{ESTADOS[partido.estado]}</span>
        <time dateTime={partido.fecha || undefined}>{fechaPartido(partido.fecha)}</time>
      </header>
      <Equipo nombre={a} lado="a" r={r} gana={r.ganador === 'a'} />
      <Equipo nombre={b} lado="b" r={r} gana={r.ganador === 'b'} />
      {r.ganador && (
        <footer className="partido-pie">
          Ganan {r.ganador === 'a' ? a : b} por {Math.max(r.sa, r.sb)}-{Math.min(r.sa, r.sb)}
        </footer>
      )}
      {partido.estado === 'aplazado' && <footer className="partido-pie">Partido aplazado. La nueva fecha aparecerá aquí.</footer>}
    </article>
  );
}
