'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { serverClient, configured } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
export async function login(form: FormData) {
  if (!configured()) redirect('/admin/login?error=setup');
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/admin/login?error=credentials');
  const db = await serverClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) redirect('/admin/login?error=credentials');
  redirect('/admin/dashboard');
}
export async function logout() {
  const db = await serverClient();
  await db.auth.signOut();
  redirect('/admin/login');
}
export async function selectWedding(form: FormData) {
  const { weddings } = await requireAdmin();
  const id = String(form.get('wedding_id'));
  if (weddings.some((w) => w.id === id))
    (await cookies()).set('wedding_id', id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  redirect('/admin/dashboard');
}
