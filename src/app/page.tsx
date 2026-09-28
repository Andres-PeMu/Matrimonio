import Link from 'next/link';
import { configured } from '@/lib/supabase/server';
import { publicWedding } from '@/lib/public-data';
import { WeddingPage } from '@/components/invitation/wedding-page';
export const dynamic = 'force-dynamic';
export default async function Home() {
  if (!configured())
    return (
      <main id="main" className="setup-page">
        <span className="eyebrow">UN DÍA PARA RECORDAR</span>
        <div className="ornament">❦</div>
        <h1>
          Una historia de amor,
          <br />
          <em>una invitación especial.</em>
        </h1>
        <p>Estamos preparando todos los detalles de nuestra celebración.</p>
        <Link className="button" href="/admin/login">
          Configurar nuestra boda →
        </Link>
        <small>
          El administrador debe conectar Supabase para publicar la invitación.
        </small>
      </main>
    );
  const data = await publicWedding();
  if (!data)
    return (
      <main id="main" className="setup-page">
        <h1>Muy pronto…</h1>
        <p>Estamos preparando nuestra invitación.</p>
        <Link href="/admin/login">Administración</Link>
      </main>
    );
  return <WeddingPage data={data} />;
}
