export function nextRandom(seed: number): readonly [value: number, seed: number] {
  const next = (seed + 0x6d2b79f5) | 0;
  let mixed = Math.imul(next ^ (next >>> 15), 1 | next);

  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

  return [((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296, next];
}
