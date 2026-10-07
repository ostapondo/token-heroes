// Height maps: one column height per x, filled down to the horizon as a silhouette.

const RIDGE_POINTS = 256;

// Midpoint displacement: each halving adds a smaller bump, the roughness sets how much smaller.
export function ridge(
  random: () => number,
  width: number,
  base: number,
  amplitude: number,
  roughness: number,
): number[] {
  const points = Array.from({ length: RIDGE_POINTS + 1 }, () => 0);
  let step = RIDGE_POINTS;
  let spread = amplitude;

  points[0] = base + (random() - 0.5) * amplitude;
  points[RIDGE_POINTS] = base + (random() - 0.5) * amplitude;
  while (step > 1) {
    const half = step / 2;

    for (let x = half; x < RIDGE_POINTS; x += step) {
      const middle = ((points[x - half] ?? 0) + (points[x + half] ?? 0)) / 2;

      points[x] = middle + (random() - 0.5) * spread;
    }
    spread *= roughness;
    step = half;
  }

  return Array.from({ length: width }, (_, x) =>
    Math.round(points[Math.floor((x / width) * RIDGE_POINTS)] ?? 0),
  );
}

export function peaks(
  width: number,
  list: readonly (readonly [x: number, height: number, slope: number])[],
  random?: () => number,
): number[] {
  return Array.from({ length: width }, (_, x) => {
    const tallest = Math.max(0, ...list.map(([cx, h, slope]) => h - Math.abs(x - cx) * slope));
    const jitter = random && tallest > 0 ? (random() - 0.5) * 2 : 0;

    return Math.round(tallest + jitter);
  });
}

const MESA_FALL = 2.6;

export function mesas(
  width: number,
  list: readonly (readonly [left: number, right: number, height: number])[],
  random: () => number,
): number[] {
  return Array.from({ length: width }, (_, x) => {
    const tallest = Math.max(
      0,
      ...list.map(([left, right, h]) => h - Math.max(left - x, x - right, 0) * MESA_FALL),
    );
    const jitter = tallest > 0 ? (random() - 0.5) * 1.5 : 0;

    return Math.max(0, Math.round(tallest + jitter));
  });
}

// Half-ellipse mounds, for coin heaps and treetops.
export function mounds(
  width: number,
  list: readonly (readonly [x: number, radius: number, height: number])[],
): number[] {
  return Array.from({ length: width }, (_, x) =>
    Math.max(
      0,
      ...list.map(([cx, radius, h]) =>
        Math.abs(x - cx) < radius ? Math.round(h * Math.sqrt(1 - ((x - cx) / radius) ** 2)) : 0,
      ),
    ),
  );
}

export const mergeHeights = (...maps: readonly (readonly number[])[]): number[] =>
  (maps[0] ?? []).map((_, x) => Math.max(...maps.map((map) => map[x] ?? 0)));
