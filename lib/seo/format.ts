/** "13 out 2026" / "13 Oct 2026" from an ISO date (YYYY-MM-DD). Pure; safe in client code. */
export function formatUpdated(iso: string, locale: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day')} ${get('month').replace('.', '')} ${get('year')}`;
}
