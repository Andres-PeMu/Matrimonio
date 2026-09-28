'use client';
import { useState } from 'react';
import type { Invitation } from '@/types/domain';
import { WeddingPage } from './wedding-page';
export function Envelope({ data, token }: { data: Invitation; token: string }) {
  const [opened, setOpened] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  if (discovered) return <WeddingPage data={data} token={token} />;
  return (
    <main id="main" className="envelope-page">
      <p className="eyebrow">CON AMOR, PARA TI</p>
      <h1>{data.settings.envelope_message}</h1>
      <div className={`envelope-stage ${opened ? 'is-open' : ''}`}>
        <div className="envelope-back" />
        <div className="invitation-card" aria-hidden={!opened}>
          {opened && (
            <>
              <span>Con mucho cariño,</span>
              <h2>{data.guest.name}</h2>
              <p>
                Tenemos el honor de invitarte
                <br />a celebrar nuestra boda.
              </p>
              <div className="ornament" aria-hidden="true">
                — ❦ —
              </div>
              <p>
                Esta invitación es válida para
                <br />
                <strong>
                  {data.guest.guest_limit}{' '}
                  {data.guest.guest_limit === 1 ? 'persona' : 'personas'}
                </strong>
                .
              </p>
            </>
          )}
        </div>
        <div className="envelope-front" />
        <div className="envelope-flap" />
        <button
          className="wax-seal"
          onClick={() => setOpened(true)}
          disabled={opened}
          aria-label="Abrir mi invitación"
        >
          {data.wedding.bride_name[0]}
          <span>&</span>
          {data.wedding.groom_name[0]}
        </button>
      </div>
      {opened ? (
        <button
          autoFocus
          className="button discover-button"
          onClick={() => {
            setDiscovered(true);
            window.scrollTo(0, 0);
          }}
        >
          DESCUBRIR INVITACIÓN ↓
        </button>
      ) : (
        <button className="envelope-prompt" onClick={() => setOpened(true)}>
          ABRIR INVITACIÓN <span aria-hidden="true">♡</span>
        </button>
      )}
      <p className="envelope-bottom">Un día. Una promesa. Toda una vida.</p>
    </main>
  );
}
