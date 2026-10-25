'use client';
import { useLayoutEffect } from 'react';
import {
  applyInvitationStyle,
  invitationStyle,
  type InvitationStyle,
} from '@/lib/invitation-styles';

/** Sincroniza el estilo guardado después de hidratar, sin soltarlo al salir. */
export function ThemeRoot({ style }: { style: InvitationStyle | string }) {
  const resolved = invitationStyle(style);
  useLayoutEffect(() => {
    applyInvitationStyle(resolved);
  }, [resolved]);
  return null;
}
