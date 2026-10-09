import type { Paint } from '@content';
import type { Kit } from './kit';
import { OUTLINE } from './painter';

// A paperclip the size of a greatsword, held by its outer loop. In the fist's frame: along +x.
export function paperclip(kit: Kit, s: number, color: Paint): void {
  const { ctx } = kit.p;
  const wire = kit.lit(color);

  ctx.beginPath();
  ctx.moveTo(-3 * s, 2 * s);
  ctx.lineTo(30 * s, 2 * s);
  ctx.arc(30 * s, -1.5 * s, 3.5 * s, Math.PI / 2, -Math.PI / 2, true);
  ctx.lineTo(-1 * s, -5 * s);
  ctx.arc(-1 * s, -2.2 * s, 2.8 * s, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(25 * s, 0.6 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.2 * s + kit.p.outline;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = 2.2 * s;
  ctx.strokeStyle = wire;
  ctx.stroke();
  ctx.lineWidth = 0.7 * s;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke();
}

// An octagonal stop sign reading 429, upright to the eye whichever way its holder faces.
export function stopSign(kit: Kit, s: number, color: Paint): void {
  const { p } = kit;
  const r = 11 * s;
  const corners: number[] = [];
  const border: number[] = [];

  for (let i = 0; i < 8; i += 1) {
    const a = Math.PI / 8 + (i * Math.PI) / 4;

    corners.push(Math.cos(a) * r, Math.sin(a) * r);
    border.push(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
  }
  p.cel(p.polygon(...corners), ['#f4f0e8', '#b8b0a2'], r);
  p.cel(p.polygon(...border), kit.shade(color), r);
  const m = p.ctx.getTransform();
  const scale = Math.hypot(m.a, m.b);

  p.ctx.save();
  // The sign's centre stays where it is; the text is set upright and unmirrored on screen.
  p.ctx.setTransform(scale, 0, 0, scale, m.e, m.f);
  p.ctx.font = `bold ${Math.round(r * 0.75)}px Arial, sans-serif`;
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'middle';
  p.ctx.fillStyle = '#ffffff';
  p.ctx.fillText('429', 0, r * 0.05);
  p.ctx.restore();
}

// A bat's wing from the shoulder blade, in the torso's frame: an arm up and back, three fingers
// fanned out, and the membrane between them beating.
export function batWing(kit: Kit, s: number, paint: Paint, length: number): void {
  const { p } = kit;
  const flap = Math.sin(kit.t * 5) * 4 * s;
  const root = { x: -3 * s, y: 3 * s };
  const elbow = { x: -14 * s, y: -12 * s - flap * 0.5 };
  const wrist = { x: -24 * s, y: -20 * s - flap };
  const tips = [
    { x: -40 * s, y: -10 * s - flap * 0.6 },
    { x: -36 * s, y: 4 * s - flap * 0.3 },
    { x: -26 * s, y: length * 0.75 },
  ];
  const shade = kit.shade(paint);

  p.cel(
    p.polygon(
      root.x,
      root.y,
      elbow.x,
      elbow.y,
      wrist.x,
      wrist.y,
      tips[0]?.x ?? 0,
      tips[0]?.y ?? 0,
      -33 * s,
      -4 * s,
      tips[1]?.x ?? 0,
      tips[1]?.y ?? 0,
      -27 * s,
      8 * s,
      tips[2]?.x ?? 0,
      tips[2]?.y ?? 0,
      -6 * s,
      length * 0.65,
    ),
    shade,
    14 * s,
  );
  for (const tip of tips)
    p.segment(wrist.x, wrist.y, tip.x, tip.y, Math.max(0.6, 0.9 * s), shade[1]);
  p.polyline(1.6 * s, shade[1], root.x, root.y, elbow.x, elbow.y, wrist.x, wrist.y);
  p.cel(
    p.polygon(
      wrist.x,
      wrist.y,
      wrist.x - 1.5 * s,
      wrist.y - 4 * s,
      wrist.x + 1.5 * s,
      wrist.y - 1 * s,
    ),
    kit.shade('h'),
    2 * s,
  );
}

// A hand mirror with a gilt frame, held up for the boss to admire itself.
export function mirror(kit: Kit, s: number, frame: Paint, glass: Paint): void {
  const { p } = kit;

  p.cel(p.bar(-2 * s, 6 * s, 0, 1.2 * s), kit.shade(frame), s);
  p.cel(p.ellipse(11 * s, 0, 6 * s, 7.5 * s), kit.shade(frame), 6 * s);
  p.cel(p.ellipse(11 * s, 0, 4.6 * s, 6 * s), kit.shade(glass), 5 * s);
  p.segment(8.5 * s, -3.5 * s, 10.5 * s, -5 * s, Math.max(0.6, 0.6 * s), '#ffffff');
  p.dot(13 * s, 2.5 * s, 0.7 * s, 'rgba(255,255,255,0.8)');
}
