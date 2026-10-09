import { OUTLINE } from '../paint/painter';
import { RING_LIFE, type Fx, type Particle } from './fx';

export const PIXEL_FONT = '"Jersey 10", monospace';
const FULL = Math.PI * 2;
const FLASH = 0.14;

// Scorch marks under the fight: dark rings that glow for their first seconds.
export function paintDecals(ctx: CanvasRenderingContext2D, fx: Fx): void {
  for (const decal of fx.decals) {
    const fade = Math.min(1, decal.life / 3);

    ctx.fillStyle = `rgba(14,4,2,${0.6 * fade})`;
    ctx.beginPath();
    ctx.ellipse(decal.x, decal.y + 3, decal.radius, decal.radius * 0.16, 0, 0, FULL);
    ctx.fill();
    if (decal.life <= 5) continue;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,106,43,${(decal.life - 5) * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(decal.x, decal.y + 2, decal.radius * 0.6, decal.radius * 0.08, 0, 0, FULL);
    ctx.fill();
    ctx.restore();
  }
}

function solid(ctx: CanvasRenderingContext2D, p: Particle, k: number): void {
  if (p.kind === 'smoke' || p.kind === 'dust') {
    ctx.fillStyle =
      p.kind === 'dust' ? `rgba(120,70,40,${(1 - k) * 0.4})` : `rgba(36,22,18,${(1 - k) * 0.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, FULL);
    ctx.fill();
  } else if (p.kind === 'rock') {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.hot && p.life < 0.5 ? '#ff7a2b' : p.color;
    ctx.fillRect(-p.size, -p.size * 0.8, p.size * 2, p.size * 1.6);
    ctx.restore();
  } else if (p.kind === 'chip') {
    ctx.globalAlpha = 1 - k * k;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
    ctx.globalAlpha = 1;
  }
}

function star(ctx: CanvasRenderingContext2D, p: Particle, k: number): void {
  ctx.strokeStyle = `rgba(255,250,235,${1 - k})`;
  ctx.lineWidth = 2.2 * (1 - k) + 0.6;
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const a = p.rot + (i * Math.PI) / 4;
    const reach = p.size * (0.5 + k * 0.6) * (i % 2 ? 0.6 : 1);

    ctx.moveTo(p.x - Math.cos(a) * reach, p.y - Math.sin(a) * reach);
    ctx.lineTo(p.x + Math.cos(a) * reach, p.y + Math.sin(a) * reach);
  }
  ctx.stroke();
}

function bright(ctx: CanvasRenderingContext2D, p: Particle, k: number): void {
  switch (p.kind) {
    case 'fire':
      ctx.fillStyle = `rgba(${p.steps[Math.min(3, Math.floor(k * 4))] ?? '255,170,60'},${1 - k})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - k * 0.5), 0, FULL);
      ctx.fill();
      break;
    case 'spark':
      ctx.strokeStyle = `rgba(255,214,120,${1 - k})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
      ctx.stroke();
      break;
    case 'star':
      star(ctx, p, k);
      break;
    case 'mote':
      ctx.fillStyle = `rgba(${p.steps[1] ?? '255,240,200'},${Math.sin(k * Math.PI)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, FULL);
      ctx.fill();
      break;
    case 'ember':
      ctx.globalAlpha = Math.sin(k * Math.PI) * 0.8;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
      break;
    case 'smoke':
    case 'dust':
    case 'rock':
    case 'chip':
      break;
  }
}

// Smoke, rock and chips first, then everything that glows added over them.
export function paintFx(ctx: CanvasRenderingContext2D, fx: Fx): void {
  for (const p of fx.parts) solid(ctx, p, p.life / p.max);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const ring of fx.rings) {
    const k = ring.t / RING_LIFE;
    const spread = 1 - (1 - k) ** 3;

    if (ring.t < FLASH) {
      const glow = ctx.createRadialGradient(ring.x, ring.y, 0, ring.x, ring.y, ring.radius * 0.9);

      glow.addColorStop(0, `rgba(255,240,200,${1 - ring.t / FLASH})`);
      glow.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius * 0.9, 0, FULL);
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(${ring.color},${(1 - k) * 0.8})`;
    ctx.lineWidth = 6 * (1 - k) + 1;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * (0.25 + spread), 0, FULL);
    ctx.stroke();
  }
  for (const p of fx.parts) bright(ctx, p, p.life / p.max);
  ctx.restore();
}

// Numbers pop, rise and fade, with a dark outline so they read over fire.
export function paintTexts(ctx: CanvasRenderingContext2D, fx: Fx): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  for (const text of fx.texts) {
    const k = text.life / text.max;
    const pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.6 : Math.max(1, 1.2 - (k - 0.12) * 2);
    const y = text.y - Math.min(1, k * 1.6) * text.rise;

    ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    ctx.font = `${Math.round(text.size * pop)}px ${PIXEL_FONT}`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = OUTLINE;
    ctx.strokeText(text.value, text.x, y);
    ctx.fillStyle = text.color;
    ctx.fillText(text.value, text.x, y);
  }
  ctx.restore();
}
