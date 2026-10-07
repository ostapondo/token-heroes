import { DATE_LOCALE, SECONDS_PER_HOUR } from '../constants';

// When an agent last burned, at the hour: null while it is still burning this hour.
export function lastSeen(lastHour: number, now: Date): string | null {
  const nowHour = Math.floor(now.getTime() / 1000 / SECONDS_PER_HOUR);

  if (lastHour >= nowHour) return null;
  const at = new Date(lastHour * SECONDS_PER_HOUR * 1000);
  const time = `${String(at.getHours()).padStart(2, '0')}:00`;
  const sameDay = at.toDateString() === now.toDateString();

  return sameDay
    ? time
    : `${at.toLocaleDateString(DATE_LOCALE, { day: 'numeric', month: 'short' })}, ${time}`;
}
