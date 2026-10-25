'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Settings, Wedding } from '@/types/domain';
import { saveSettings } from '@/actions/manage';
import { localDateTime, zonedToIso } from '@/lib/dates';
import { invitationStyle } from '@/lib/invitation-styles';
import { DressColorsEditor } from './dress-colors-editor';
import { StylePicker } from './style-picker';
const toggles = [
  ['show_hero', 'Portada'],
  ['show_countdown', 'Cuenta regresiva'],
  ['show_story', 'Nuestra historia'],
  ['show_events', 'El gran día'],
  ['show_gallery', 'Galería'],
  ['show_maps', 'Mapas'],
  ['show_dress_code', 'Código de vestimenta'],
  ['show_envelope_rain', 'Lluvia de sobres'],
  ['show_rsvp', 'Confirmación de asistencia'],
  ['show_footer', 'Mensaje final'],
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
            dress_code_eyebrow: val('dress_code_eyebrow'),
            dress_code_title: val('dress_code_title'),
            dress_code_note: val('dress_code_note'),
            show_dress_code_colors: f.has('show_dress_code_colors'),
            dress_code_colors: JSON.parse(val('dress_code_colors') || '[]'),
            envelope_rain_eyebrow: val('envelope_rain_eyebrow'),
            envelope_rain_title: val('envelope_rain_title'),
            envelope_rain_note: val('envelope_rain_note'),
            final_message: val('final_message'),
            music_url: val('music_url'),
            invitation_style: invitationStyle(val('invitation_style')),
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
        <h2>Estilo de la invitación</h2>
        <p className="small muted">
          Elige la base visual. Al cambiarla se pinta todo, incluido este panel.
          Si vuelves a Pastel amor, recuperas el look anterior. Lo que ajustemos
          de aquí en adelante es solo para Azul cielo amor.
        </p>
        <StylePicker
          name="invitation_style"
          initial={invitationStyle(s.invitation_style)}
        />
      </section>
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
        <h2>Código de vestimenta</h2>
        <p className="small muted">
          Se muestra solo si está activa en Secciones de la invitación.
        </p>
        <div className="form-grid">
          <label>
            Subtítulo
            <input
              name="dress_code_eyebrow"
              defaultValue={s.dress_code_eyebrow}
              maxLength={150}
              placeholder="PARA CELEBRAR JUNTOS"
            />
          </label>
          <label>
            Título
            <input
              name="dress_code_title"
              defaultValue={s.dress_code_title}
              maxLength={150}
              placeholder="Código de vestimenta"
            />
          </label>
        </div>
        <label>
          Vestimenta
          <textarea
            name="dress_code"
            defaultValue={s.dress_code}
            maxLength={2000}
            rows={2}
            placeholder="Formal y semi formal"
          />
        </label>
        <label>
          Nota adicional
          <textarea
            name="dress_code_note"
            defaultValue={s.dress_code_note}
            maxLength={2000}
            rows={2}
            placeholder="Agradecemos reservar el blanco y beige para la novia."
          />
        </label>
        <p className="small muted">
          Los campos vacíos no se muestran en la invitación.
        </p>
        <label className="checkbox">
          <input
            name="show_dress_code_colors"
            type="checkbox"
            defaultChecked={s.show_dress_code_colors}
          />
          Mostrar paleta de colores sugeridos
        </label>
        <DressColorsEditor
          name="dress_code_colors"
          initial={s.dress_code_colors}
        />
      </section>
      <section className="panel">
        <h2>Lluvia de sobres</h2>
        <p className="small muted">
          Se muestra solo si está activa en Secciones de la invitación.
        </p>
        <div className="form-grid">
          <label>
            Subtítulo
            <input
              name="envelope_rain_eyebrow"
              defaultValue={s.envelope_rain_eyebrow}
              maxLength={150}
              placeholder="EL MEJOR REGALO"
            />
          </label>
          <label>
            Título
            <input
              name="envelope_rain_title"
              defaultValue={s.envelope_rain_title}
              maxLength={150}
              placeholder="Lluvia de sobres"
            />
          </label>
        </div>
        <label>
          Mensaje
          <textarea
            name="envelope_rain_note"
            defaultValue={s.envelope_rain_note}
            maxLength={2000}
            rows={3}
            placeholder="Tu presencia es nuestro mayor tesoro."
          />
        </label>
        <p className="small muted">
          Los campos vacíos no se muestran en la invitación.
        </p>
      </section>
      <section className="panel">
        <h2>Secciones de la invitación</h2>
        <p className="small muted">
          Desmarca lo que no quieras en esta tarjeta. No cambia las demás bodas.
        </p>
        <div className="toggle-grid">
          {toggles.map(([key, label]) => (
            <label key={key} className="checkbox">
              <input name={key} type="checkbox" defaultChecked={s[key]} />
              {label}
            </label>
          ))}
        </div>
        <label>
          Música (opcional)
          <input
            name="music_url"
            type="text"
            inputMode="url"
            defaultValue={s.music_url}
            placeholder="/music/cancion.mp3"
          />
        </label>
        <p className="small muted">
          Comienza a sonar cuando el invitado abre el sobre. Usa un archivo de
          /music/ (recomendado: suena también en celulares) o una URL HTTPS. Los
          enlaces de YouTube no suenan automáticamente en celulares.
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
