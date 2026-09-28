'use client';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';

export type SoundtrackHandle = {
  play: () => void;
};

/** Extrae el id de un enlace de YouTube o YouTube Music. */
function youtubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be')
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    if (
      host !== 'youtube.com' &&
      host !== 'm.youtube.com' &&
      host !== 'music.youtube.com'
    ) {
      return null;
    }
    if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
    const embedded = parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
    return embedded?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Reproduce la música de la invitación. El arranque ocurre en el clic que abre
 * el sobre: el navegador solo permite sonido tras un gesto del invitado.
 */
export function Soundtrack({
  url,
  ref,
}: {
  url: string;
  ref?: Ref<SoundtrackHandle>;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const videoId = youtubeVideoId(url);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  function command(func: 'playVideo' | 'pauseVideo') {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*',
    );
  }

  function play() {
    if (startedRef.current) return;
    startedRef.current = true;
    if (videoId && frameRef.current) {
      const origin = window.location.origin;
      frameRef.current.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&origin=${encodeURIComponent(origin)}`;
    } else {
      void audioRef.current?.play().catch(() => undefined);
    }
    setStarted(true);
    setPaused(false);
  }

  function toggle() {
    if (!startedRef.current) {
      play();
      return;
    }
    if (videoId) command(paused ? 'playVideo' : 'pauseVideo');
    else if (audioRef.current) {
      if (audioRef.current.paused)
        void audioRef.current.play().catch(() => undefined);
      else audioRef.current.pause();
    }
    setPaused((value) => !value);
  }

  useImperativeHandle(ref, () => ({ play }));

  return (
    <>
      {videoId ? (
        <iframe
          ref={frameRef}
          className="invitation-soundtrack"
          title="Música de la invitación"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
        />
      ) : (
        <audio ref={audioRef} src={url} preload="none" />
      )}
      {started && (
        <button
          type="button"
          className="soundtrack-toggle"
          onClick={toggle}
          aria-pressed={!paused}
        >
          {paused ? 'Reanudar música' : 'Pausar música'}
        </button>
      )}
    </>
  );
}
