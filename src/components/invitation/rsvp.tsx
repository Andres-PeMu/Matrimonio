'use client';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Invitation } from '@/types/domain';
export function Rsvp({ data, token }: { data: Invitation; token: string }) {
  const router = useRouter();
  const existing = data.confirmation;
  const [status, setStatus] = useState<'CONFIRMED' | 'DECLINED'>(
    existing?.status ?? 'CONFIRMED',
  );
  const initial = existing?.attendees
    .slice()
    .sort((a, b) => Number(b.is_primary_guest) - Number(a.is_primary_guest))
    .map((a) => a.name) ?? [data.guest.name];
  const [names, setNames] = useState(
    initial.length ? initial : [data.guest.name],
  );
  const [message, setMessage] = useState(existing?.message ?? '');
  const [feedback, setFeedback] = useState('');
  const [pending, setPending] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const update = () =>
      setClosed(Date.now() > new Date(data.wedding.rsvp_deadline).getTime());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [data.wedding.rsvp_deadline]);
  return (
    <section id="rsvp" className="rsvp-section">
      <div className="section-heading">
        <span className="eyebrow">TE ESPERAMOS</span>
        <h2>Confirma tu asistencia</h2>
        <p>
          Hola, {data.guest.name}. Hemos reservado {data.guest.guest_limit}{' '}
          {data.guest.guest_limit === 1 ? 'lugar' : 'lugares'} para ti.
        </p>
      </div>
      <form
        className="rsvp-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setFeedback('');
          try {
            const r = await fetch('/api/rsvp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                status,
                names: status === 'CONFIRMED' ? names : [],
                message,
              }),
            });
            const body = await r.json();
            setFeedback(body.message);
            if (r.ok) router.refresh();
          } catch {
            setFeedback('No hay conexión. Inténtalo nuevamente.');
          } finally {
            setPending(false);
          }
        }}
      >
        {existing && (
          <p className="notice">
            {existing.status === 'CONFIRMED'
              ? 'Tu asistencia está confirmada. Puedes actualizar tu respuesta.'
              : 'Has indicado que no podrás asistir.'}
          </p>
        )}
        {closed && (
          <p className="notice">El periodo de confirmación ha finalizado.</p>
        )}
        <fieldset disabled={closed || pending}>
          <legend>¿Nos acompañas?</legend>
          <div className="choice-row">
            <label
              className={status === 'CONFIRMED' ? 'choice selected' : 'choice'}
            >
              <input
                type="radio"
                name="status"
                checked={status === 'CONFIRMED'}
                onChange={() => setStatus('CONFIRMED')}
              />{' '}
              Sí, asistiré
            </label>
            <label
              className={status === 'DECLINED' ? 'choice selected' : 'choice'}
            >
              <input
                type="radio"
                name="status"
                checked={status === 'DECLINED'}
                onChange={() => setStatus('DECLINED')}
              />{' '}
              No podré asistir
            </label>
          </div>
          {status === 'CONFIRMED' && (
            <>
              <label>
                ¿Cuántas personas asistirán?
                <select
                  value={names.length}
                  onChange={(e) =>
                    setNames(
                      Array.from(
                        { length: Number(e.target.value) },
                        (_, i) => names[i] ?? '',
                      ),
                    )
                  }
                >
                  {Array.from({ length: data.guest.guest_limit }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} {i === 0 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </label>
              <div className="attendee-fields">
                {names.map((n, i) => (
                  <label key={i}>
                    Nombre del asistente {i + 1}
                    <input
                      required
                      maxLength={150}
                      autoComplete="name"
                      value={n}
                      onChange={(e) =>
                        setNames(
                          names.map((v, j) => (j === i ? e.target.value : v)),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </>
          )}
          <label>
            Un mensaje para los novios <span className="muted">(opcional)</span>
            <textarea
              maxLength={2000}
              rows={3}
              placeholder="Déjanos unas palabras…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button className="button" type="submit">
            {!pending && (
              <Heart size={17} strokeWidth={1.6} aria-hidden="true" />
            )}
            {pending
              ? 'Guardando…'
              : existing
                ? 'Guardar mi respuesta'
                : 'Confirmar asistencia'}
          </button>
        </fieldset>
        <p role="status" className="feedback">
          {feedback}
        </p>
        <p className="small muted">
          Confirma antes del{' '}
          {new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'long',
            timeZone: data.wedding.timezone,
          }).format(new Date(data.wedding.rsvp_deadline))}
          .
        </p>
      </form>
    </section>
  );
}
