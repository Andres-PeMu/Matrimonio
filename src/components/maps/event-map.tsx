'use client';
import { useState } from 'react';
import { LocationMap } from './map-loader';
export function EventMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Ver mapa</summary>
      {open && <LocationMap latitude={latitude} longitude={longitude} />}
    </details>
  );
}
