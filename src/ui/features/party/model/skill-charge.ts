// The share of an icon still covered while its skill recharges, in steps of the icon's own
// pixels so the cover moves like the rest of the pixel art.
export function chargeCover(
  readyIn: number | null,
  cooldown: number | null,
  pixels: number,
): number {
  if (readyIn === null || cooldown === null || cooldown <= 0) return 0;
  const left = Math.min(Math.max(readyIn / cooldown, 0), 1);

  return Math.round(left * pixels) / pixels;
}
