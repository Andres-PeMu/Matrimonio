'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
export const sections = [
  ['dashboard', '◫', 'Resumen'],
  ['guests', '♧', 'Invitados'],
  ['confirmations', '✓', 'Confirmaciones'],
  ['locations', '⌖', 'Lugares'],
  ['events', '◷', 'Fecha y eventos'],
  ['gallery', '▧', 'Galería'],
  ['settings', '⚙', 'Configuración'],
];
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="mobile-menu"
        aria-expanded={open}
        aria-controls="admin-nav"
        onClick={() => setOpen(!open)}
      >
        ☰ &nbsp; Menú
      </button>
      <nav
        id="admin-nav"
        className={open ? 'admin-nav open' : 'admin-nav'}
        aria-label="Administración"
      >
        {sections.map(([slug, icon, label]) => (
          <Link
            key={slug}
            href={`/admin/${slug}`}
            aria-current={path === `/admin/${slug}` ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
