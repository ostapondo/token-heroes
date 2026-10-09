import type { BipedLook, Paint } from '@content';
import type { Point } from '../../geometry';
import type { Shade } from './colors';
import type { Kit } from './kit';

// A tail from the hips, curling behind and up to a spade.
export function tail(kit: Kit, pelvis: Point, s: number, facing: number, paint: Paint): void {
  const { p } = kit;
  const sway = Math.sin(kit.t * 2.2) * 2 * s;
  const joints = [
    pelvis,
    { x: pelvis.x - facing * 8 * s, y: pelvis.y + 6 * s },
    { x: pelvis.x - facing * 16 * s, y: pelvis.y + 4 * s + sway },
    { x: pelvis.x - facing * 21 * s, y: pelvis.y - 4 * s + sway },
  ];
  const shade = kit.shade(paint);

  for (let i = 0; i < 3; i += 1) {
    const from = joints[i] ?? pelvis;
    const to = joints[i + 1] ?? pelvis;

    p.bone(from, to, [(2.2 - i * 0.55) * s, (1.7 - i * 0.5) * s], shade, facing);
  }
  const tip = joints[3] ?? pelvis;

  p.worldLight();
  p.cel(
    p.polygon(
      tip.x,
      tip.y + 1.5 * s,
      tip.x - facing * 3.5 * s,
      tip.y - 1 * s,
      tip.x - facing * 1 * s,
      tip.y - 5 * s,
      tip.x + facing * 2 * s,
      tip.y - 1 * s,
    ),
    shade,
    3 * s,
  );
}

// A hand as the look has it: claws hooked forward, an angular fist of stone, or finger bones.
export function hand(
  kit: Kit,
  hands: BipedLook['hands'],
  at: Point,
  r: number,
  shade: Shade,
  facing: number,
): void {
  const { p } = kit;

  p.worldLight();
  if (hands === 'rock') {
    p.cel(
      p.polygon(
        at.x - r,
        at.y - r * 0.4,
        at.x - r * 0.4,
        at.y - r * 1.05,
        at.x + r * 0.7,
        at.y - r * 0.8,
        at.x + r * 1.05,
        at.y + r * 0.2,
        at.x + r * 0.3,
        at.y + r,
        at.x - r * 0.75,
        at.y + r * 0.7,
      ),
      shade,
      r,
    );
    p.segment(
      at.x - r * 0.3,
      at.y - r * 0.5,
      at.x + r * 0.1,
      at.y + r * 0.3,
      Math.max(0.6, r * 0.12),
      shade[1],
    );

    return;
  }
  if (hands === 'bones') {
    for (const k of [-0.5, 0, 0.5])
      p.segment(
        at.x,
        at.y,
        at.x + facing * r * 1.3,
        at.y + r * (0.4 + k),
        Math.max(0.6, r * 0.22),
        shade[0],
      );
    p.cel(p.circle(at.x, at.y, r * 0.6), shade, r * 0.6);

    return;
  }
  p.cel(p.circle(at.x, at.y, r), shade, r);
  if (hands !== 'claws') return;
  for (const k of [-0.5, 0, 0.5]) {
    const x = at.x + facing * r * 0.8;
    const y = at.y + k * r * 0.8;

    p.cel(
      p.polygon(x, y - r * 0.18, x + facing * r * 0.9, y + r * 0.35, x, y + r * 0.18),
      kit.shade('h'),
      r * 0.2,
    );
  }
}
