import Link from 'next/link';
import { login } from '@/actions/auth';
import { configured } from '@/lib/supabase/server';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const ready = configured();
  const errors: Record<string, string> = {
    credentials: 'El email o la contraseña no son correctos.',
    access: 'Tu cuenta no tiene permisos de administración.',
    setup: 'Primero configura la conexión a Supabase.',
  };
  return (
    <main id="main" className="login-page">
      <div className="login-story">
        <span className="eyebrow">CADA DETALLE CUENTA</span>
        <h1>
          El comienzo de
          <br />
          <em>algo maravilloso.</em>
        </h1>
        <p>Un espacio para organizar el día que recordarán siempre.</p>
        <div className="ornament">❦</div>
      </div>
      <div className="login-card">
        <Link href="/" className="back-link">
          ← Nuestra boda
        </Link>
        <span className="eyebrow">BIENVENIDO A CASA</span>
        <h2>Todo empieza aquí</h2>
        <p className="muted">Ingresa para preparar tu gran día.</p>
        {!ready && (
          <div className="notice">
            Conecta Supabase en <code>.env.local</code> y ejecuta las
            migraciones. Las instrucciones están en el README del proyecto.
          </div>
        )}
        {error && (
          <p role="alert" className="error-message">
            {errors[error] || 'No pudimos iniciar sesión.'}
          </p>
        )}
        <form action={login}>
          <label>
            Email
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              placeholder="tu@email.com"
              disabled={!ready}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={!ready}
            />
          </label>
          <button className="button" type="submit" disabled={!ready}>
            Entrar al panel →
          </button>
        </form>
        <p className="small muted">
          Acceso exclusivo para los administradores de la boda.
        </p>
      </div>
    </main>
  );
}
