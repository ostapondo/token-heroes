import type { Point } from '../../geometry';
import { OUTLINE } from '../paint/painter';
import { trail } from './bursts';
import type { Fx } from './fx';
import { heatOf } from './heat';
import type { Missile } from './traits';

interface Shot {
  readonly kind: Missile;
  readonly color: string;
  readonly g: number;
  readonly duration: number;
  readonly land: () => void;
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

// An arrow arcs, a bolt flies nearly flat; both take a fixed time so the number lands with them.
const FLIGHT = {
  arrow: { seconds: 0.14, gravity: 300 },
  bolt: { seconds: 0.2, gravity: 120 },
} as const;

export class Shots {
  #list: Shot[] = [];

  fire(
    kind: Missile,
    from: Point,
    to: Point,
    color: string,
    land: () => void,
    seconds?: number,
  ): void {
    const flight = FLIGHT[kind];
    const duration = seconds ?? flight.seconds;
    const g = seconds ? 0 : flight.gravity;

    this.#list.push({
      kind,
      color,
      g,
      duration,
      land,
      x: from.x,
      y: from.y,
      vx: (to.x - from.x) / duration,
      vy: (to.y - from.y) / duration - 0.5 * g * duration,
      t: 0,
    });
  }

  step(dt: number, fx: Fx): void {
    const landed: Shot[] = [];

    for (const shot of this.#list) {
      shot.t += dt;
      shot.vy += shot.g * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      if (shot.kind === 'bolt') trail(fx, shot.x, shot.y, false, shot.color);
      if (shot.t >= shot.duration) landed.push(shot);
    }
    this.#list = this.#list.filter((shot) => shot.t < shot.duration);
    for (const shot of landed) shot.land();
  }

  clear(): void {
    this.#list = [];
  }

  paint(ctx: CanvasRenderingContext2D): void {
    for (const shot of this.#list) {
      if (shot.kind === 'arrow') arrow(ctx, shot);
      else bolt(ctx, shot);
    }
  }
}

function arrow(ctx: CanvasRenderingContext2D, shot: Shot): void {
  ctx.save();
  ctx.translate(shot.x, shot.y);
  ctx.rotate(Math.atan2(shot.vy, shot.vx));
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(2, 0);
  ctx.stroke();
  ctx.strokeStyle = shot.color;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#d5dce6';
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(0, -2.5);
  ctx.lineTo(0, 2.5);
  ctx.fill();
  ctx.restore();
}

function bolt(ctx: CanvasRenderingContext2D, shot: Shot): void {
  const heat = heatOf(shot.color);
  const glow = ctx.createRadialGradient(shot.x, shot.y, 0, shot.x, shot.y, 16);

  glow.addColorStop(0, heat.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(shot.x, shot.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = heat.core;
  ctx.beginPath();
  ctx.arc(shot.x, shot.y, 4, 0, Math.PI * 2);
  ctx.fill();
}
