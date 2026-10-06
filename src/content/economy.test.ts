import { describe, expect, it } from 'vitest';
import { heroDamage, heroHp, levelCost } from '@engine';
import { toRoster } from './lookup';
import { CONTENT } from './registry';

const HEADROOM = 1_000;

function highestAffordableLevel(coins: number, cost: (level: number) => number): number {
  let level = 1;
  let spent = 0;

  while (spent + cost(level) <= coins) {
    spent += cost(level);
    level += 1;
  }

  return level;
}

describe('economy bounds', () => {
  it.each([1e12, 1e15])('never lets %d coins buy a level near the safe integer limit', (coins) => {
    for (const hero of toRoster(CONTENT).heroes) {
      const level = highestAffordableLevel(coins, (current) => levelCost(current));

      expect(heroDamage(hero, level)).toBeLessThan(Number.MAX_SAFE_INTEGER / HEADROOM);
      expect(heroHp(hero, level)).toBeLessThan(Number.MAX_SAFE_INTEGER / HEADROOM);
    }
  });
});
