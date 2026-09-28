'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveRecord } from '@/actions/manage';
import type { Guest, Location, WeddingEvent } from '@/types/domain';
import { LocationMap } from '@/components/maps/map-loader';
type RecordData = Partial<Guest & Location & WeddingEvent>;
export function RecordForm({
  section,
  record,
  locations = [],
  onClose,
}: {
  section: 'guests' | 'locations' | 'events';
  record?: RecordData;
  locations?: Location[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [savedId, setSavedId] = useState(record?.id ?? null);
  const [lat, setLat] = useState(record?.latitude ?? 3.4516);
  const [lng, setLng] = useState(record?.longitude ?? -76.532);
  const r = record ?? {};
  const field = (
    name: string,
    label: string,
    value: string | number | undefined,
    type = 'text',
    required = false,
  ) => (
    <label key={name}>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value ?? ''}
        required={required}
        maxLength={name === 'phone' ? 40 : 150}
        {...(name === 'guest_limit'
          ? { min: 1, max: 30 }
          : name === 'display_order'
            ? { min: 0, max: 999 }
            : {})}
      />
    </label>
  );
  return (
    <div className="editor panel">
      <div className="editor-title">
        <h2>
          {record ? 'Editar' : 'Agregar'}{' '}
          {section === 'guests'
            ? 'invitado'
            : section === 'locations'
              ? 'lugar'
              : 'evento'}
        </h2>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario"
        >
          ✕
        </button>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const fd = new FormData(e.currentTarget);
          const input: Record<string, unknown> = Object.fromEntries(fd);
          if (section !== 'guests')
            input.is_active = fd.get('is_active') === 'on';
          try {
            const result = await saveRecord(section, savedId, input);
            setMessage(result.message);
            if (result.ok) {
              if (result.id) setSavedId(result.id);
              if (result.url)
                setLink(new URL(result.url, window.location.origin).href);
              router.refresh();
              if (!result.url) onClose();
            }
          } catch {
            setMessage(
              'No se pudo guardar. Revisa tu sesión e inténtalo nuevamente.',
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="form-grid">
          {field('name', 'Nombre *', r.name, 'text', true)}
          {section === 'guests' ? (
            <>
              {field(
                'guest_limit',
                'Cupos totales *',
                r.guest_limit ?? 1,
                'number',
                true,
              )}
              {field('phone', 'Teléfono', r.phone ?? '', 'tel')}
              {field('email', 'Email', r.email ?? '', 'email')}
              <label className="full">
                Notas privadas
                <textarea
                  name="notes"
                  defaultValue={r.notes ?? ''}
                  maxLength={2000}
                />
              </label>
            </>
          ) : section === 'locations' ? (
            <>
              {field('address', 'Dirección', r.address)}
              {field('city', 'Ciudad *', r.city, 'text', true)}
              {field('state', 'Departamento / estado', r.state)}
              {field(
                'country',
                'País *',
                r.country ?? 'Colombia',
                'text',
                true,
              )}
              {field(
                'parking_information',
                'Estacionamiento',
                r.parking_information,
              )}
              <label className="full">
                Descripción
                <textarea
                  name="description"
                  defaultValue={r.description ?? ''}
                  maxLength={2000}
                />
              </label>
              <label className="full">
                Información adicional
                <textarea
                  name="additional_information"
                  defaultValue={r.additional_information ?? ''}
                  maxLength={2000}
                />
              </label>
              <label>
                Latitud
                <input
                  name="latitude"
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                />
              </label>
              <label>
                Longitud
                <input
                  name="longitude"
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                />
              </label>
              <div className="full">
                <p className="small muted">
                  Haz clic en el mapa, arrastra el marcador o escribe las
                  coordenadas.
                </p>
                <LocationMap
                  latitude={lat}
                  longitude={lng}
                  onChange={(a, b) => {
                    setLat(a);
                    setLng(b);
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <label>
                Tipo
                <select name="type" defaultValue={r.type ?? 'CEREMONY'}>
                  {[
                    ['CEREMONY', 'Ceremonia'],
                    ['RECEPTION', 'Recepción'],
                    ['DINNER', 'Cena'],
                    ['PARTY', 'Fiesta'],
                    ['OTHER', 'Otro'],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Lugar
                <select name="location_id" defaultValue={r.location_id ?? ''}>
                  <option value="">Sin lugar asignado</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                      {!l.is_active ? ' (oculto)' : ''}
                    </option>
                  ))}
                </select>
              </label>
              {field('event_date', 'Fecha *', r.event_date, 'date', true)}
              {field(
                'start_time',
                'Hora de inicio *',
                r.start_time?.slice(0, 5),
                'time',
                true,
              )}
              {field(
                'end_time',
                'Hora de fin',
                r.end_time?.slice(0, 5),
                'time',
              )}
              {field(
                'display_order',
                'Orden',
                r.display_order ?? 0,
                'number',
                true,
              )}
              <label className="full">
                Descripción
                <textarea
                  name="description"
                  defaultValue={r.description ?? ''}
                  maxLength={2000}
                />
              </label>
            </>
          )}
          {section !== 'guests' && (
            <label className="checkbox full">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={r.is_active ?? true}
              />{' '}
              Visible en la invitación
            </label>
          )}
        </div>
        <div className="form-actions">
          <button className="button" disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button className="button secondary" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <p role="status">{message}</p>
        {link && (
          <div className="notice">
            <label>
              Enlace personal
              <input readOnly value={link} onFocus={(e) => e.target.select()} />
            </label>
            <button
              type="button"
              className="text-link"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setMessage('Enlace copiado.');
                } catch {
                  setMessage('Selecciona el enlace para copiarlo.');
                }
              }}
            >
              Copiar enlace
            </button>{' '}
            ·{' '}
            <a href={link} target="_blank" rel="noreferrer">
              Abrir invitación ↗
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
