import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import '@fontsource/great-vibes/latin-400.css';
import {
  invitationStyle,
  invitationStyleCookie,
  type InvitationStyle,
} from '@/lib/invitation-styles';
import {
  invitationStyleByToken,
  invitationStyleForPublicHome,
} from '@/lib/public-data';
import { configured } from '@/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nuestra boda',
  description: 'Una invitación para compartir un día inolvidable.',
  robots: { index: false, follow: false },
};

async function requestInvitationStyle(): Promise<InvitationStyle> {
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (!configured()) return 'classic';
  try {
    if (pathname.startsWith('/i/')) {
      const token = pathname.split('/')[2] ?? '';
      return (await invitationStyleByToken(token)) ?? 'classic';
    }
    if (pathname === '/' || pathname === '') {
      return (await invitationStyleForPublicHome()) ?? 'classic';
    }
  } catch {
    return 'classic';
  }
  return invitationStyle((await cookies()).get(invitationStyleCookie)?.value);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const style = await requestInvitationStyle();
  return (
    <html lang="es" data-scroll-behavior="smooth" data-style={style}>
      <body>
        <a className="skip-link" href="#main">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
