export default function Estado({ cargando, error }) {
  if (error) {
    return (
      <div className="aviso aviso-error" role="alert">
        <strong>No se pudo cargar la liga.</strong>
        <span>Revisa las claves de Supabase en .env.local y que hayas ejecutado schema.sql. Detalle: {error}</span>
      </div>
    );
  }
  if (cargando) return <div className="aviso" aria-live="polite">Cargando datos de la liga…</div>;
  return null;
}
