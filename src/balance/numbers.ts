const UNITS = [
  { size: 1e12, suffix: 'T' },
  { size: 1e9, suffix: 'B' },
  { size: 1e6, suffix: 'M' },
  { size: 1e3, suffix: 'K' },
] as const;

export function compact(value: number): string {
  const unit = UNITS.find(({ size }) => Math.abs(value) >= size);

  return unit ? `${(value / unit.size).toFixed(1)}${unit.suffix}` : value.toFixed(0);
}

export const percent = (share: number): string => `${(share * 100).toFixed(1)}%`;

export const times = (ratio: number): string => `${ratio.toFixed(1)}×`;
