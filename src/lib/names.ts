/** Primer nombre de cada integrante de la pareja, p. ej. "Astrid y Andrés". */
export function coupleShortName(bride: string, groom: string) {
  const first = (full: string) => full.trim().split(/\s+/)[0] ?? '';
  return `${first(bride)} y ${first(groom)}`;
}
