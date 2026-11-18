'use client';
import { useEffect, useRef } from 'react';
import Foto from '@/components/Foto';
import Forma from '@/components/Forma';

const MANOS = { derecha: 'Derecha', izquierda: 'Izquierda' };
const POSICIONES = { drive: 'Drive', reves: 'Revés' };
const altura = (cm) => (cm ? `${(cm / 100).toFixed(2).replace('.', ',')} m` : null);

export default function FichaJugador({ jugador, companero, fila, historial, onCerrar }) {
  const cerrar = useRef(null);
  useEffect(() => {
    cerrar.current?.focus();
    const tecla = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onCerrar]);

  const datos = [
    ['Edad', jugador.edad ? `${jugador.edad} años` : null],
    ['Altura', altura(jugador.altura_cm)],
    ['Mano dominante', MANOS[jugador.mano]],
    ['Posición habitual', POSICIONES[jugador.posicion]],
    ['Pareja', fila?.nombre],
    ['Compañero/a', companero?.nombre],
  ];

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <section className="modal ficha" role="dialog" aria-modal="true" aria-label={`Ficha de ${jugador.nombre}`} onClick={(e) => e.stopPropagation()}>
        <button ref={cerrar} className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <div className="ficha-foto"><Foto jugador={jugador} grande /></div>
        <div className="ficha-cuerpo">
          <h2>{jugador.nombre}</h2>
          <dl className="ficha-datos">
            {datos.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd className={v ? '' : 'sin-dato'}>{v || 'Sin datos'}</dd></div>
            ))}
          </dl>
          {fila && (
            <>
              <h3>Estadísticas de la pareja</h3>
              <dl className="ficha-stats">
                <div><dt>Puesto</dt><dd>{fila.pos}º</dd></div>
                <div><dt>Puntos</dt><dd>{fila.puntos}</dd></div>
                <div><dt>Ganados</dt><dd className="verde">{fila.pg}</dd></div>
                <div><dt>Perdidos</dt><dd className="rojo">{fila.pp}</dd></div>
                <div><dt>Sets</dt><dd>{fila.sets_favor}-{fila.sets_contra}</dd></div>
                <div><dt>Juegos</dt><dd>{fila.juegos_favor}-{fila.juegos_contra}</dd></div>
              </dl>
              <div className="pareja-forma"><span>Forma</span><Forma historial={historial} /></div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
