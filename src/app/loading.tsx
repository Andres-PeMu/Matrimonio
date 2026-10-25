import { HeartOrnament } from '@/components/ui/heart-ornament';

export default function Loading() {
  return (
    <main id="main" className="setup-page invitation-loading" aria-busy="true">
      <div className="invitation-loading-card" role="status" aria-live="polite">
        <HeartOrnament className="pulse" />
        <p>Preparando los detalles…</p>
      </div>
    </main>
  );
}
