import type { Point } from '../../scene/geometry';
import { FX_COLOR } from '../colors';
import { TimedEffect } from '../effect';
import { between, dot, fadeAfter } from './pixels';

// A mark left on the ground for a few seconds: scorch, frost or a crater, embers optional.
export class Scorch extends TimedEffect {
  readonly #at: Point;
  readonly #width: number;
  readonly #colors: readonly [ground: string, ember: string];
  readonly #embers: boolean;

  constructor(
    at: Point,
    width: number,
    colors: readonly [string, string],
    life: number,
    embers = false,
  ) {
    super(life);
    this.#at = at;
    this.#width = width;
    this.#colors = colors;
    this.#embers = embers;
  }

  draw(context: CanvasRenderingContext2D): void {
    const half = this.#width / 2;
    const [ground, ember] = this.#colors;

    context.save();
    context.globalAlpha = fadeAfter(this.progress, 0.65) * 0.85;
    context.fillStyle = ground;
    for (let dy = -2; dy <= 2; dy += 1) {
      const span = Math.round(half * Math.sqrt(1 - (dy / 2.6) ** 2));

      dot(context, this.#at.x - span, this.#at.y + dy, span * 2, 1);
    }
    if (this.#embers) {
      context.fillStyle = ember;
      for (let count = 0; count < 6; count += 1) {
        if (Math.random() < 0.5) {
          dot(
            context,
            this.#at.x + between(-half, half),
            this.#at.y + between(-1.5, 1.5) - (Math.random() < 0.2 ? between(1, 5) : 0),
          );
        }
      }
    }
    context.restore();
  }
}

interface Spike {
  readonly dx: number;
  readonly height: number;
  readonly width: number;
}

const SPIKE = { light: '#bfeaff', body: '#7fc8ef', root: '#2a6f9e', tip: FX_COLOR.steel } as const;

// Ice that bursts out of the floor under a foe and shatters.
export class IceSpikes extends TimedEffect {
  readonly #at: Point;
  readonly #spikes: readonly Spike[];

  constructor(at: Point, spread: number, count: number, height: number) {
    super(0.9);
    this.#at = at;
    this.#spikes = Array.from({ length: count }, (_, index) => ({
      dx: (index / Math.max(1, count - 1) - 0.5) * spread + between(-2, 2),
      height: height * between(0.55, 1) * (index === Math.floor(count / 2) ? 1.3 : 1),
      width: Math.random() < 0.5 ? 3 : 2,
    }));
  }

  draw(context: CanvasRenderingContext2D): void {
    const grow = Math.min(1, this.progress / 0.12);

    context.save();
    context.globalAlpha = fadeAfter(this.progress, 0.55);
    for (const spike of this.#spikes) {
      const height = Math.round(spike.height * grow);

      for (let y = 0; y < height; y += 1) {
        const width = Math.max(1, Math.round(spike.width * (1 - y / height) * 2));

        context.fillStyle = y > height - 3 ? SPIKE.tip : y % 3 === 0 ? SPIKE.light : SPIKE.body;
        dot(context, this.#at.x + spike.dx - width / 2, this.#at.y - y, width, 1);
      }
      context.fillStyle = SPIKE.root;
      dot(context, this.#at.x + spike.dx - spike.width, this.#at.y, spike.width * 2, 1);
    }
    context.restore();
  }
}

// An arrow left standing in the ground after a volley.
export class StuckArrow extends TimedEffect {
  readonly #at: Point;

  constructor(at: Point) {
    super(2.2);
    this.#at = at;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = fadeAfter(this.progress, 0.7);
    context.fillStyle = FX_COLOR.wood;
    dot(context, this.#at.x - 2, this.#at.y - 5);
    dot(context, this.#at.x - 1, this.#at.y - 3, 1, 3);
    context.fillStyle = '#c08a4a';
    dot(context, this.#at.x - 3, this.#at.y - 6, 2, 1);
    context.restore();
  }
}
