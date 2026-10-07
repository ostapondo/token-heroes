import { nextRandom } from '../random';

// The proc chance under a pseudo-random distribution: c after the first roll, 2c after a miss,
// and so on until it fires. The expected rate is one over the expected number of rolls.
function rateOf(constant: number): number {
  let reach = 1;
  let expected = 0;

  for (let roll = 1; reach > 0; roll += 1) {
    const chance = Math.min(1, constant * roll);

    expected += roll * reach * chance;
    reach *= 1 - chance;
  }

  return 1 / expected;
}

// The constant whose average rate is the nominal chance, as Dota 2 does it: procs then come
// evenly instead of in streaks and droughts.
export function prdConstant(chance: number): number {
  let low = 0;
  let high = chance;

  for (let step = 0; step < 40; step += 1) {
    const middle = (low + high) / 2;

    if (rateOf(middle) < chance) low = middle;
    else high = middle;
  }

  return (low + high) / 2;
}

export function rollProc(
  constant: number,
  misses: number,
  seed: number,
): { fired: boolean; misses: number; seed: number } {
  const [roll, next] = nextRandom(seed);
  const fired = roll < constant * (misses + 1);

  return { fired, misses: fired ? 0 : misses + 1, seed: next };
}
