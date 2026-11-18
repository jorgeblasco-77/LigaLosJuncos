// Permite "Añadir a pantalla de inicio" y abrir la liga como una app.
export default function manifest() {
  return {
    name: 'Liga de Pádel Los Juncos',
    short_name: 'Los Juncos',
    description: 'Clasificación, jornadas y resultados de la Liga de Pádel Los Juncos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b3d26',
    theme_color: '#0b3d26',
    lang: 'es',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
