// The colours one burst of magic burns through: a white-hot core, the colour itself, then two
// cooler steps, each as "r,g,b" so an alpha can be added per particle.
export interface Heat {
  readonly steps: readonly string[];
  readonly glow: string;
  readonly core: string;
}

const HEATS = new Map<string, Heat>();

const channels = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.slice(1, 7), 16);

  return [n >> 16, (n >> 8) & 255, n & 255];
};

const toward = (rgb: readonly number[], target: number, k: number): string =>
  rgb.map((value) => Math.round(value + (target - value) * k)).join(',');

export function heatOf(color: string): Heat {
  const cached = HEATS.get(color);

  if (cached) return cached;
  const rgb = channels(color);
  const heat = {
    steps: [
      toward(rgb, 255, 0.7),
      toward(rgb, 255, 0.25),
      toward(rgb, 0, 0.15),
      toward(rgb, 0, 0.5),
    ],
    glow: color,
    core: `rgb(${toward(rgb, 255, 0.85)})`,
  };

  HEATS.set(color, heat);

  return heat;
}
