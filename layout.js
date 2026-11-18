import { Barlow, Barlow_Condensed } from 'next/font/google';
import Nav from '@/components/Nav';
import './globals.css';

const cuerpo = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-cuerpo' });
const titulo = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--f-titulo' });

export const metadata = {
  title: 'Liga de Pádel Los Juncos',
  description: 'Clasificación, jornadas y resultados de la Liga de Pádel Los Juncos.',
  appleWebApp: { capable: true, title: 'Los Juncos', statusBarStyle: 'default' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b3d26', viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cuerpo.variable} ${titulo.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
