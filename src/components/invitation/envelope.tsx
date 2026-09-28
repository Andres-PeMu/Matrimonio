'use client';
import Image from 'next/image';
import { ArrowDown, Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Invitation } from '@/types/domain';
import { HeartOrnament } from '@/components/ui/heart-ornament';
import { Soundtrack, type SoundtrackHandle } from './soundtrack';
import { WeddingPage } from './wedding-page';

export function Envelope({ data, token }: { data: Invitation; token: string }) {
  const [opened, setOpened] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const soundtrackRef = useRef<SoundtrackHandle>(null);
  const musicUrl =
    data.settings.show_music && data.settings.music_url
      ? data.settings.music_url
      : '';

  function openEnvelope() {
    if (!opened) soundtrackRef.current?.play();
    setOpened(true);
  }

  return (
    <>
      {musicUrl ? <Soundtrack ref={soundtrackRef} url={musicUrl} /> : null}
      {discovered ? (
        <WeddingPage data={data} token={token} hideMusic />
      ) : (
        <main id="main" className="envelope-page">
          <div className="envelope-intro">
            <p className="eyebrow">CON AMOR, PARA TI</p>
            <h1 className="sr-only">Tu invitación de boda</h1>
          </div>
          <div className={`envelope-stage ${opened ? 'is-open' : ''}`}>
            <div className="envelope-back" aria-hidden="true" />
            <div className="invitation-card" aria-hidden={!opened}>
              {opened && (
                <>
                  <span>Con mucho cariño,</span>
                  <h2>{data.guest.name}</h2>
                  <p>
                    Tenemos el honor de invitarte
                    <br />a celebrar nuestra boda.
                  </p>
                  <HeartOrnament divider />
                  <p>
                    Esta invitación es válida para
                    <br />
                    <strong className="invitation-capacity">
                      {data.guest.guest_limit}{' '}
                      {data.guest.guest_limit === 1 ? 'persona' : 'personas'}
                    </strong>
                    .
                  </p>
                </>
              )}
            </div>
            <div
              className="envelope-side envelope-side-left"
              aria-hidden="true"
            />
            <div
              className="envelope-side envelope-side-right"
              aria-hidden="true"
            />
            <div className="envelope-front" aria-hidden="true" />
            <div className="envelope-flap" aria-hidden="true" />
            <button
              type="button"
              className="wax-seal"
              onClick={openEnvelope}
              disabled={opened}
              aria-label="Abrir mi invitación"
              aria-expanded={opened}
            >
              <Image
                src="/envelope/wax-seal-af.webp"
                width={480}
                height={480}
                alt="Sello de cera marfil con las iniciales A y F"
                sizes="(max-width: 600px) 116px, 150px"
                preload
                draggable={false}
              />
            </button>
          </div>
          {opened ? (
            <button
              type="button"
              className="button discover-button"
              onClick={() => {
                setDiscovered(true);
                window.scrollTo(0, 0);
              }}
            >
              DESCUBRIR INVITACIÓN <ArrowDown size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="envelope-prompt"
              onClick={openEnvelope}
            >
              <span>ABRIR INVITACIÓN</span>
              <span className="envelope-prompt-hint">
                Toca el sello, hay algo especial para ti
              </span>
            </button>
          )}
          <p className="envelope-bottom">
            <Heart size={14} strokeWidth={1.4} aria-hidden="true" />
            Un día. Una promesa. Toda una vida.
          </p>
        </main>
      )}
    </>
  );
}
