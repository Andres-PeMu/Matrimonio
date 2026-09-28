import Link from 'next/link';
import { Check, Clock, Heart, Mail, Minus, Users } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { RecordList, statusNames } from '@/components/admin/record-list';
import { SettingsForm } from '@/components/admin/settings-form';
import { Gallery } from '@/components/admin/gallery';
import type {
  Guest,
  Confirmation,
  Location,
  WeddingEvent,
  Settings,
  Media,
} from '@/types/domain';
const titles: Record<string, [string, string]> = {
  dashboard: [
    'Todo listo para el gran día',
    'Una mirada a los preparativos de su celebración.',
  ],
  guests: [
    'Nuestros invitados',
    'Las personas que harán este día aún más especial.',
  ],
  confirmations: [
    'Confirmaciones',
    'Respuestas, nombres y mensajes de tus invitados.',
  ],
  locations: ['Lugares con encanto', 'Los escenarios de nuestra celebración.'],
  events: ['Fecha y eventos', 'Organiza cada momento de su gran día.'],
  gallery: ['Nuestra galería', 'Recuerdos para compartir y volver a vivir.'],
  settings: [
    'Cada detalle, a su manera',
    'Personaliza la invitación y toda la información de la boda.',
  ],
};
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { section } = await params;
  if (!titles[section]) notFound();
  const { db, wedding } = await requireAdmin();
  if (!wedding) return null;
  const search = await searchParams;
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(search.page) || 1)),
  );
  const size = 20;
  const title = titles[section];
  const heading = (
    <div className="page-heading">
      <span className="eyebrow">
        {wedding.bride_name} & {wedding.groom_name}
      </span>
      <h1>{title[0]}</h1>
      <p>{title[1]}</p>
    </div>
  );
  const check = (error: unknown) => {
    if (error) throw new Error('No se pudo cargar la información.');
  };
  if (section === 'dashboard') {
    const [{ data: stats, error }, { data: recent, error: re }] =
      await Promise.all([
        db.rpc('wedding_stats', { p_id: wedding.id }),
        db
          .from('guest_confirmations')
          .select('id,status,attendees_count,confirmed_at,guests(name)')
          .eq('wedding_id', wedding.id)
          .order('confirmed_at', { ascending: false })
          .limit(8),
      ]);
    check(error);
    check(re);
    const metrics = stats as Record<string, number> | null;
    const items = [
      ['invitations', 'Invitaciones creadas', Mail],
      ['capacity', 'Cupos totales', Users],
      ['confirmed', 'Invitaciones confirmadas', Check],
      ['attendees', 'Personas confirmadas', Heart],
      ['declined', 'No asistirán', Minus],
      ['pending', 'Pendientes', Clock],
    ] as const;
    return (
      <>
        {heading}
        <div className="dashboard-banner">
          <div>
            <span className="eyebrow">SU PRÓXIMO CAPÍTULO</span>
            <h2>
              {new Intl.DateTimeFormat('es-CO', {
                dateStyle: 'long',
                timeZone: wedding.timezone,
              }).format(new Date(wedding.wedding_date))}
            </h2>
            <p>Un día especial empieza con pequeños detalles.</p>
          </div>
          <Link href="/admin/guests" className="button">
            Gestionar invitados →
          </Link>
        </div>
        <div className="stats-grid">
          {items.map(([key, label, Icon]) => (
            <article className="stat-card" key={key}>
              <span className={`stat-icon ${key}`}>
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <strong>{metrics?.[key] ?? 0}</strong>
                <p>{label}</p>
              </div>
            </article>
          ))}
        </div>
        <section className="panel">
          <div className="editor-title">
            <h2>Las últimas respuestas</h2>
            <Link href="/admin/confirmations" className="text-link">
              Ver todas →
            </Link>
          </div>
          {!recent?.length ? (
            <div className="empty-state">
              <p>
                Las respuestas aparecerán aquí cuando tus invitados confirmen.
              </p>
            </div>
          ) : (
            <ul className="recent-list">
              {recent.map((r) => {
                const guest = r.guests as unknown as { name: string };
                return (
                  <li key={r.id}>
                    <span className="guest-avatar">
                      {guest?.name?.[0] ?? (
                        <Heart size={16} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <strong>{guest?.name}</strong>
                      <small>
                        {r.attendees_count} asistentes ·{' '}
                        {new Date(r.confirmed_at).toLocaleDateString('es-CO', {
                          timeZone: wedding.timezone,
                        })}
                      </small>
                    </div>
                    <span className={`badge ${r.status.toLowerCase()}`}>
                      {statusNames[r.status as keyof typeof statusNames]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </>
    );
  }
  if (section === 'settings') {
    const { data, error } = await db
      .from('wedding_settings')
      .select('*')
      .eq('wedding_id', wedding.id)
      .single();
    check(error);
    return (
      <>
        {heading}
        <SettingsForm wedding={wedding} settings={data as Settings} />
      </>
    );
  }
  if (section === 'gallery') {
    const { data, error } = await db
      .from('wedding_media')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('display_order');
    check(error);
    const media = (data as Media[]).map((m) => ({
      ...m,
      url: db.storage.from('wedding-media').getPublicUrl(m.storage_path).data
        .publicUrl,
    }));
    return (
      <>
        {heading}
        <Gallery media={media} />
      </>
    );
  }
  if (section === 'confirmations') {
    const { data, error, count } = await db
      .from('guest_confirmations')
      .select('*,guests(name),attendees(name,is_primary_guest)', {
        count: 'exact',
      })
      .eq('wedding_id', wedding.id)
      .order('confirmed_at', { ascending: false })
      .range((page - 1) * size, page * size - 1);
    check(error);
    return (
      <>
        {heading}
        <div className="confirmation-grid">
          {data?.map((c) => (
            <article className="panel" key={c.id}>
              <span className={`badge ${c.status.toLowerCase()}`}>
                {statusNames[c.status as keyof typeof statusNames]}
              </span>
              <h2>{(c.guests as { name: string })?.name}</h2>
              <p>
                {c.attendees_count} asistentes ·{' '}
                {new Date(c.confirmed_at).toLocaleString('es-CO', {
                  timeZone: wedding.timezone,
                })}
              </p>
              <ul>
                {(c.attendees as { name: string }[]).map((a, i) => (
                  <li key={i}>{a.name}</li>
                ))}
              </ul>
              {c.message && <blockquote>{c.message}</blockquote>}
            </article>
          ))}
        </div>
        {!data?.length && (
          <div className="empty-state">Aún no hay respuestas.</div>
        )}
        <Pagination page={page} count={count ?? 0} section={section} />
      </>
    );
  }
  const table =
    section === 'guests'
      ? 'guests'
      : section === 'events'
        ? 'wedding_events'
        : 'locations';
  let query = db
    .from(table)
    .select('*', { count: 'exact' })
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false });
  const q = (search.q ?? '').slice(0, 150).replace(/[%_\\]/g, '');
  if (q) query = query.ilike('name', `%${q}%`);
  if (
    section === 'guests' &&
    ['PENDING', 'CONFIRMED', 'DECLINED'].includes(search.status ?? '')
  )
    query = query.filter('status', 'eq', search.status!);
  const { data, error, count } = await query.range(
    (page - 1) * size,
    page * size - 1,
  );
  check(error);
  const { data: locations, error: le } =
    section === 'events'
      ? await db
          .from('locations')
          .select('*')
          .eq('wedding_id', wedding.id)
          .order('name')
      : { data: [], error: null };
  check(le);
  const ids = (data ?? []).map((r) => r.id);
  const { data: confirmations, error: ce } =
    section === 'guests' && ids.length
      ? await db
          .from('guest_confirmations')
          .select('*')
          .eq('wedding_id', wedding.id)
          .in('guest_id', ids)
      : { data: [], error: null };
  check(ce);
  return (
    <>
      {heading}
      {section === 'events' && (
        <p className="notice">
          La fecha principal y el plazo de confirmación se editan en{' '}
          <Link href="/admin/settings">Configuración</Link>. Horarios de
          eventos: {wedding.timezone}.
        </p>
      )}
      <form className="filter-bar" method="get">
        <label className="search-label">
          <span className="sr-only">Buscar por nombre</span>
          <input
            name="q"
            defaultValue={search.q}
            placeholder="⌕  Buscar por nombre…"
          />
        </label>
        {section === 'guests' && (
          <label>
            <span className="sr-only">Filtrar estado</span>
            <select name="status" defaultValue={search.status ?? ''}>
              <option value="">Todos los estados</option>
              {Object.entries(statusNames).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="button secondary">Buscar</button>
      </form>
      <RecordList
        section={section as 'guests' | 'locations' | 'events'}
        rows={data as (Guest | Location | WeddingEvent)[]}
        locations={locations as Location[]}
        confirmations={confirmations as Confirmation[]}
      />
      <Pagination
        section={section}
        page={page}
        count={count ?? 0}
        q={q}
        status={search.status}
      />
    </>
  );
}
function Pagination({
  section,
  page,
  count,
  q = '',
  status = '',
}: {
  section: string;
  page: number;
  count: number;
  q?: string;
  status?: string;
}) {
  const pages = Math.max(1, Math.ceil(count / 20));
  const url = (p: number) =>
    `/admin/${section}?${new URLSearchParams({ page: String(p), q, status })}`;
  return (
    <div className="pagination">
      <span>
        {count} registros · Página {page} de {pages}
      </span>
      <div>
        {page > 1 && <Link href={url(page - 1)}>← Anterior</Link>}
        {page < pages && <Link href={url(page + 1)}>Siguiente →</Link>}
      </div>
    </div>
  );
}
