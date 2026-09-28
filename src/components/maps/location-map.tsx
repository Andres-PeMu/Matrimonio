'use client';
import { useEffect, useRef } from 'react';
import type { Map, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
export default function LocationMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  useEffect(() => {
    let disposed = false;
    import('leaflet').then((L) => {
      if (disposed || !container.current) return;
      const m = L.map(container.current).setView([latitude, longitude], 14);
      map.current = m;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(m);
      const icon = L.divIcon({
        className: 'map-pin',
        // Lucide Heart (ISC): Leaflet accepts DOM markup, so no React renderer is needed.
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });
      const pin = L.marker([latitude, longitude], {
        icon,
        draggable: Boolean(callback.current),
      }).addTo(m);
      marker.current = pin;
      const change = (lat: number, lng: number) => {
        pin.setLatLng([lat, lng]);
        callback.current?.(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      };
      if (callback.current) {
        m.on('click', (e) => change(e.latlng.lat, e.latlng.lng));
        pin.on('dragend', () => {
          const p = pin.getLatLng();
          change(p.lat, p.lng);
        });
      }
    });
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
    };
    // Initial coordinates are applied once; subsequent changes use setLatLng below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    marker.current?.setLatLng([latitude, longitude]);
    if (map.current && !map.current.getBounds().contains([latitude, longitude]))
      map.current.panTo([latitude, longitude]);
  }, [latitude, longitude]);
  return (
    <div
      ref={container}
      className="location-map"
      role="region"
      aria-label={
        onChange
          ? 'Mapa para seleccionar ubicación; también puedes escribir las coordenadas.'
          : 'Mapa del lugar del evento'
      }
    />
  );
}
