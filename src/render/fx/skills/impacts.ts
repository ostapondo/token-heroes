import { FX_COLOR } from '../colors';
import { type Effect, TimedEffect } from '../effect';
import type { Point } from '../../scene/geometry';
import { between, dot } from './pixels';

// A ring of pixels thrown out from a blow, with a white core for the first moment.
export class Burst extends TimedEffect {
  readonly #at: Point;
  readonly #colors: readonly string[];
  readonly #radius: number;

  constructor(at: Point, colors: readonly string[], radius = 14, life = 0.4) {
    super(life);
    this.#at = at;
    this.#colors = colors;
    this.#radius = radius;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const radius = Math.round(3 + this.#radius * Math.sqrt(progress));
    const count = Math.max(12, radius * 4);

    context.save();
    context.globalAlpha = 1 - progress;
    if (progress < 0.3) {
      const core = Math.round((1 - progress / 0.3) * this.#radius * 0.6);

      context.fillStyle = this.#colors.at(-1) ?? FX_COLOR.holy;
      dot(context, this.#at.x - core, this.#at.y - core, core * 2, core * 2);
    }
    context.fillStyle = this.#colors[0] ?? FX_COLOR.steel;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;

      dot(
        context,
        this.#at.x + Math.cos(angle) * radius,
        this.#at.y + Math.sin(angle) * radius * 0.75,
        2,
        2,
      );
    }
    context.restore();
  }
}

interface Chunk {
  x: number;
  y: number;
  vx: number;
  vy: number;
  readonly color: string;
  readonly size: number;
}

const GRAVITY = 260;
const DEBRIS_LIFE = 1.1;

// Chunks thrown up from an impact that fall back and settle on the floor.
export class Debris implements Effect {
  readonly #chunks: Chunk[];
  readonly #floor: number;
  #age = 0;

  constructor(at: Point, colors: readonly string[], count: number, floor: number, power = 60) {
    this.#floor = floor;
    this.#chunks = Array.from({ length: count }, (_, index) => ({
      x: at.x,
      y: at.y,
      vx: between(-power, power) * 0.8,
      vy: between(-power * 1.5, -power * 0.4),
      color: colors[index % colors.length] ?? FX_COLOR.stone,
      size: Math.random() < 0.4 ? 2 : 1,
    }));
  }

  update(dt: number): boolean {
    this.#age += dt;
    for (const chunk of this.#chunks) {
      chunk.vy += GRAVITY * dt;
      chunk.x += chunk.vx * dt;
      chunk.y += chunk.vy * dt;
      if (chunk.y > this.#floor) {
        chunk.y = this.#floor;
        chunk.vy *= -0.3;
        chunk.vx *= 0.6;
      }
    }

    return this.#age < DEBRIS_LIFE;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = Math.min(1, (DEBRIS_LIFE - this.#age) * 2.5);
    for (const chunk of this.#chunks) {
      context.fillStyle = chunk.color;
      dot(context, chunk.x, chunk.y, chunk.size, chunk.size);
    }
    context.restore();
  }
}

// Flat rings that run out along the ground from a slam.
export class Rings extends TimedEffect {
  readonly #at: Point;
  readonly #color: string;
  readonly #reach: number;

  constructor(at: Point, color: string, reach = 40) {
    super(0.55);
    this.#at = at;
    this.#color = color;
    this.#reach = reach;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;

    context.save();
    context.globalAlpha = 1 - progress;
    context.fillStyle = this.#color;
    for (const share of [1, 0.6]) {
      const radius = this.#reach * progress * share;
      const count = Math.max(16, Math.round(radius * 3));

      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2;

        dot(
          context,
          this.#at.x + Math.cos(angle) * radius,
          this.#at.y + Math.sin(angle) * radius * 0.22,
          2,
          1,
        );
      }
    }
    context.restore();
  }
}

interface Puff {
  x: number;
  y: number;
  size: number;
  readonly vx: number;
  readonly vy: number;
}

const SMOKE_LIFE = 0.7;

export class Smoke implements Effect {
  readonly #puffs: Puff[];
  readonly #color: string;
  #age = 0;

  constructor(at: Point, color: string, count = 9) {
    this.#color = color;
    this.#puffs = Array.from({ length: count }, () => ({
      x: at.x + between(-4, 4),
      y: at.y + between(-6, 6),
      size: between(2, 4),
      vx: between(-14, 14),
      vy: between(-18, -4),
    }));
  }

  update(dt: number): boolean {
    this.#age += dt;
    for (const puff of this.#puffs) {
      puff.x += puff.vx * dt;
      puff.y += puff.vy * dt;
      puff.size += 7 * dt;
    }

    return this.#age < SMOKE_LIFE;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = 1 - this.#age / SMOKE_LIFE;
    context.fillStyle = this.#color;
    for (const puff of this.#puffs) {
      const size = Math.round(puff.size);

      dot(context, puff.x - size, puff.y - size / 2, size * 2, size);
      dot(context, puff.x - size / 2, puff.y - size, size, size * 2);
    }
    context.restore();
  }
}
