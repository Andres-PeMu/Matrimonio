import 'server-only';
import { adminClient } from '@/lib/supabase/admin';
import { tokenSchema } from '@/lib/validations';
import type {
  PublicWedding,
  Invitation,
  Wedding,
  Settings,
  Location,
  WeddingEvent,
  Media,
  Confirmation,
} from '@/types/domain';
export async function publicWedding(
  id?: string,
): Promise<PublicWedding | null> {
  const db = adminClient();
  let query = db
    .from('weddings')
    .select(
      'id,slug,bride_name,groom_name,title,description,wedding_date,timezone,rsvp_deadline,status',
    )
    .eq('status', 'PUBLISHED');
  query = id
    ? query.eq('id', id)
    : query.eq('slug', process.env.WEDDING_SLUG || 'astrid-andres');
  const { data: wedding, error } = await query.maybeSingle();
  if (error) throw new Error('No se pudo cargar la invitación.');
  if (!wedding) return null;
  const results = await Promise.all([
    db
      .from('wedding_settings')
      .select('*')
      .eq('wedding_id', wedding.id)
      .single(),
    db
      .from('wedding_events')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('is_active', true)
      .order('display_order')
      .order('created_at'),
    db
      .from('locations')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('is_active', true),
    db
      .from('wedding_media')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('display_order')
      .order('created_at'),
  ]);
  if (results.some((r) => r.error))
    throw new Error('No se pudo cargar la invitación.');
  const w = wedding as Wedding;
  const s = results[0].data as Settings;
  return {
    wedding: {
      bride_name: w.bride_name,
      groom_name: w.groom_name,
      title: w.title,
      description: w.description,
      wedding_date: w.wedding_date,
      timezone: w.timezone,
      rsvp_deadline: w.rsvp_deadline,
    },
    settings: {
      envelope_message: s.envelope_message,
      story: s.story,
      dress_code: s.dress_code,
      final_message: s.final_message,
      show_story: s.show_story,
      show_countdown: s.show_countdown,
      show_gallery: s.show_gallery,
      show_maps: s.show_maps,
      show_dress_code: s.show_dress_code,
      show_rsvp: s.show_rsvp,
      show_music: s.show_music,
      music_url: s.music_url,
    },
    events: (results[1].data as WeddingEvent[]).map((e) => ({
      id: e.id,
      location_id: e.location_id,
      name: e.name,
      type: e.type,
      description: e.description,
      event_date: e.event_date,
      start_time: e.start_time,
      end_time: e.end_time,
      display_order: e.display_order,
      is_active: e.is_active,
    })),
    locations: (results[2].data as Location[]).map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      address: l.address,
      city: l.city,
      state: l.state,
      country: l.country,
      latitude: l.latitude,
      longitude: l.longitude,
      parking_information: l.parking_information,
      additional_information: l.additional_information,
      is_active: l.is_active,
    })),
    media: (results[3].data as Media[]).map((m) => ({
      id: m.id,
      type: m.type,
      alt_text: m.alt_text,
      url: db.storage.from('wedding-media').getPublicUrl(m.storage_path).data
        .publicUrl,
    })),
  };
}
export async function invitation(token: string): Promise<Invitation | null> {
  if (!tokenSchema.safeParse(token).success) return null;
  const db = adminClient();
  const { data: g, error } = await db
    .from('guests')
    .select('id,wedding_id,name,guest_limit,status')
    .eq('invitation_token', token)
    .maybeSingle();
  if (error) throw new Error('No se pudo cargar la invitación.');
  if (!g) return null;
  const data = await publicWedding(g.wedding_id);
  if (!data) return null;
  const { data: c, error: ce } = await db
    .from('guest_confirmations')
    .select('status,attendees_count,message,attendees(name,is_primary_guest)')
    .eq('guest_id', g.id)
    .order('display_order', { referencedTable: 'attendees' })
    .maybeSingle();
  if (ce) throw new Error('No se pudo cargar tu confirmación.');
  return {
    ...data,
    guest: {
      name: g.name,
      guest_limit: g.guest_limit,
      status: g.status as Invitation['guest']['status'],
    },
    confirmation: c as Pick<
      Confirmation,
      'status' | 'attendees_count' | 'message' | 'attendees'
    > | null,
  };
}
