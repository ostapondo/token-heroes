import { describe, expect, it } from 'vitest';
import { lastSeen } from './last-seen';

const NOW = new Date(2026, 9, 7, 16, 30);
const hourOf = (date: Date) => Math.floor(date.getTime() / 3_600_000);

describe('lastSeen', () => {
  it('says nothing while the agent still burns this hour', () => {
    expect(lastSeen(hourOf(NOW), NOW)).toBeNull();
  });

  it('gives the hour of a burn earlier today and the day of an older one', () => {
    expect(lastSeen(hourOf(new Date(2026, 9, 7, 9)), NOW)).toBe('09:00');
    expect(lastSeen(hourOf(new Date(2026, 9, 6, 22)), NOW)).toBe('6 Oct, 22:00');
  });
});
