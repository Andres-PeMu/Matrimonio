export const invitationStyles = [
  {
    id: 'classic',
    name: 'Pastel amor',
    note: 'Rosa antiguo, crema y oro. El estilo suave que ya usamos.',
    swatches: ['#a86165', '#faf7f1', '#876432'],
  },
  {
    id: 'maria-oscar',
    name: 'Azul cielo amor',
    note: 'Azul profundo, acuarela celeste y oro. Apertura lateral.',
    swatches: ['#16356b', '#ffffff', '#c6a35a'],
  },
] as const;

export type InvitationStyle = (typeof invitationStyles)[number]['id'];

export const invitationStyleStorageKey = 'invitation-style';
export const invitationStyleCookie = 'invitation-style';

export function invitationStyle(
  value: string | null | undefined,
): InvitationStyle {
  return value === 'maria-oscar' ? 'maria-oscar' : 'classic';
}

/** Aplica el estilo a toda la página. classic deja Pastel amor. */
export function applyInvitationStyle(style: InvitationStyle) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.style = style;
  try {
    window.localStorage.setItem(invitationStyleStorageKey, style);
    document.cookie = `${invitationStyleCookie}=${style}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* private mode */
  }
}
