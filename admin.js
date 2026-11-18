export function mensajeError(error) {
  if (!error) return null;
  if (error.code === '23503') return 'No se puede eliminar porque tiene datos asociados (por ejemplo, partidos). Desactívalo en su lugar.';
  if (error.code === '23505') return 'Ya existe un elemento con ese nombre o número.';
  if (error.code === '42501') return 'No tienes permiso. Comprueba que has iniciado sesión como administrador.';
  return error.message;
}

export const slug = (t) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const aLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const aISO = (local) => (local ? new Date(local).toISOString() : null);

export const numOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
