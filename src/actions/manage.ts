'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Database } from '@/types/database';
import { requireWedding } from '@/lib/auth/admin';
import { generateInvitationToken } from '@/lib/tokens';
import {
  guestSchema,
  locationSchema,
  eventSchema,
  settingsSchema,
  weddingSchema,
  mediaSchema,
} from '@/lib/validations';
export type ActionResult = {
  ok: boolean;
  message: string;
  url?: string;
  id?: string;
};
const tables = {
  guests: 'guests',
  locations: 'locations',
  events: 'wedding_events',
  gallery: 'wedding_media',
} as const;
export async function saveRecord(
  section: string,
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  const { db, wedding } = await requireWedding();
  if (id && !z.uuid().safeParse(id).success)
    return { ok: false, message: 'Registro inválido.' };
  const schema =
    section === 'guests'
      ? guestSchema
      : section === 'locations'
        ? locationSchema
        : section === 'events'
          ? eventSchema
          : section === 'gallery'
            ? mediaSchema
            : null;
  if (!schema) return { ok: false, message: 'Operación inválida.' };
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };
  const table = tables[section as keyof typeof tables];
  if (section === 'gallery' && !id)
    return { ok: false, message: 'Primero sube una fotografía.' };
  type ManagedTable = (typeof tables)[keyof typeof tables];
  type ManagedUpdate = Database['public']['Tables'][ManagedTable]['Update'];
  const payload: ManagedUpdate = {
    ...parsed.data,
    wedding_id: wedding.id,
    ...(section === 'guests' && !id
      ? { invitation_token: generateInvitationToken() }
      : {}),
  };
  const query = id
    ? db.from(table).update(payload).eq('id', id).eq('wedding_id', wedding.id)
    : section === 'guests'
      ? db
          .from('guests')
          .insert(payload as Database['public']['Tables']['guests']['Insert'])
      : section === 'locations'
        ? db
            .from('locations')
            .insert(
              payload as Database['public']['Tables']['locations']['Insert'],
            )
        : db
            .from('wedding_events')
            .insert(
              payload as Database['public']['Tables']['wedding_events']['Insert'],
            );
  const { data, error } = await query.select('*').single();
  if (error)
    return {
      ok: false,
      message: error.message.includes('LIMIT_BELOW_CONFIRMED')
        ? 'No puedes reducir los cupos por debajo de los asistentes confirmados.'
        : 'No se pudo guardar. Revisa los campos e inténtalo de nuevo.',
    };
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  return {
    ok: true,
    message: 'Cambios guardados.',
    id: data.id,
    ...('invitation_token' in data
      ? { url: `/i/${data.invitation_token}` }
      : {}),
  };
}
export async function deleteRecord(
  section: string,
  id: string,
): Promise<ActionResult> {
  const { db, wedding } = await requireWedding();
  if (!Object.hasOwn(tables, section) || !z.uuid().safeParse(id).success)
    return { ok: false, message: 'Registro inválido.' };
  const table = tables[section as keyof typeof tables];
  if (section === 'gallery') {
    const { data } = await db
      .from('wedding_media')
      .select('storage_path')
      .eq('id', id)
      .eq('wedding_id', wedding.id)
      .single();
    if (!data) return { ok: false, message: 'Fotografía no encontrada.' };
    const { error } = await db.storage
      .from('wedding-media')
      .remove([data.storage_path]);
    if (error) return { ok: false, message: 'No se pudo eliminar el archivo.' };
  }
  const { error } = await db
    .from(table)
    .delete()
    .eq('id', id)
    .eq('wedding_id', wedding.id);
  if (error)
    return {
      ok: false,
      message:
        'No se pudo eliminar. Si es un lugar, primero desvincula sus eventos.',
    };
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  return { ok: true, message: 'Registro eliminado.' };
}
export async function regenerateToken(id: string): Promise<ActionResult> {
  const { db, wedding } = await requireWedding();
  const token = generateInvitationToken();
  const { error } = await db
    .from('guests')
    .update({ invitation_token: token })
    .eq('id', id)
    .eq('wedding_id', wedding.id)
    .select('id')
    .single();
  if (error) return { ok: false, message: 'No se pudo regenerar el enlace.' };
  revalidatePath('/admin', 'layout');
  return {
    ok: true,
    message: 'El enlace anterior dejó de funcionar.',
    url: `/i/${token}`,
  };
}
export async function saveSettings(input: unknown): Promise<ActionResult> {
  const { db, wedding } = await requireWedding();
  const parsed = z
    .object({ wedding: weddingSchema, settings: settingsSchema })
    .safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };
  const { error } = await db.rpc('save_wedding_settings', {
    p_id: wedding.id,
    p_wedding: parsed.data.wedding,
    p_settings: parsed.data.settings,
  });
  if (error)
    return { ok: false, message: 'No se pudo guardar la configuración.' };
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  return { ok: true, message: 'Configuración guardada.' };
}
export async function uploadPhoto(form: FormData): Promise<ActionResult> {
  const { db, wedding } = await requireWedding();
  const file = form.get('file');
  const parsed = mediaSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > 4 * 1024 * 1024 ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  )
    return {
      ok: false,
      message: 'Sube una imagen JPG, PNG o WebP de hasta 4 MB.',
    };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const valid =
    file.type === 'image/jpeg'
      ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : file.type === 'image/png'
        ? bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
        : new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
          new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  if (!valid)
    return {
      ok: false,
      message: 'El contenido del archivo no corresponde a una imagen válida.',
    };
  const path = `${wedding.id}/${generateInvitationToken()}.${file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]}`;
  const { error } = await db.storage
    .from('wedding-media')
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return { ok: false, message: 'No se pudo subir la fotografía.' };
  const { error: insertError } = await db
    .from('wedding_media')
    .insert({ ...parsed.data, wedding_id: wedding.id, storage_path: path });
  if (insertError) {
    await db.storage.from('wedding-media').remove([path]);
    return { ok: false, message: 'No se pudo registrar la fotografía.' };
  }
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  return { ok: true, message: 'Fotografía subida.' };
}
