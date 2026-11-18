'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Se irán añadiendo apartados aquí según se construyan.
const ENLACES = [
  { href: '/', texto: 'Inicio' },
  { href: '/clasificacion', texto: 'Clasificación' },
  { href: '/partidos', texto: 'Partidos' },
  { href: '/parejas', texto: 'Parejas' },
];

export default function Nav() {
  const ruta = usePathname();
  return (
    <header className="nav">
      <Link href="/" className="nav-marca">Los Juncos</Link>
      <nav aria-label="Principal">
        {ENLACES.map((e) => (
          <Link key={e.href} href={e.href} className={ruta === e.href ? 'activo' : ''} aria-current={ruta === e.href ? 'page' : undefined}>
            {e.texto}
          </Link>
        ))}
      </nav>
    </header>
  );
}
