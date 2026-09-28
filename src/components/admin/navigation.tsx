'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarDays,
  Heart,
  Images,
  LayoutDashboard,
  MapPin,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';

const sections = [
  { slug: 'dashboard', Icon: LayoutDashboard, label: 'Resumen' },
  { slug: 'guests', Icon: Users, label: 'Invitados' },
  { slug: 'confirmations', Icon: Heart, label: 'Confirmaciones' },
  { slug: 'locations', Icon: MapPin, label: 'Lugares' },
  { slug: 'events', Icon: CalendarDays, label: 'Fecha y eventos' },
  { slug: 'gallery', Icon: Images, label: 'Galería' },
  { slug: 'settings', Icon: Settings, label: 'Configuración' },
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
        {open ? (
          <X size={18} aria-hidden="true" />
        ) : (
          <Menu size={18} aria-hidden="true" />
        )}{' '}
        Menú
      </button>
      <nav
        id="admin-nav"
        className={open ? 'admin-nav open' : 'admin-nav'}
        aria-label="Administración"
      >
        {sections.map(({ slug, Icon, label }) => (
          <Link
            key={slug}
            href={`/admin/${slug}`}
            aria-current={path === `/admin/${slug}` ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
