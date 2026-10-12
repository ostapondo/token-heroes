import type { Point } from '../../geometry';
import type { Kit } from '../paint/kit';
import { OUTLINE } from '../paint/painter';

// Glowing traces across the abdomen, like a circuit board, in units of the abdomen's radius.
const TRACES = [
  [-0.95, -0.15, -0.45, -0.15, -0.25, -0.5, 0.35, -0.5],
  [-0.7, 0.3, -0.15, 0.3, 0.05, 0.05, 0.75, 0.05],
  [0.1, -0.85, 0.1, -0.55],
  [0.55, 0.45, 0.85, 0.2],
] as const;

export function paintCircuit(kit: Kit, at: Point, r: number, facing: number, color: string): void {
  const { p } = kit;

  p.ctx.save();
  p.ctx.translate(at.x, at.y);
  p.ctx.scale(facing, 1);
  p.glow(0, -r * 0.2, r * 1.2, color, 0.35);
  p.ctx.strokeStyle = color;
  p.ctx.fillStyle = color;
  p.ctx.lineWidth = Math.max(0.8, r * 0.07);
  p.ctx.lineJoin = 'round';
  for (const trace of TRACES) {
    p.ctx.beginPath();
    for (let i = 0; i < trace.length; i += 2) {
      const x = (trace[i] ?? 0) * r;
      const y = (trace[i + 1] ?? 0) * r;

      if (i === 0) p.ctx.moveTo(x, y);
      else p.ctx.lineTo(x, y);
    }
    p.ctx.stroke();
    const endX = (trace.at(-2) ?? 0) * r;
    const endY = (trace.at(-1) ?? 0) * r;

    p.ctx.fillRect(endX - r * 0.07, endY - r * 0.07, r * 0.14, r * 0.14);
  }
  p.ctx.restore();
}

// A syringe strapped along the abdomen: a glass barrel of glowing fluid, a plunger at the front
// and a long needle at the back, a drop gathering at its point.
export function paintNeedle(kit: Kit, at: Point, r: number, facing: number, fluid: string): void {
  const { p } = kit;
  const t = kit.t;

  p.ctx.save();
  p.ctx.translate(at.x - facing * r * 0.05, at.y - r * 1.05);
  p.ctx.scale(-facing, 1);
  p.ctx.rotate(-0.35);
  p.worldLight();
  p.segment(-1.35 * r, 0, -0.85 * r, 0, r * 0.12, kit.lit('h'));
  p.cel(p.bar(-1.45 * r, -1.35 * r, 0, r * 0.32), kit.shade('h'), r * 0.3);
  p.segment(0.85 * r, 0, 2.1 * r, 0, Math.max(0.8, r * 0.07), '#dfe6ee');
  p.segment(0.85 * r, 0, 2.1 * r, 0, Math.max(0.4, r * 0.025), '#ffffff');
  const level = 0.55 + 0.25 * Math.sin(t * 1.5);

  p.glow(0.1 * r, 0, r * 1.1, fluid, 0.5);
  p.ctx.fillStyle = fluid;
  p.ctx.fillRect(-0.85 * r + (1 - level) * 1.7 * r, -r * 0.24, level * 1.7 * r, r * 0.48);
  p.ctx.fillStyle = 'rgba(220,240,255,0.25)';
  p.ctx.fillRect(-0.85 * r, -r * 0.28, 1.7 * r, r * 0.56);
  p.ctx.strokeStyle = OUTLINE;
  p.ctx.lineWidth = p.outline;
  p.ctx.strokeRect(-0.85 * r, -r * 0.28, 1.7 * r, r * 0.56);
  p.ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  p.ctx.lineWidth = Math.max(0.5, r * 0.05);
  for (let i = 1; i < 5; i += 1) {
    p.ctx.beginPath();
    p.ctx.moveTo(-0.85 * r + i * 0.34 * r, -r * 0.28);
    p.ctx.lineTo(-0.85 * r + i * 0.34 * r, -r * 0.12);
    p.ctx.stroke();
  }
  const drop = (t * 0.8) % 1;

  p.glow(2.1 * r, r * 0.05 + drop * r * 0.3, r * 0.25, fluid, 1 - drop);
  p.dot(2.1 * r, r * 0.05 + drop * r * 0.3, r * 0.08, fluid);
  p.ctx.restore();
}
