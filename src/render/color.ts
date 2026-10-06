export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.min(Math.max(alpha, 0), 1);

  return `${hex}${Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
