'use client';
import { useEffect, useState } from 'react';
export function Countdown({ date }: { date: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () =>
      setRemaining(Math.max(0, new Date(date).getTime() - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);
  const t = Math.floor((remaining ?? 0) / 1000);
  return (
    <div className="countdown" aria-label="Cuenta regresiva">
      {[
        Math.floor(t / 86400),
        Math.floor(t / 3600) % 24,
        Math.floor(t / 60) % 60,
        t % 60,
      ].map((n, i) => (
        <div key={i}>
          <strong>
            {remaining === null ? '—' : String(n).padStart(2, '0')}
          </strong>
          <span>{['Días', 'Horas', 'Minutos', 'Segundos'][i]}</span>
        </div>
      ))}
    </div>
  );
}
