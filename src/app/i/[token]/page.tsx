import { notFound } from 'next/navigation';
import { configured } from '@/lib/supabase/server';
import { invitation } from '@/lib/public-data';
import { Envelope } from '@/components/invitation/envelope';
export const dynamic = 'force-dynamic';
export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!configured())
    return (
      <main id="main" className="setup-page">
        <h1>Estamos preparando tu invitación</h1>
        <p>Por favor, vuelve a intentarlo más tarde.</p>
      </main>
    );
  const { token } = await params;
  const data = await invitation(token);
  if (!data) notFound();
  return <Envelope data={data} token={token} />;
}
