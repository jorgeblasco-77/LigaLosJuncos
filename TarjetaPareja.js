import Foto from '@/components/Foto';
import Forma from '@/components/Forma';

export default function TarjetaPareja({ fila, jugadores, historial, onAbrir }) {
  return (
    <article className={`pareja ${fila.pos === 1 && fila.pj > 0 ? 'pareja-lider' : ''}`}>
      <header className="pareja-cab">
        <span className="pos">{fila.pos}</span>
        <h2>{fila.nombre}</h2>
      </header>
      <div className="pareja-fotos">
        {jugadores.map((j) => (
          <button key={j.id} className="jugador-btn" onClick={() => onAbrir(j)} aria-label={`Ver ficha de ${j.nombre}`}>
            <Foto jugador={j} />
            <span>{j.nombre}</span>
          </button>
        ))}
      </div>
      <dl className="mini-stats">
        <div><dt>PJ</dt><dd>{fila.pj}</dd></div>
        <div><dt>G</dt><dd className="verde">{fila.pg}</dd></div>
        <div><dt>P</dt><dd className="rojo">{fila.pp}</dd></div>
        <div><dt>Pts</dt><dd>{fila.puntos}</dd></div>
      </dl>
      <div className="pareja-forma"><span>Forma</span><Forma historial={historial} /></div>
    </article>
  );
}
