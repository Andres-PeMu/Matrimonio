import { HeartOrnament } from '@/components/ui/heart-ornament';
import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="setup-page">
      <HeartOrnament />
      <h1>Invitación no encontrada</h1>
      <p>
        Este enlace ya no está disponible. Pide a los novios que te compartan tu
        invitación nuevamente.
      </p>
      <Link href="/" className="button">
        Volver al inicio
      </Link>
    </main>
  );
}
