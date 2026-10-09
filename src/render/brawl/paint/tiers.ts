import type { Point } from '../../geometry';
import { J } from '../rig/skeleton';
import type { BipedView } from './biped';
import { darken, type Shade } from './colors';
import type { Kit } from './kit';

// A milestone every 25 levels is a new piece of gear: a shoulder plate, then a cape, then a lit
// weapon, then an aura and a halo. The plate's metal climbs iron, steel, gold, then the hero's
// own colour.
const METAL: readonly Shade[] = [
  ['#8d95a3', '#4a505c'],
  ['#d5dce6', '#6f7b8c'],
  ['#f2c14e', '#9a6a14'],
];

const at = (points: readonly Point[], index: number): Point => points[index] ?? { x: 0, y: 0 };

export type TierSpot = 'behind' | 'head' | 'shoulder' | 'weapon';

export function paintTier(kit: Kit, view: BipedView, spot: TierSpot): void {
  const { p } = kit;
  const { tier, tint, build } = view;
  const s = build.scale;

  if (!tint || tier < 1) return;
  if (spot === 'behind' && tier >= 4) {
    const neck = at(view.points, J.neck);
    const pelvis = at(view.points, J.pelvis);
    const pulse = 0.3 + 0.08 * Math.sin(kit.t * 3) + 0.05 * (tier - 4);

    p.glow((neck.x + pelvis.x) / 2, (neck.y + pelvis.y) / 2, 30 * s, tint, pulse);
  } else if (spot === 'head' && tier >= 4) {
    const r = build.head * s;
    const y = -r * 1.9;

    p.glow(0, y, r * 1.6, tint, 0.5);
    p.ctx.strokeStyle = tint;
    p.ctx.lineWidth = 1.4;
    p.ctx.beginPath();
    p.ctx.ellipse(0, y, r * 0.85, r * 0.26, 0, 0, Math.PI * 2);
    p.ctx.stroke();
  } else if (spot === 'shoulder') {
    const neck = at(view.points, J.neck);
    const pelvis = at(view.points, J.pelvis);
    const shoulder = {
      x: neck.x + (pelvis.x - neck.x) * 0.12,
      y: neck.y + (pelvis.y - neck.y) * 0.12,
    };
    const metal = METAL[tier - 1] ?? [tint, darken(tint, 0.5)];
    const r = build.arm * s * 1.55;

    p.frame(shoulder, at(view.points, J.elbowF), view.facing);
    p.cel(p.circle(0, r * 0.35, r), metal, r);
    p.restore();
  } else if (spot === 'weapon' && tier >= 3) {
    p.glow(15 * s, 0, 13 * s, tint, 0.4 + 0.15 * Math.sin(kit.t * 5));
  }
}
