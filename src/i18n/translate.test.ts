import { describe, expect, it } from 'vitest';
import { t, tCount } from './translate';

describe('t', () => {
  it('returns a message without placeholders as written', () => {
    expect(t('wipe.title')).toBe('PARTY WIPED');
  });

  it('fills every placeholder', () => {
    expect(t('party.levelUpLabel', { name: 'Archer', cost: '1.2K' })).toBe(
      'Level up Archer for 1.2K coins',
    );
  });
});

describe('tCount', () => {
  it('picks the singular and plural forms by count', () => {
    expect(tCount('notice.away', 1)).toBe('While you were away the party cleared 1 stage.');
    expect(tCount('notice.away', 12)).toBe('While you were away the party cleared 12 stages.');
  });
});
