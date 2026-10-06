import type { Point } from '../scene/geometry';
import { FX_COLOR } from './colors';
import { TimedEffect } from './effect';

const PUFFS = 18;
const SPREAD = 0.35;
const GROW_UNTIL = 0.45;

interface Puff {
  readonly along: number;
  readonly side: number;
  readonly size: number;
  readonly color: string;
}

export class Breath extends TimedEffect {
  readonly #from: Point;
  readonly #to: Point;
  readonly #puffs: readonly Puff[];

  constructor(from: Point, to: Point, colors: readonly string[]) {
    super(0.6);
    this.#from = from;
    this.#to = to;
    this.#puffs = Array.from({ length: PUFFS }, (_, index) => ({
      along: index / (PUFFS - 1),
      side: Math.random() * 2 - 1,
      size: 2 + Math.round(Math.random() * 3),
      color: colors[index % colors.length] ?? FX_COLOR.steel,
    }));
  }

  draw(context: CanvasRenderingContext2D): void {
    const reach = Math.min(this.progress / GROW_UNTIL, 1);
    const fade =
      this.progress < GROW_UNTIL ? 1 : 1 - (this.progress - GROW_UNTIL) / (1 - GROW_UNTIL);
    const dx = this.#to.x - this.#from.x;
    const dy = this.#to.y - this.#from.y;
    const length = Math.hypot(dx, dy);

    context.save();
    context.globalAlpha = fade;
    for (const puff of this.#puffs) {
      if (puff.along > reach) continue;
      const width = puff.along * length * SPREAD;
      const x = this.#from.x + dx * puff.along - (dy / length) * width * puff.side * 0.5;
      const y = this.#from.y + dy * puff.along + (dx / length) * width * puff.side * 0.5;

      context.fillStyle = puff.color;
      context.fillRect(Math.round(x), Math.round(y), puff.size, puff.size);
    }
    context.restore();
  }
}
