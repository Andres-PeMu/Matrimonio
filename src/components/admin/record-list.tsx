'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecordForm } from './record-form';
import { deleteRecord, regenerateToken } from '@/actions/manage';
import type {
  Guest,
  Location,
  WeddingEvent,
  Confirmation,
} from '@/types/domain';
export const statusNames = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  DECLINED: 'No asistirá',
};
type Row = Guest | Location | WeddingEvent;
export function RecordList({
  section,
  rows,
  locations = [],
  confirmations = [],
}: {
  section: 'guests' | 'locations' | 'events';
  rows: Row[];
  locations?: Location[];
  confirmations?: Confirmation[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [feedback, setFeedback] = useState('');
  const [pending, setPending] = useState(false);
  async function copy(token: string) {
    const url = new URL(`/i/${token}`, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback('Enlace copiado.');
    } catch {
      setFeedback(`Copia este enlace: ${url}`);
    }
  }
  return (
    <>
      <div className="list-toolbar">
        <p className="muted">
          {section === 'guests'
            ? 'Cada invitación, un lugar en nuestra historia.'
            : section === 'locations'
              ? 'Los escenarios de un día inolvidable.'
              : 'Cada momento tiene su lugar.'}
        </p>
        <button className="button" onClick={() => setEditing(null)}>
          ＋ Agregar{' '}
          {section === 'guests'
            ? 'invitado'
            : section === 'locations'
              ? 'lugar'
              : 'evento'}
        </button>
      </div>
      {editing !== undefined && (
        <RecordForm
          key={editing?.id ?? 'new'}
          section={section}
          record={editing ?? undefined}
          locations={locations}
          onClose={() => setEditing(undefined)}
        />
      )}
      <p role="status" className="feedback">
        {feedback}
      </p>
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              {section === 'guests' ? (
                <>
                  <th>Cupos</th>
                  <th>Asistentes</th>
                  <th>Estado</th>
                  <th>Teléfono</th>
                  <th>Confirmación</th>
                </>
              ) : (
                <>
                  <th>
                    {section === 'locations' ? 'Dirección' : 'Fecha / hora'}
                  </th>
                  <th>Visibilidad</th>
                </>
              )}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const c = confirmations.find((c) => c.guest_id === r.id);
              return (
                <tr key={r.id}>
                  <td data-label="Nombre">
                    <strong>{r.name}</strong>
                    {'email' in r && r.email && <small>{r.email}</small>}
                  </td>
                  {'guest_limit' in r ? (
                    <>
                      <td data-label="Cupos">{r.guest_limit}</td>
                      <td data-label="Asistentes">{c?.attendees_count ?? 0}</td>
                      <td data-label="Estado">
                        <span className={`badge ${r.status.toLowerCase()}`}>
                          {statusNames[r.status]}
                        </span>
                      </td>
                      <td data-label="Teléfono">{r.phone || '—'}</td>
                      <td data-label="Confirmación">
                        {c
                          ? new Date(c.confirmed_at).toLocaleDateString(
                              'es-CO',
                              { timeZone: 'America/Bogota' },
                            )
                          : '—'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        data-label={
                          section === 'locations' ? 'Dirección' : 'Fecha / hora'
                        }
                      >
                        {'address' in r
                          ? r.address
                          : `${r.event_date} · ${r.start_time.slice(0, 5)}`}
                      </td>
                      <td data-label="Visibilidad">
                        <span className="badge">
                          {r.is_active ? 'Visible' : 'Oculto'}
                        </span>
                      </td>
                    </>
                  )}
                  <td data-label="Acciones">
                    <div className="row-actions">
                      {'invitation_token' in r && (
                        <>
                          <button
                            title="Copiar enlace"
                            aria-label={`Copiar enlace de ${r.name}`}
                            onClick={() => copy(r.invitation_token)}
                          >
                            ⧉
                          </button>
                          <a
                            title="Abrir invitación"
                            aria-label={`Abrir invitación de ${r.name}`}
                            href={`/i/${r.invitation_token}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            ↗
                          </a>
                          <button
                            title="Compartir"
                            aria-label={`Compartir invitación de ${r.name}`}
                            onClick={async () => {
                              const url = new URL(
                                `/i/${r.invitation_token}`,
                                window.location.origin,
                              ).href;
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: 'Nuestra boda',
                                    url,
                                  });
                                } catch {}
                              } else await copy(r.invitation_token);
                            }}
                          >
                            ↥
                          </button>
                          <button
                            title="Regenerar enlace"
                            disabled={pending}
                            onClick={async () => {
                              if (
                                !confirm(
                                  'El enlace anterior dejará de funcionar. ¿Regenerar enlace?',
                                )
                              )
                                return;
                              setPending(true);
                              try {
                                const result = await regenerateToken(r.id);
                                setFeedback(result.message);
                                router.refresh();
                              } catch {
                                setFeedback('No se pudo regenerar el enlace.');
                              } finally {
                                setPending(false);
                              }
                            }}
                          >
                            ↻
                          </button>
                        </>
                      )}
                      <button
                        title="Editar"
                        aria-label={`Editar ${r.name}`}
                        onClick={() => setEditing(r)}
                      >
                        ✎
                      </button>
                      <button
                        title="Eliminar"
                        aria-label={`Eliminar ${r.name}`}
                        className="danger"
                        disabled={pending}
                        onClick={async () => {
                          if (
                            !confirm(
                              `¿Eliminar ${r.name}?${section === 'guests' ? ' También se eliminarán su confirmación y sus asistentes.' : ''}`,
                            )
                          )
                            return;
                          setPending(true);
                          try {
                            const result = await deleteRecord(section, r.id);
                            setFeedback(result.message);
                            router.refresh();
                          } catch {
                            setFeedback('No se pudo eliminar el registro.');
                          } finally {
                            setPending(false);
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="empty-state">
            <span>❦</span>
            <h3>Todavía no hay registros</h3>
            <p>Agrega el primero o cambia los filtros de búsqueda.</p>
          </div>
        )}
      </div>
    </>
  );
}
