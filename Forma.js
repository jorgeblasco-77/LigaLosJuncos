// Puntos verde/rojo con los últimos resultados de una pareja (el más reciente a la derecha).
export default function Forma({ historial, max = 5 }) {
  const ultimos = historial.slice(-max);
  if (!ultimos.length) return <span className="forma-vacia">–</span>;
  return (
    <span className="forma" aria-label={ultimos.map((h) => (h.ganado ? 'victoria' : 'derrota')).join(', ')}>
      {ultimos.map((h, i) => (
        <i key={i} className={h.ganado ? 'v' : 'd'} title={h.ganado ? 'Victoria' : 'Derrota'} />
      ))}
    </span>
  );
}
