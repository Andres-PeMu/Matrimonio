'use client';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Atajo fijo a la confirmación: aparece al hacer scroll y se oculta junto al formulario. */
export function FloatingRsvp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = document.getElementById('rsvp');
    if (!section) return;

    function update() {
      const rect = section!.getBoundingClientRect();
      const nearForm = rect.top < window.innerHeight * 0.82 && rect.bottom > 72;
      const scrolledPastHero = window.scrollY > window.innerHeight * 0.4;
      setVisible(scrolledPastHero && !nearForm);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new IntersectionObserver(update, {
      threshold: [0, 0.2, 0.55],
    });
    observer.observe(section);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  return (
    <a
      href="#rsvp"
      className={`floating-rsvp${visible ? ' is-visible cta-pulse' : ''}`}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Heart size={14} strokeWidth={1.6} aria-hidden="true" />
      Confirmar asistencia
    </a>
  );
}
