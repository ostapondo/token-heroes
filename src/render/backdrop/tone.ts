const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;
const rgbCache = new Map<string, readonly [number, number, number]>();

// The 4x4 ordered-dither threshold: a pixel takes the next colour when its share beats this.
export const bayer = (x: number, y: number): number =>
  ((BAYER[(y & 3) * 4 + (x & 3)] ?? 0) + 0.5) / 16;

export function rgb(hex: string): readonly [number, number, number] {
  const cached = rgbCache.get(hex);

  if (cached) return cached;
  const value = Number.parseInt(hex.slice(1, 7), 16);
  const parsed = [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;

  rgbCache.set(hex, parsed);

  return parsed;
}

// Solid bands with a dithered seam, so a gradient never leaves the ramp's colours.
export function rampAt(
  ramp: readonly string[],
  share: number,
  x: number,
  y: number,
  seam: number,
): string {
  const position = Math.min(1, Math.max(0, share)) * (ramp.length - 1);
  const index = Math.min(ramp.length - 2, Math.floor(position));
  const fraction = position - index;
  const edge = Math.min(1, Math.max(0, (fraction - (1 - seam) / 2) / seam));

  return (edge > bayer(x, y) ? ramp[index + 1] : ramp[index]) ?? '#000000';
}

const linear = (channel: number): number => {
  const share = channel / 255;

  return share <= 0.04045 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (r: number, g: number, b: number): number =>
  0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

export const contrast = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
