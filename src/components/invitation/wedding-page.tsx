import { HeartOrnament } from '@/components/ui/heart-ornament';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import type { PublicWedding, Invitation } from '@/types/domain';
import { Countdown } from './countdown';
import { EventMap } from '@/components/maps/event-map';
import { Rsvp } from './rsvp';
export function WeddingPage({
  data,
  token,
  hideMusic = false,
}: {
  data: PublicWedding | Invitation;
  token?: string;
  hideMusic?: boolean;
}) {
  const { wedding: w, settings: s, events, locations, media } = data;
  const date = new Date(w.wedding_date);
  const cover = media.find((m) => m.type === 'COVER');
  const photos = media.filter((m) => m.type === 'GALLERY');
  const initials = `${w.bride_name[0]} & ${w.groom_name[0]}`;
  return (
    <div className="wedding-page">
      <header className="public-header">
        <a href="#inicio" className="monogram">
          {initials}
        </a>
        <nav aria-label="Navegación de la invitación">
          <a href="#inicio">Inicio</a>
          {s.show_story && <a href="#historia">Nuestra historia</a>}
          <a href="#detalles">El gran día</a>
          {s.show_gallery && photos.length > 0 && (
            <a href="#galeria">Galería</a>
          )}
          {token && s.show_rsvp && (
            <a className="nav-rsvp" href="#rsvp">
              Confirmar asistencia ↗
            </a>
          )}
        </nav>
      </header>
      <main id="main">
        <section className={`hero ${cover ? 'with-cover' : ''}`} id="inicio">
          {cover?.url && (
            <Image
              className="hero-photo"
              src={cover.url}
              alt={cover.alt_text}
              fill
              sizes="100vw"
              priority
            />
          )}
          <div className="hero-content">
            <span className="eyebrow">{w.title}</span>
            <HeartOrnament />
            <h1>
              <span>{w.bride_name}</span>
              <em>&</em>
              <span>{w.groom_name}</span>
            </h1>
            <p className="hero-message">{w.description}</p>
            <div className="wedding-date">
              <span>
                {new Intl.DateTimeFormat('es-CO', {
                  month: 'long',
                  timeZone: w.timezone,
                }).format(date)}
              </span>
              <div>
                <span>
                  {new Intl.DateTimeFormat('es-CO', {
                    weekday: 'short',
                    timeZone: w.timezone,
                  }).format(date)}
                </span>
                <strong>
                  {new Intl.DateTimeFormat('es-CO', {
                    day: '2-digit',
                    timeZone: w.timezone,
                  }).format(date)}
                </strong>
                <span>
                  {new Intl.DateTimeFormat('es-CO', {
                    year: 'numeric',
                    timeZone: w.timezone,
                  }).format(date)}
                </span>
              </div>
            </div>
            {token && s.show_rsvp ? (
              <a href="#rsvp" className="button">
                <Heart size={17} strokeWidth={1.6} aria-hidden="true" />{' '}
                CONFIRMAR ASISTENCIA
              </a>
            ) : (
              <a href="#detalles" className="button">
                DESCUBRIR NUESTRO DÍA ↓
              </a>
            )}
            <span className="hero-footnote">Una vida juntos comienza aquí</span>
          </div>
        </section>
        {s.show_countdown && (
          <section className="countdown-section">
            <span className="eyebrow">CADA VEZ FALTA MENOS</span>
            <h2>Para nuestro sí, quiero</h2>
            <Countdown date={w.wedding_date} />
          </section>
        )}
        {s.show_story && (
          <section id="historia" className="story-section">
            <div className="story-mark" aria-hidden="true">
              {initials}
              <span>Una historia para siempre</span>
            </div>
            <div>
              <span className="eyebrow">NUESTRA HISTORIA</span>
              <h2>El comienzo de todo</h2>
              <p className="preserve-lines">{s.story}</p>
              <HeartOrnament divider />
            </div>
          </section>
        )}
        <section id="detalles" className="details-section">
          <div className="section-heading">
            <span className="eyebrow">EL GRAN DÍA</span>
            <h2>Momentos para recordar</h2>
            <p>Será aún más especial si lo compartimos contigo.</p>
          </div>
          <div className="event-grid">
            {events.length === 0 ? (
              <p className="muted">
                Pronto compartiremos los detalles de nuestra celebración.
              </p>
            ) : (
              events.map((event, i) => {
                const location = locations.find(
                  (l) => l.id === event.location_id,
                );
                return (
                  <article className="event-card" key={event.id}>
                    <span className="event-number">0{i + 1}</span>
                    <h3>{event.name}</h3>
                    <p className="event-time">
                      {new Intl.DateTimeFormat('es-CO', {
                        dateStyle: 'long',
                        timeZone: 'UTC',
                      }).format(new Date(event.event_date + 'T12:00:00Z'))}
                      <br />
                      {event.start_time.slice(0, 5)}
                      {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}
                    </p>
                    <p>{event.description}</p>
                    {location && (
                      <>
                        <h4>{location.name}</h4>
                        <p>
                          {location.address}
                          <br />
                          {location.city}, {location.country}
                        </p>
                        {location.description && <p>{location.description}</p>}
                        {s.show_maps && (
                          <EventMap
                            latitude={location.latitude}
                            longitude={location.longitude}
                          />
                        )}
                        <a
                          className="text-link"
                          href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${location.latitude},${location.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Cómo llegar ↗
                        </a>
                        {location.parking_information && (
                          <p className="small">
                            Estacionamiento: {location.parking_information}
                          </p>
                        )}
                        {location.additional_information && (
                          <p className="small">
                            {location.additional_information}
                          </p>
                        )}
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
          <p className="small muted centered">
            Horarios en {w.timezone.replaceAll('_', ' ')}.
          </p>
        </section>
        {s.show_gallery && photos.length > 0 && (
          <section className="gallery-section" id="galeria">
            <div className="section-heading">
              <span className="eyebrow">PEDACITOS DE NOSOTROS</span>
              <h2>Recuerdos que nos unen</h2>
            </div>
            <div className="photo-grid">
              {photos.map((m) => (
                <figure key={m.id}>
                  <Image
                    src={m.url!}
                    alt={m.alt_text}
                    width={640}
                    height={800}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <figcaption>{m.alt_text}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        {s.show_dress_code && (
          <section className="dress-section">
            <span className="eyebrow">PARA CELEBRAR JUNTOS</span>
            <h2>Código de vestimenta</h2>
            <p className="preserve-lines">{s.dress_code}</p>
            <div className="palette" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </section>
        )}
        {s.show_rsvp &&
          (token && 'guest' in data ? (
            <Rsvp data={data} token={token} />
          ) : (
            <section className="public-rsvp">
              <h2>Tenemos un lugar para ti</h2>
              <p>
                Abre el enlace personal que te compartimos para confirmar tu
                asistencia.
              </p>
            </section>
          ))}
        <footer className="wedding-footer">
          <HeartOrnament />
          <p>{s.final_message}</p>
          <div className="signature">{initials}</div>
          <span className="eyebrow">CON TODO NUESTRO AMOR</span>
          {!hideMusic && s.show_music && s.music_url && (
            <audio
              controls
              preload="none"
              src={s.music_url}
              aria-label="Música de nuestra boda"
            />
          )}
          <Link href="/admin/login" className="admin-link">
            Administración
          </Link>
        </footer>
      </main>
    </div>
  );
}
