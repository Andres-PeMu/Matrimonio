'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Settings, Wedding } from '@/types/domain';
import { saveSettings } from '@/actions/manage';
import { localDateTime, zonedToIso } from '@/lib/dates';
const toggles = [
  ['show_story', 'Nuestra historia'],
  ['show_countdown', 'Cuenta regresiva'],
  ['show_gallery', 'Galería'],
  ['show_maps', 'Mapas'],
  ['show_dress_code', 'Código de vestimenta'],
  ['show_rsvp', 'Confirmación de asistencia'],
  ['show_music', 'Reproductor de música'],
] as const;
export function SettingsForm({
  wedding: w,
  settings: s,
}: {
  wedding: Wedding;
  settings: Settings;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  return (
    <form
      className="settings-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const f = new FormData(e.currentTarget);
        const val = (key: string) => String(f.get(key) ?? '');
        try {
          const wedding = {
            bride_name: val('bride_name'),
            groom_name: val('groom_name'),
            title: val('title'),
            description: val('description'),
            timezone: val('timezone'),
            wedding_date: zonedToIso(val('wedding_date'), val('timezone')),
            rsvp_deadline: zonedToIso(val('rsvp_deadline'), val('timezone')),
            status: val('status'),
          };
          const settings = {
            envelope_message: val('envelope_message'),
            story: val('story'),
            dress_code: val('dress_code'),
            final_message: val('final_message'),
            music_url: val('music_url'),
            ...Object.fromEntries(toggles.map(([key]) => [key, f.has(key)])),
          };
          const result = await saveSettings({ wedding, settings });
          setMessage(result.message);
          if (result.ok) router.refresh();
        } catch {
          setMessage(
            'No se pudo guardar. Revisa las fechas, zona horaria y conexión.',
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <section className="panel">
        <h2>Los protagonistas</h2>
        <div className="form-grid">
          {[
            ['bride_name', 'Nombre de la novia', w.bride_name],
            ['groom_name', 'Nombre del novio', w.groom_name],
            ['title', 'Título de la invitación', w.title],
          ].map(([key, label, value]) => (
            <label key={key}>
              {label}
              <input name={key} defaultValue={value} required maxLength={150} />
            </label>
          ))}
          <label>
            Estado de publicación
            <select name="status" defaultValue={w.status}>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicada</option>
            </select>
          </label>
          <label className="full">
            Mensaje principal
            <textarea
              name="description"
              defaultValue={w.description}
              maxLength={2000}
            />
          </label>
        </div>
      </section>
      <section className="panel">
        <h2>Fecha y horarios</h2>
        <p className="small muted">
          Las horas se interpretan en la zona horaria indicada.
        </p>
        <div className="form-grid">
          <label>
            Fecha de la boda
            <input
              type="datetime-local"
              name="wedding_date"
              defaultValue={localDateTime(w.wedding_date, w.timezone)}
              required
            />
          </label>
          <label>
            Fecha máxima para confirmar
            <input
              type="datetime-local"
              name="rsvp_deadline"
              defaultValue={localDateTime(w.rsvp_deadline, w.timezone)}
              required
            />
          </label>
          <label>
            Zona horaria
            <input
              name="timezone"
              defaultValue={w.timezone}
              placeholder="America/Bogota"
              required
            />
          </label>
        </div>
      </section>
      <section className="panel">
        <h2>Palabras que cuentan nuestra historia</h2>
        {[
          ['envelope_message', 'Mensaje del sobre', s.envelope_message],
          ['story', 'Nuestra historia', s.story],
          ['dress_code', 'Código de vestimenta', s.dress_code],
          ['final_message', 'Mensaje final', s.final_message],
        ].map(([key, label, value]) => (
          <label key={key}>
            {label}
            <textarea
              name={key}
              defaultValue={value}
              maxLength={2000}
              rows={key === 'story' ? 5 : 2}
            />
          </label>
        ))}
      </section>
      <section className="panel">
        <h2>Secciones de la invitación</h2>
        <div className="toggle-grid">
          {toggles.map(([key, label]) => (
            <label key={key} className="checkbox">
              <input name={key} type="checkbox" defaultChecked={s[key]} />
              {label}
            </label>
          ))}
        </div>
        <label>
          URL HTTPS de música (opcional)
          <input
            name="music_url"
            type="url"
            defaultValue={s.music_url}
            placeholder="https://…"
          />
        </label>
        <p className="small muted">
          Comienza a sonar cuando el invitado abre el sobre. Utiliza un archivo
          o un enlace de YouTube que tengas permiso de compartir.
        </p>
      </section>
      <div className="sticky-save">
        <p role="status">{message}</p>
        <button className="button" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  );
}
