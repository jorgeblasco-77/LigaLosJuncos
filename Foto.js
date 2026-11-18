'use client';
import { useState } from 'react';

// Foto de jugador: siempre misma proporción 4:5, recortada sin deformar.
// Si no hay foto (o falla al cargar) muestra las iniciales.
export default function Foto({ jugador, grande = false }) {
  const [fallo, setFallo] = useState(false);
  const iniciales = jugador.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`foto ${grande ? 'foto-grande' : ''}`}>
      {jugador.foto_url && !fallo ? (
        <img src={jugador.foto_url} alt={`Foto de ${jugador.nombre}`} loading="lazy" onError={() => setFallo(true)} />
      ) : (
        <span className="foto-vacia" aria-hidden="true">{iniciales}</span>
      )}
    </div>
  );
}
