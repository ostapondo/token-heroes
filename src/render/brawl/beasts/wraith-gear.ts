import type { Point } from '../../geometry';
import type { Kit } from '../paint/kit';

const STEEL = ['#e6ecf2', '#7d8794'] as const;
const HAFT = ['#5a4636', '#2e2219'] as const;

// A long scythe through the fist: the haft leans back, the curved blade hangs over the head and
// sweeps down as the reaper strikes.
export function paintScythe(
  kit: Kit,
  grip: Point,
  R: number,
  facing: number,
  strike: number,
): void {
  const { p } = kit;
  const angle = -1.25 + Math.max(-0.3, strike) * 1.1;
  const ux = Math.cos(angle) * facing;
  const uy = Math.sin(angle);
  const top = { x: grip.x + ux * R * 2.1, y: grip.y + uy * R * 2.1 };
  const butt = { x: grip.x - ux * R * 1.3, y: grip.y - uy * R * 1.3 };

  p.bone(butt, top, [R * 0.07, R * 0.06], HAFT, facing);
  p.ctx.save();
  p.ctx.translate(top.x, top.y);
  p.ctx.scale(facing, 1);
  p.ctx.rotate(angle + Math.PI / 2);
  p.worldLight();
  p.cel(
    p.shape('0,0 -0.2,-0.45,0.55,-0.75 1.6,-0.7,2.2,0.15 1.4,-0.35,0.55,-0.3 0.15,-0.2,0.1,0.2', R),
    STEEL,
    R * 0.5,
  );
  p.segment(R * 0.6, -R * 0.68, R * 1.7, -R * 0.45, Math.max(0.5, R * 0.04), '#ffffff');
  p.ctx.restore();
}

// A lantern hung on a chain, a swirl of stolen memory glowing inside.
export function paintLantern(kit: Kit, at: Point, R: number, light: string, t: number): void {
  const { p } = kit;
  const swing = Math.sin(t * 2) * 0.15;
  const x = at.x + Math.sin(swing) * R * 0.5;
  const y = at.y + R * 0.4;

  p.segment(at.x, at.y - R * 0.3, x, y - R * 0.3, Math.max(0.6, R * 0.04), kit.lit('h'));
  p.glow(x, y, R * 1.1, light, 0.6 + 0.2 * Math.sin(t * 5));
  p.worldLight();
  p.cel(p.bar(x - R * 0.22, x + R * 0.22, y - R * 0.32, R * 0.06), kit.shade('h'), R * 0.1);
  p.ctx.fillStyle = light;
  p.ctx.globalAlpha *= 0.85;
  p.ctx.fillRect(x - R * 0.2, y - R * 0.28, R * 0.4, R * 0.5);
  p.ctx.globalAlpha /= 0.85;
  p.ctx.strokeStyle = '#ffffff';
  p.ctx.lineWidth = Math.max(0.5, R * 0.04);
  p.ctx.beginPath();
  p.ctx.arc(x, y - R * 0.03, R * 0.1, t * 4, t * 4 + 4.5);
  p.ctx.stroke();
  p.cel(p.bar(x - R * 0.24, x + R * 0.24, y + R * 0.25, R * 0.06), kit.shade('h'), R * 0.1);
  for (const side of [-1, 1])
    p.segment(
      x + side * R * 0.2,
      y - R * 0.3,
      x + side * R * 0.2,
      y + R * 0.25,
      Math.max(0.6, R * 0.05),
      kit.lit('h'),
    );
}
