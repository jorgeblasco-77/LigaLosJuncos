export function fechaPartido(fecha) {
  if (!fecha) return 'Fecha por confirmar';
  return new Date(fecha).toLocaleString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  });
}
