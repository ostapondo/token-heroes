const UNITS = [
  { value: 1e15, suffix: 'Q' },
  { value: 1e12, suffix: 'T' },
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'K' },
] as const;

export function compactNumber(value: number): string {
  const unit = UNITS.find((candidate) => Math.abs(value) >= candidate.value);

  if (!unit) return String(Math.round(value));
  const scaled = value / unit.value;
  const digits = Math.abs(scaled) >= 100 ? 0 : 1;

  return `${scaled.toFixed(digits)}${unit.suffix}`;
}

const NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;

// A skill's rank as a Roman numeral, plain digits past ten.
export const rankNumeral = (rank: number): string => NUMERALS[rank] ?? String(rank);
