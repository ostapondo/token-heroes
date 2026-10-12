import type { Detail, Paint } from '@content';
import { crystals, hourglass } from './boss-details';
import type { Torso } from './details';
import type { Kit } from './kit';

export function glowing(kit: Kit, at: Torso, detail: Extract<Detail, { glow: unknown }>): void {
  const { p } = kit;
  const { length: L, shoulders: wS, hips: wH, s } = at;
  const color = kit.shade(detail.color);
  const glow = kit.lit(detail.glow);

  switch (detail.kind) {
    case 'core':
      p.glow(wS * 0.15, L * 0.38, wS * 1.6, glow, 0.8 + 0.2 * Math.sin(kit.t * 5));
      p.cel(p.circle(wS * 0.15, L * 0.38, wS * 0.36), color, wS * 0.3);
      break;
    case 'emblem':
      p.glow(wS * 0.25, L * 0.3, 5 * s, glow, 0.5);
      p.cel(p.circle(wS * 0.25, L * 0.3, 1.8 * s), color, 1.8 * s);
      break;
    case 'brooch':
      for (let i = 0; i < 3; i += 1) {
        const a = (i * Math.PI) / 3;
        const dx = Math.cos(a) * 2 * s;
        const dy = Math.sin(a) * 2 * s;

        p.segment(wS * 0.3 - dx, s * 2 - dy, wS * 0.3 + dx, s * 2 + dy, 0.5 * s, color[0]);
      }
      p.glow(wS * 0.3, s * 2, 4 * s, glow, 0.5);
      break;
    case 'buckle':
      p.cel(p.circle(wH * 0.4, L * 0.84, 1.9 * s), color, 1.9 * s);
      p.glow(wH * 0.4, L * 0.84, 4 * s, glow, 0.35);
      break;
    case 'crystals':
      crystals(kit, at, detail.color, detail.glow);
      break;
    case 'hourglass':
      hourglass(kit, at, detail.color, detail.glow);
      break;
  }
}

export function framed(kit: Kit, at: Torso, detail: Extract<Detail, { trim: unknown }>): void {
  const { p } = kit;
  const { length: L, hips: wH, s } = at;
  const trim = kit.lit(detail.trim);

  if (detail.kind === 'scabbard') {
    p.segment(-wH * 0.4, L * 0.8, -wH * 2.6, L * 1.35, 2 * s, kit.lit(detail.color));
    p.segment(-wH * 0.4, L * 0.8, -wH * 0.9, L * 0.88, 2.4 * s, trim);

    return;
  }
  p.cel(
    p.polygon(-wH * 1.1, L * 0.7, -wH * 0.2, L * 0.7, -wH * 0.2, L * 0.98, -wH * 1.1, L * 0.98),
    kit.shade(detail.color),
    2 * s,
  );
  p.segment(-wH * 0.95, L * 0.84, -wH * 0.35, L * 0.84, 0.7 * s, trim);
}

type Small = 'beads' | 'knives' | 'necklace' | 'leaves';

// Small trinkets: prayer beads, belt knives, a necklace of teeth, a pair of leaves.
export function trinket(kit: Kit, at: Torso, kind: Small, paint: Paint): void {
  const { p } = kit;
  const { length: L, shoulders: wS, hips: wH, s } = at;
  const color = kit.lit(paint);
  const shade = kit.shade(paint);

  switch (kind) {
    case 'beads':
      for (let i = 0; i < 6; i += 1) {
        const y = s + Math.sin(i * 0.6) * 2.4 * s + i * 0.6 * s;

        p.dot(-wS * 0.3 + i * wS * 0.17, y, 0.9 * s, i === 5 ? '#e8b23a' : color);
      }

      return;
    case 'knives':
      for (const x of [-0.6, 0.1, 0.7])
        p.segment(wH * x, L * 0.7, wH * x, L * 0.95, 1.1 * s, color);

      return;
    case 'necklace':
      for (let i = 0; i < 4; i += 1) {
        const x = (0.6 + i * 1.3) * s;
        const y = (2.5 + i * 0.6) * s;

        p.cel(p.polygon(x, y, x + 0.6 * s, y + 2.1 * s, x + s, y + 0.1 * s), shade, s);
      }

      return;
    case 'leaves':
      for (const x of [-3, 1.8]) {
        const y = L * 0.8;

        p.cel(
          p.polygon(x * s, y, (x + 2.5) * s, y + 3.5 * s, (x - 0.5) * s, y + 4.5 * s),
          shade,
          2 * s,
        );
      }

      return;
  }
}
