import type { Paint } from '@content';
import type { Torso } from './details';
import type { Kit } from './kit';
import { OUTLINE } from './painter';

// Each in the torso's frame: origin at the neck, +y down the spine to L, +x forward.

export function spikes(kit: Kit, at: Torso, color: Paint): void {
  const { p } = kit;
  const { shoulders: w, s } = at;

  for (const [x, size, lean] of [
    [-0.55, 1, -0.5],
    [-0.1, 1.3, -0.15],
    [0.35, 0.95, 0.25],
  ] as const) {
    const base = x * w;

    p.cel(
      p.polygon(base - 1.6 * s, 0, base + lean * 6 * s, -7 * size * s, base + 1.6 * s, 0),
      kit.shade(color),
      2 * s,
    );
  }
}

export function chains(kit: Kit, at: Torso, color: Paint): void {
  const { p } = kit;
  const { length: L, shoulders: w, s } = at;
  const metal = kit.lit(color);

  p.ctx.lineWidth = Math.max(0.8, s * 0.55);
  for (let i = 0; i < 9; i += 1) {
    const k = i / 8;
    const x = w * (0.75 - k * 1.6);
    const y = L * (0.15 + k * 0.6) + Math.sin(k * Math.PI) * L * 0.08;

    p.ctx.strokeStyle = OUTLINE;
    p.ctx.beginPath();
    p.ctx.ellipse(x, y, 1.6 * s, 1 * s, i % 2 ? 0.6 : -0.9, 0, Math.PI * 2);
    p.ctx.stroke();
    p.ctx.strokeStyle = metal;
    p.ctx.lineWidth = Math.max(0.6, s * 0.35);
    p.ctx.stroke();
    p.ctx.lineWidth = Math.max(0.8, s * 0.55);
  }
}

export function skulls(kit: Kit, at: Torso, color: Paint): void {
  const { p } = kit;
  const { length: L, hips: w, s } = at;
  const bone = kit.shade(color);

  p.segment(-w, L * 0.84, w, L * 0.84, 1.8 * s, '#4a3220');
  for (const x of [-0.55, 0.05, 0.6]) {
    const cx = x * w;
    const cy = L * 0.86;

    p.cel(p.circle(cx, cy, 1.9 * s), bone, 2 * s);
    p.dot(cx - 0.65 * s, cy - 0.1 * s, 0.5 * s, OUTLINE);
    p.dot(cx + 0.65 * s, cy - 0.1 * s, 0.5 * s, OUTLINE);
    p.ctx.fillStyle = OUTLINE;
    p.ctx.fillRect(cx - 0.6 * s, cy + 1 * s, 1.2 * s, 0.4 * s);
  }
}

export function stitches(kit: Kit, at: Torso, color: Paint): void {
  const { p } = kit;
  const { length: L, shoulders: w, s } = at;
  const thread = kit.lit(color);

  p.polyline(
    Math.max(0.6, s * 0.4),
    OUTLINE,
    -w * 0.6,
    L * 0.2,
    w * 0.1,
    L * 0.45,
    w * 0.55,
    L * 0.42,
  );
  for (let k = 0.1; k < 1; k += 0.18) {
    const x = -w * 0.6 + k * w * 1.1;
    const y = L * (0.2 + k * 0.24);

    p.segment(x - s, y - 1.3 * s, x + s, y + 1.3 * s, Math.max(0.5, s * 0.3), thread);
  }
}

// A paperclip stuck in the body, bent wire in two loops.
function clip(kit: Kit, x: number, y: number, size: number, angle: number, color: string): void {
  const { ctx } = kit.p;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.9);
  ctx.lineTo(size * 0.3, -size * 0.55);
  ctx.arc(0, -size * 0.55, size * 0.3, 0, Math.PI, true);
  ctx.lineTo(-size * 0.3, size * 0.75);
  ctx.arc(0, size * 0.75, size * 0.3, Math.PI, 0, true);
  ctx.lineTo(size * 0.3, -size * 0.2);
  ctx.lineCap = 'round';
  ctx.lineWidth = size * 0.22;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = size * 0.11;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

