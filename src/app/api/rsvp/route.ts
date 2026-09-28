import { NextResponse } from 'next/server';
import { rsvpSchema, validateRsvpLimit } from '@/lib/validations';
import { adminClient } from '@/lib/supabase/admin';
import { configured } from '@/lib/supabase/server';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin)
    return NextResponse.json(
      { message: 'Solicitud no permitida.' },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      { message: 'La invitación aún no está disponible.' },
      { status: 503 },
    );
  if (Number(request.headers.get('content-length') || 0) > 16000)
    return NextResponse.json(
      { message: 'Solicitud demasiado grande.' },
      { status: 413 },
    );
  try {
    const raw = await request.text();
    if (raw.length > 16000)
      return NextResponse.json(
        { message: 'Solicitud demasiado grande.' },
        { status: 413 },
      );
    const parsed = rsvpSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return NextResponse.json(
        { message: 'Revisa los nombres y la cantidad de asistentes.' },
        { status: 400 },
      );
    const v = parsed.data;
    const db = adminClient();
    const { data: g, error } = await db
      .from('guests')
      .select('guest_limit,wedding_id')
      .eq('invitation_token', v.token)
      .maybeSingle();
    if (error) throw error;
    if (!g)
      return NextResponse.json(
        { message: 'Invitación no encontrada.' },
        { status: 404 },
      );
    const { data: w } = await db
      .from('weddings')
      .select('rsvp_deadline,status')
      .eq('id', g.wedding_id)
      .single();
    if (!w || w.status !== 'PUBLISHED')
      return NextResponse.json(
        { message: 'Invitación no encontrada.' },
        { status: 404 },
      );
    try {
      validateRsvpLimit(v.names.length, g.guest_limit, w.rsvp_deadline);
    } catch (e) {
      return NextResponse.json(
        { message: (e as Error).message },
        { status: 400 },
      );
    }
    const { error: saveError } = await db.rpc('submit_rsvp', {
      p_token: v.token,
      p_status: v.status,
      p_names: v.names,
      p_message: v.message,
    });
    if (saveError) {
      const msg = saveError.message.includes('DEADLINE_PASSED')
        ? 'El periodo de confirmación ha finalizado.'
        : saveError.message.includes('INVALID_ATTENDEES')
          ? 'Revisa los cupos de tu invitación.'
          : 'No se pudo guardar tu respuesta. Comprueba que el enlace siga vigente.';
      return NextResponse.json({ message: msg }, { status: 400 });
    }
    return NextResponse.json(
      {
        message:
          v.status === 'CONFIRMED'
            ? 'Tu asistencia está confirmada. ¡Nos vemos pronto!'
            : 'Gracias por hacernos saber tu respuesta.',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { message: 'No pudimos guardar tu respuesta. Inténtalo nuevamente.' },
      { status: 503 },
    );
  }
}
