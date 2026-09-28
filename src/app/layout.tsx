import type { Metadata } from 'next';
import '@fontsource/great-vibes/latin-400.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Nuestra boda',
  description: 'Una invitación para compartir un día inolvidable.',
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
