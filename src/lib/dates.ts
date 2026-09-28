export function localDateTime(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
  return parts.replace(' ', 'T');
}
export function zonedToIso(local: string, timeZone: string) {
  const target = new Date(`${local}:00Z`).getTime();
  let time = target;
  for (let i = 0; i < 4; i++) {
    const represented = new Date(
      `${localDateTime(new Date(time).toISOString(), timeZone)}:00Z`,
    ).getTime();
    const delta = target - represented;
    if (!delta) break;
    time += delta;
  }
  const iso = new Date(time).toISOString();
  if (localDateTime(iso, timeZone) !== local)
    throw new Error('La hora seleccionada no existe en esta zona horaria.');
  return iso;
}
