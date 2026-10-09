import type { Point } from '../../geometry';
import type { Body } from './body';
import { trail } from './bursts';
import type { Fx } from './fx';
import { heatOf } from './heat';

// Shapes that last a moment: light from the sky, lightning, a lance of light, a sniper's aim, a
// falling meteor, an ice spike and a blade's arc. State the rules hold, such as a shield or a
// stun, is drawn from the rules instead, so it never outlives them.
type Shape =
  | { readonly kind: 'beam'; readonly x: number; readonly y: number; readonly width: number }
  | { readonly kind: 'bolt'; readonly from: Point; readonly to: Point; readonly seed: number }
  | { readonly kind: 'lance'; readonly from: Point; readonly to: Point }
  | { readonly kind: 'aim'; readonly from: Body; readonly to: Body }
  | { readonly kind: 'spike'; readonly x: number; readonly y: number; readonly height: number }
  | { readonly kind: 'arc'; readonly body: Body; readonly rings: number }
  | {
      readonly kind: 'meteor';
      readonly from: Point;
      readonly to: Point;
      readonly radius: number;
      readonly land: () => void;
      at: Point;
      landed: boolean;
    };

type Live = Shape & { readonly color: string; readonly duration: number; delay: number; t: number };

const FULL = Math.PI * 2;
const SKY = 260;

export class Vfx {
  #list: Live[] = [];

  add(shape: Shape, color: string, duration: number, delay = 0): void {
    this.#list.push({ ...shape, color, duration, delay, t: 0 });
  }

  step(dt: number, fx: Fx): void {
    for (const live of this.#list) {
      if (live.delay > 0) {
        live.delay -= dt;
        continue;
      }
      live.t += dt;
      if (live.kind !== 'meteor') continue;
      const k = Math.min(1, live.t / live.duration);

      live.at = {
        x: live.from.x + (live.to.x - live.from.x) * k,
        y: live.from.y + (live.to.y - live.from.y) * k,
      };
      trail(fx, live.at.x, live.at.y, true, live.color);
      if (k >= 1 && !live.landed) {
        live.landed = true;
        live.land();
      }
    }
    this.#list = this.#list.filter((live) => live.t < live.duration);
  }

  clear(): void {
    this.#list = [];
  }

  paint(
    ctx: CanvasRenderingContext2D,
    hand: (body: Body) => Point,
    top: (body: Body) => Point,
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const live of this.#list) {
      if (live.delay > 0) continue;
      const fade = 1 - live.t / live.duration;

      ctx.globalAlpha = 1;
      ctx.strokeStyle = live.color;
      switch (live.kind) {
        case 'beam':
          beam(ctx, live, fade);
          break;
        case 'bolt':
          ctx.globalAlpha = fade;
          ctx.lineWidth = 2.5;
          zigzag(ctx, live.from, live.to, live.seed);
          break;
        case 'lance':
          ctx.globalAlpha = fade;
          ctx.lineWidth = 4 * fade + 1;
          line(ctx, live.from, live.to);
          break;
        case 'aim':
          ctx.globalAlpha = 0.4 + 0.4 * Math.sin(live.t * 30);
          ctx.lineWidth = 1;
          line(ctx, hand(live.from), top(live.to));
          break;
        case 'meteor':
          meteor(ctx, live);
          break;
        case 'spike':
          spike(ctx, live, live.t / live.duration);
          break;
        case 'arc':
          ctx.globalAlpha = fade;
          ctx.lineWidth = 3;
          arc(ctx, live, top(live.body));
          break;
      }
    }
    ctx.restore();
  }
}

function line(ctx: CanvasRenderingContext2D, from: Point, to: Point): void {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function zigzag(ctx: CanvasRenderingContext2D, from: Point, to: Point, seed: number): void {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  for (let i = 1; i < 7; i += 1) {
    const k = i / 7;

    ctx.lineTo(
      from.x + (to.x - from.x) * k + Math.sin(seed + i * 7.3) * 9,
      from.y + (to.y - from.y) * k,
    );
  }
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function beam(
  ctx: CanvasRenderingContext2D,
  live: Extract<Live, { kind: 'beam' }>,
  fade: number,
): void {
  const fall = ctx.createLinearGradient(0, live.y - SKY, 0, live.y);
  const width = live.width * (0.5 + fade * 0.5);

  fall.addColorStop(0, 'rgba(255,255,255,0)');
  fall.addColorStop(1, live.color);
  ctx.globalAlpha = fade * 0.8;
  ctx.fillStyle = fall;
  ctx.fillRect(live.x - width / 2, live.y - SKY, width, SKY);
}

function meteor(ctx: CanvasRenderingContext2D, live: Extract<Live, { kind: 'meteor' }>): void {
  const { at, radius } = live;
  const heat = heatOf(live.color);
  const glow = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, radius * 4);

  glow.addColorStop(0, heat.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius * 4, 0, FULL);
  ctx.fill();
  ctx.fillStyle = heat.core;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, FULL);
  ctx.fill();
}

function spike(
  ctx: CanvasRenderingContext2D,
  live: Extract<Live, { kind: 'spike' }>,
  k: number,
): void {
  const height = live.height * Math.min(1, k * 5) * (k > 0.7 ? (1 - k) / 0.3 : 1);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(${heatOf(live.color).steps[0] ?? '200,236,255'},0.85)`;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(live.x - 9, live.y);
  ctx.lineTo(live.x - 2, live.y - height);
  ctx.lineTo(live.x + 3, live.y - height * 0.7);
  ctx.lineTo(live.x + 10, live.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
}

function arc(ctx: CanvasRenderingContext2D, live: Extract<Live, { kind: 'arc' }>, at: Point): void {
  for (let i = 0; i < live.rings; i += 1) {
    const from = live.t * 18 + i;

    ctx.beginPath();
    ctx.ellipse(at.x, at.y + 14, 34 + i * 8, 10 + i * 3, 0, from, from + 2.2);
    ctx.stroke();
  }
}
