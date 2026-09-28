import { HeartOrnament } from '@/components/ui/heart-ornament';
export default function Loading() {
  return (
    <main id="main" className="setup-page" aria-busy="true">
      <HeartOrnament className="pulse" />
      <p>Preparando los detalles…</p>
    </main>
  );
}
