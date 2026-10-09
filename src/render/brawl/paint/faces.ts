import type { Head } from '@content';
import { hat } from './hats';
import type { Kit } from './kit';
import { OUTLINE, type Painter } from './painter';

type Face = Extract<Head, { form: 'face' }>;

// A glowing eye takes the body's colour; a dead one is a cross.
export function eye(kit: Kit, x: number, y: number, r: number, color: string): void {
  const { p } = kit;

  if (p.mood !== 'dead') {
    p.glow(x, y, r * 3, color, 0.7);
    p.dot(x, y, r, color);

    return;
  }
  p.ctx.strokeStyle = OUTLINE;
  p.ctx.lineWidth = Math.max(0.8, r * 0.6);
  p.ctx.beginPath();
  p.ctx.moveTo(x - r, y - r);
  p.ctx.lineTo(x + r, y + r);
  p.ctx.moveTo(x + r, y - r);
  p.ctx.lineTo(x - r, y + r);
  p.ctx.stroke();
}

function plainEye(p: Painter, ex: number, ey: number, r: number): void {
  const { ctx } = p;

  if (p.mood === 'hurt') {
    ctx.beginPath();
    ctx.moveTo(ex - r * 0.15, ey - r * 0.1);
    ctx.lineTo(ex + r * 0.1, ey);
    ctx.lineTo(ex - r * 0.15, ey + r * 0.1);
    ctx.stroke();

    return;
  }
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.ellipse(ex, ey, r * 0.12, r * (p.mood === 'happy' ? 0.09 : 0.17), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.fillRect(ex + r * 0.01, ey - r * 0.12, r * 0.07, r * 0.07);
}

// Faces react: a shout on the swing, a wince when hit, a grin on a cleared stage, a cross
// for an eye when dead.
function features(kit: Kit, r: number, ox: number, oy: number, glowing?: string): void {
  const { p } = kit;
  const { ctx } = p;
  const ex = ox + r * 0.45;
  const ey = oy - r * 0.1;
  const mouth = '#3a0e0a';

  ctx.strokeStyle = OUTLINE;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(0.8, r * 0.12);
  if (p.mood === 'dead') eye(kit, ex, ey, r * 0.13, OUTLINE);
  else if (glowing) eye(kit, ex, ey, r * 0.15, glowing);
  else plainEye(p, ex, ey, r);
  if (p.mood === 'shout' || p.mood === 'hurt') {
    ctx.beginPath();
    ctx.moveTo(ex - r * 0.2, ey - r * 0.36);
    ctx.lineTo(ex + r * 0.2, ey - r * 0.24);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  if (p.mood === 'shout') p.dot(ox + r * 0.62, oy + r * 0.5, r * 0.18, mouth);
  else if (p.mood !== 'idle' && p.mood !== 'happy')
    p.dot(ox + r * 0.62, oy + r * 0.5, r * 0.11, mouth);
  else if (p.mood === 'happy') {
    ctx.beginPath();
    ctx.arc(ox + r * 0.6, oy + r * 0.35, r * 0.2, 0.3, Math.PI - 0.6);
    ctx.stroke();
  } else p.segment(ox + r * 0.48, oy + r * 0.48, ox + r * 0.8, oy + r * 0.44, 0.6, mouth);
}

// A smile too wide to trust: a crescent of teeth from cheek to chin.
function grin(kit: Kit, r: number, teeth: string): void {
  const { ctx } = kit.p;

  ctx.fillStyle = '#3a0e0a';
  ctx.beginPath();
  ctx.moveTo(r * 0.05, r * 0.25);
  ctx.quadraticCurveTo(r * 0.5, r * 0.95, r * 1.0, r * 0.2);
  ctx.quadraticCurveTo(r * 0.5, r * 0.55, r * 0.05, r * 0.25);
  ctx.fill();
  ctx.fillStyle = teeth;
  ctx.beginPath();
  for (let k = 0.15; k < 0.95; k += 0.13) {
    const y = r * (0.32 + Math.sin(k * Math.PI) * 0.2);

    ctx.rect(r * k, y, r * 0.09, r * 0.12);
  }
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = Math.max(0.8, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(r * 0.05, r * 0.25);
  ctx.quadraticCurveTo(r * 0.5, r * 0.95, r * 1.0, r * 0.2);
  ctx.stroke();
}

export function face(kit: Kit, head: Face, r: number): void {
  const { p, shade } = kit;
  const skin = shade(head.skin);
  const hooded = head.hood !== undefined;
  const k = hooded ? 0.8 : 1;
  const ox = hooded ? r * 0.3 : 0;
  const oy = hooded ? r * 0.08 : 0;

  if (head.ears) p.cel(p.shape('-0.2,-0.3 -2.1,-1.2 -0.4,0.35', r), shade(head.ears), r * 0.5);
  if (head.hair)
    p.cel(
      p.shape('0.05,-1 -1.1,-1.2,-1.2,-0.1 -1.5,0.9,-0.8,1.3 -0.4,0.4,0.05,0.2', r),
      shade(head.hair),
      r,
    );
  if (head.hood) p.cel(p.circle(0, 0, r * 1.14), shade(head.hood), r);
  p.cel(p.circle(ox, oy, r * k), skin, r * k);
  if (head.nose) p.cel(p.shape('0.75,-0.15 1.75,0.35 0.75,0.4', r * k), shade(head.nose), r * 0.3);
  else p.cel(p.circle(ox + r * k * 0.92, oy + r * k * 0.12, r * k * 0.2), skin, r * 0.2);
  features(kit, r * k, ox, oy, head.eyes ? kit.lit(head.eyes) : undefined);
  if (head.mask)
    p.cel(p.shape('-0.2,0.25 1.15,0.2 1.05,0.85 -0.2,0.9', r), shade(head.mask), r * 0.5);
  if (head.tusks) p.cel(p.shape('0.62,0.48 0.88,-0.02 0.82,0.52', r), shade(head.tusks), r * 0.2);
  if (head.beard) {
    p.cel(
      p.shape('0.1,0.25 0.98,0.25 0.85,1.15,0.12,1.6 -0.15,0.85,0.1,0.25', r),
      shade(head.beard),
      r * 0.6,
    );
  }
  if (head.grin) grin(kit, r, kit.lit(head.grin));
  if (head.marks) {
    for (let i = 0; i < 3; i += 1)
      p.dot(r * (0.1 + i * 0.25), -r * 0.62, r * 0.07, kit.lit(head.marks));
  }
  if (head.hat) hat(kit, head.hat, r);
}
