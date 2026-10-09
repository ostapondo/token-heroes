import type { Detail } from '@content';
import type { Kit } from './kit';
import { bowtie, chains, clips, skulls, spikes, stitches } from './boss-details';
import { framed, glowing, trinket } from './trinkets';

// The torso's frame: origin at the neck, +y down the spine to the pelvis at L, +x forward.
export interface Torso {
  readonly length: number;
  readonly shoulders: number;
  readonly hips: number;
  readonly s: number;
}

function belt(kit: Kit, at: Torso, color: string): void {
  const { length: L, hips: wH, s } = at;

  kit.p.segment(-wH, L * 0.84, wH, L * 0.84, 1.8 * s, color);
}

// A torso detail drawn over the body: belts, straps, armour, trinkets and what glows.
export function paintDetail(kit: Kit, at: Torso, detail: Detail): void {
  const { p } = kit;
  const { length: L, shoulders: wS, hips: wH, s } = at;

  if ('glow' in detail) {
    glowing(kit, at, detail);

    return;
  }
  if ('trim' in detail) {
    framed(kit, at, detail);

    return;
  }
  const color = kit.lit(detail.color);
  const shade = kit.shade(detail.color);

  switch (detail.kind) {
    case 'beads':
    case 'knives':
    case 'necklace':
    case 'leaves':
      trinket(kit, at, detail.kind, detail.color);
      break;
    case 'belt':
      belt(kit, at, color);
      break;
    case 'strap':
      p.segment(wS * 0.8, -s, -wH * 0.9, L * 0.85, 1.5 * s, color);
      break;
    case 'trim':
      p.segment(wS * 0.55, 0, wH * 0.8, L + 2 * s, 1.6 * s, color);
      break;
    case 'ribs':
      p.segment(-wS * 0.45, 0, -wH * 0.5, L, 1.6 * s, color);
      for (let i = 0; i < 4; i += 1) {
        const y = L * (0.12 + 0.16 * i);

        p.segment(-wS * 0.45, y, wS * 0.75 - i * s, y + 1.6 * s, 1.3 * s, color);
      }
      break;
    case 'spikes':
      spikes(kit, at, detail.color);
      break;
    case 'chains':
      chains(kit, at, detail.color);
      break;
    case 'skulls':
      skulls(kit, at, detail.color);
      break;
    case 'stitches':
      stitches(kit, at, detail.color);
      break;
    case 'clips':
      clips(kit, at, detail.color);
      break;
    case 'bowtie':
      bowtie(kit, at, detail.color);
      break;
    case 'pauldron':
      p.cel(p.circle(0, s, wS * 0.66), shade, wS * 0.6);
      break;
    case 'plate':
      p.cel(
        p.polygon(-wS * 0.3, L * 0.08, wS * 0.85, L * 0.12, wH * 0.9, L * 0.62, -wH * 0.2, L * 0.6),
        shade,
        wS * 0.6,
      );
      break;
    case 'pouch':
      p.cel(p.bar(wH * 0.2, wH * 0.8, L * 0.95, 1.6 * s), shade, 2 * s);
      break;
    case 'cracks':
      p.polyline(
        0.9 * s,
        color,
        -wS * 0.6,
        L * 0.1,
        -wS * 0.2,
        L * 0.3,
        -wS * 0.5,
        L * 0.7,
        wH * 0.2,
        L * 0.95,
      );
      break;
    case 'tabard':
      p.cel(
        p.polygon(
          -wS * 0.5,
          L * 0.2,
          wS * 0.8,
          L * 0.2,
          wH * 0.95,
          L + 4 * s,
          -wH * 0.6,
          L + 4 * s,
        ),
        shade,
        wS,
      );
      if (detail.emblem) {
        const mark = kit.lit(detail.emblem);

        p.segment(wS * 0.15, L * 0.32, wS * 0.15, L * 0.78, 1.4 * s, mark);
        p.segment(-wS * 0.15, L * 0.46, wS * 0.48, L * 0.46, 1.4 * s, mark);
      }
      break;
  }
}
