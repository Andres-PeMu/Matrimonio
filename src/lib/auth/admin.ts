import 'server-only';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { configured, serverClient } from '@/lib/supabase/server';
import type { Wedding } from '@/types/domain';
export async function requireAdmin() {
  if (!configured()) redirect('/admin/login');
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: profile } = await db
    .from('profiles')
    .select('role,display_name')
    .eq('id', user.id)
    .single();
  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role))
    redirect('/admin/login?error=access');
  const { data, error } = await db
    .from('weddings')
    .select('*')
    .order('created_at');
  if (error) throw new Error('No pudimos cargar tus bodas.');
  const weddings = (data ?? []) as Wedding[];
  const selected = (await cookies()).get('wedding_id')?.value;
  const wedding = weddings.find((w) => w.id === selected) ?? weddings[0];
  return { db, user, profile, weddings, wedding };
}
export async function requireWedding() {
  const context = await requireAdmin();
  if (!context.wedding)
    throw new Error('Tu cuenta todavía no tiene una boda asignada.');
  return context;
}
