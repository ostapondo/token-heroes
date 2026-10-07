import { describe, expect, it } from 'vitest';
import { prdConstant, rollProc } from './procs';

describe('pseudo-random procs', () => {
  it('match the constants Dota 2 uses for its chances', () => {
    expect(prdConstant(0.1)).toBeCloseTo(0.01475, 4);
    expect(prdConstant(0.25)).toBeCloseTo(0.08475, 4);
  });

  it('fire at the nominal chance on average, never far apart', () => {
    const constant = prdConstant(0.15);
    let state = { misses: 0, seed: 11 };
    let fired = 0;
    let longest = 0;
    let gap = 0;

    for (let roll = 0; roll < 20_000; roll += 1) {
      const next = rollProc(constant, state.misses, state.seed);

      state = next;
      gap = next.fired ? 0 : gap + 1;
      longest = Math.max(longest, gap);
      if (next.fired) fired += 1;
    }
    expect(fired / 20_000).toBeCloseTo(0.15, 2);
    expect(longest).toBeLessThan(Math.ceil(1 / constant));
  });
});