export function clips(kit: Kit, at: Torso, color: Paint): void {
  const { length: L, shoulders: w, s } = at;
  const wire = kit.lit(color);

  for (const [x, y, angle] of [
    [-0.4, 0.2, 0.4],
    [0.35, 0.3, -0.5],
    [-0.1, 0.55, 1.2],
    [0.45, 0.72, 0.2],
    [-0.5, 0.78, -0.9],
  ] as const)
    clip(kit, x * w, y * L, 3.2 * s, angle, wire);
}

export function bowtie(kit: Kit, at: Torso, color: Paint): void {
  const { p } = kit;
  const { s } = at;

  p.cel(p.polygon(0, 0.6 * s, -3 * s, -1.6 * s, -3 * s, 2.8 * s), kit.shade(color), 2 * s);
  p.cel(p.polygon(0, 0.6 * s, 3 * s, -1.6 * s, 3 * s, 2.8 * s), kit.shade(color), 2 * s);
  p.cel(p.circle(0, 0.6 * s, 1 * s), kit.shade(color), s);
}

export function crystals(kit: Kit, at: Torso, color: Paint, glow: Paint): void {
  const { p } = kit;
  const { shoulders: w, s } = at;
  const light = kit.lit(glow);

  p.glow(-w * 0.2, -3 * s, w * 1.2, light, 0.4);
  for (const [x, h, lean] of [
    [-0.6, 7, -0.35],
    [-0.15, 10, -0.05],
    [0.3, 6, 0.3],
  ] as const) {
    const base = x * w;
    const tip = { x: base + lean * h * s, y: -h * s };

    p.cel(
      p.polygon(
        base - 1.5 * s,
        0,
        tip.x - 1.2 * s,
        tip.y + 1.5 * s,
        tip.x,
        tip.y,
        tip.x + 1.2 * s,
        tip.y + 1.5 * s,
        base + 1.5 * s,
        0,
      ),
      kit.shade(color),
      2 * s,
    );
    p.segment(base, -s, tip.x, tip.y + 1.5 * s, Math.max(0.5, s * 0.35), light);
  }
}

// An hourglass set in the chest, its glowing sand running down.
export function hourglass(kit: Kit, at: Torso, color: Paint, glow: Paint): void {
  const { p } = kit;
  const { length: L, s } = at;
  const cy = L * 0.42;
  const h = L * 0.24;
  const w = h * 0.55;
  const sand = kit.lit(glow);
  const run = (kit.t * 0.25) % 1;

  p.glow(0, cy, h * 1.4, sand, 0.45);
  p.ctx.fillStyle = 'rgba(220,240,255,0.25)';
  p.ctx.beginPath();
  p.ctx.moveTo(-w, cy - h);
  p.ctx.lineTo(w, cy - h);
  p.ctx.lineTo(w * 0.12, cy);
  p.ctx.lineTo(w, cy + h);
  p.ctx.lineTo(-w, cy + h);
  p.ctx.lineTo(-w * 0.12, cy);
  p.ctx.closePath();
  p.ctx.fill();
  p.ctx.strokeStyle = OUTLINE;
  p.ctx.lineWidth = p.outline;
  p.ctx.stroke();
  p.ctx.fillStyle = sand;
  p.ctx.beginPath();
  p.ctx.moveTo(-w * (1 - run) * 0.85, cy - h * (1 - run) * 0.9);
  p.ctx.lineTo(w * (1 - run) * 0.85, cy - h * (1 - run) * 0.9);
  p.ctx.lineTo(0, cy - h * 0.05);
  p.ctx.fill();
  p.ctx.beginPath();
  p.ctx.moveTo(-w * 0.85, cy + h * 0.95);
  p.ctx.lineTo(w * 0.85, cy + h * 0.95);
  p.ctx.lineTo(0, cy + h * (0.95 - run * 0.8));
  p.ctx.fill();
  p.segment(0, cy - h * 0.05, 0, cy + h * 0.9, Math.max(0.5, s * 0.3), sand);
  for (const y of [cy - h, cy + h])
    p.cel(p.bar(-w * 1.2, w * 1.2, y, s * 1.1), kit.shade(color), s);
}
