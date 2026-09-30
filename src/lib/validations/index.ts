import { z } from 'zod';
const text = z.string().trim().max(2000);
const name = z.string().trim().min(1, 'Este campo es obligatorio.').max(150);
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,128}$/);
export const guestSchema = z.object({
  name,
  phone: z.string().trim().max(40).default(''),
  email: z.union([z.email(), z.literal('')]).default(''),
  guest_limit: z.coerce.number().int().min(1).max(30),
  notes: text.default(''),
});
export const rsvpSchema = z
  .object({
    token: tokenSchema,
    status: z.enum(['CONFIRMED', 'DECLINED']),
    names: z.array(name).max(30),
    message: text.default(''),
  })
  .superRefine((v, c) => {
    if (
      (v.status === 'CONFIRMED' && v.names.length === 0) ||
      (v.status === 'DECLINED' && v.names.length !== 0)
    )
      c.addIssue({
        code: 'custom',
        message: 'Revisa los nombres de los asistentes.',
      });
  });
export function validateRsvpLimit(count: number, limit: number) {
  if (count > limit)
    throw new Error('La cantidad supera los cupos de tu invitación.');
}
export const locationSchema = z.object({
  name,
  description: text,
  address: text,
  city: name,
  state: text,
  country: name,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  parking_information: text,
  additional_information: text,
  is_active: z.boolean(),
});
export const eventSchema = z
  .object({
    name,
    type: z.enum(['CEREMONY', 'RECEPTION', 'DINNER', 'PARTY', 'OTHER']),
    description: text,
    location_id: z.union([z.uuid(), z.literal('')]).transform((v) => v || null),
    event_date: z.iso.date(),
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    end_time: z
      .string()
      .regex(/^(\d{2}:\d{2}(:\d{2})?)?$/)
      .transform((v) => v || null),
    display_order: z.coerce.number().int().min(0).max(999),
    is_active: z.boolean(),
  })
  .refine((v) => !v.end_time || v.end_time > v.start_time, {
    message: 'La hora final debe ser posterior a la inicial.',
  });
export const weddingSchema = z.object({
  bride_name: name,
  groom_name: name,
  title: name,
  description: text,
  wedding_date: z.iso.datetime({ offset: true }),
  rsvp_deadline: z.iso.datetime({ offset: true }),
  timezone: z.string().refine((v) => {
    try {
      new Intl.DateTimeFormat('es', { timeZone: v });
      return true;
    } catch {
      return false;
    }
  }, 'Zona horaria inválida.'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
export const settingsSchema = z.object({
  envelope_message: text,
  story: text,
  dress_code: text,
  final_message: text,
  show_story: z.boolean(),
  show_countdown: z.boolean(),
  show_gallery: z.boolean(),
  show_maps: z.boolean(),
  show_dress_code: z.boolean(),
  show_rsvp: z.boolean(),
  show_music: z.boolean(),
  music_url: z.union([
    z.url().refine((v) => v.startsWith('https://'), 'Usa una URL HTTPS.'),
    z.literal(''),
  ]),
});
export const mediaSchema = z.object({
  alt_text: name,
  type: z.enum(['COVER', 'GALLERY']),
  display_order: z.coerce.number().int().min(0).max(999),
});
