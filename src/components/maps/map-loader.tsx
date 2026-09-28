'use client';
import dynamic from 'next/dynamic';
export const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="map-loading">Cargando mapa…</div>,
});
