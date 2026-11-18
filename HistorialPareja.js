'use client';
import { useEffect } from 'react';

export default function HistorialPareja({ fila, historial, nombres, onCerrar }) {
  useEffect(() => {
    const tecla = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onCerrar]);

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={`Historial de ${fila.nombre}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <h2>{fila.nombre}</h2>
        <p className="modal-resumen">
          Puesto {fila.pos} · {fila.puntos} puntos · {fila.pg} ganados y {fila.pp} perdidos
        </p>
        {historial.length === 0 ? (
          <p className="vacio">Esta pareja todavía no ha jugado ningún partido.</p>
        ) : (
          <ul className="historial">
            {historial.map((h) => (
              <li key={h.partido.id} className={h.ganado ? 'gana' : 'pierde'}>
                <span className="insignia">{h.ganado ? 'V' : 'D'}</span>
                <span className="hist-datos">
                  <strong>Jornada {h.jornada} · {nombres.get(h.rival) || 'Rival'}</strong>
                  <small>{h.sets.map((s) => `${s[0]}-${s[1]}`).join('  ')}</small>
                </span>
                <span className="hist-marcador">{h.propios}-{h.ajenos}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
