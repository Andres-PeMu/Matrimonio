import Link from 'next/link';
import { Heart } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/admin';
import { logout, selectWedding } from '@/actions/auth';
import { Navigation } from '@/components/admin/navigation';
import { coupleShortName } from '@/lib/names';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, weddings, wedding } = await requireAdmin();
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin/dashboard">
          <span className="brand-mark">
            {wedding ? (
              coupleShortName(wedding.bride_name, wedding.groom_name)
            ) : (
              <Heart size={24} strokeWidth={1.4} aria-hidden="true" />
            )}
          </span>
          <span>
            Nuestra boda<small>UN DÍA INOLVIDABLE</small>
          </span>
        </Link>
        <div className="sidebar-label">ORGANIZACIÓN</div>
        <Navigation />
        <div className="sidebar-bottom">
          <Link href="/" target="_blank">
            Ver página pública ↗
          </Link>
          <form action={logout}>
            <button type="submit">Cerrar sesión</button>
          </form>
          <p>{profile.display_name || 'Administrador'}</p>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>Hecho con amor, cuidado en cada detalle.</span>
          {weddings.length > 1 && (
            <form action={selectWedding}>
              <label className="sr-only" htmlFor="wedding">
                Boda activa
              </label>
              <select id="wedding" name="wedding_id" defaultValue={wedding?.id}>
                {weddings.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.bride_name} & {w.groom_name}
                  </option>
                ))}
              </select>
              <button type="submit">Cambiar</button>
            </form>
          )}
          <span className="admin-avatar">
            {profile.display_name?.[0] || 'A'}
          </span>
        </header>
        <main id="main" className="admin-content">
          {wedding ? (
            children
          ) : (
            <div className="panel">
              <h1>Bienvenido</h1>
              <p>
                Tu cuenta todavía no tiene una boda asignada. Sigue los pasos de
                configuración del README para asociarla.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
