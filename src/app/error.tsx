'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="setup-page">
      <h1>Un pequeño contratiempo</h1>
      <p>No pudimos cargar la información. Por favor, inténtalo nuevamente.</p>
      <button className="button" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
