import type { Point } from '../scene/geometry';
import { FX_COLOR } from './colors';
import { TimedEffect } from './effect';

export class Slash extends TimedEffect {
  readonly #at: Point;
  readonly #edge: string;
  readonly #length: number;

  constructor(at: Point, edge: string, length = 12) {
    super(0.32);
    this.#at = at;
    this.#edge = edge;
    this.#length = length;
  }

  draw(context: CanvasRenderingContext2D): void {
    const drawn = Math.ceil(Math.min(this.progress / 0.3, 1) * this.#length);
    const start = { x: this.#at.x + this.#length / 2, y: this.#at.y - this.#length / 2 };

    context.save();
    context.globalAlpha = this.progress > 0.6 ? (1 - this.progress) / 0.4 : 1;
    for (let step = 0; step < drawn; step += 1) {
      context.fillStyle = FX_COLOR.steel;
      context.fillRect(start.x - step, start.y + step, 1, 1);
      context.fillStyle = this.#edge;
      context.fillRect(start.x - step, start.y + step + 1, 1, 1);
    }
    context.restore();
  }
}

export class CrossSlash extends TimedEffect {
  readonly #at: Point;

  constructor(at: Point) {
    super(0.5);
    this.#at = at;
  }

  draw(context: CanvasRenderingContext2D): void {
    const size = Math.round((this.progress < 0.25 ? 0.4 + this.progress * 3.2 : 1.1) * 16);

    context.save();
    context.globalAlpha = this.progress > 0.6 ? (1 - this.progress) / 0.4 : 1;
    context.fillStyle = FX_COLOR.steel;
    for (let step = -size; step <= size; step += 1) {
      context.fillRect(this.#at.x + step, this.#at.y + step, 2, 2);
      context.fillRect(this.#at.x + step, this.#at.y - step, 2, 2);
    }
    context.restore();
  }
}

export class Projectile extends TimedEffect {
  readonly #from: Point;
  readonly #to: Point;
  readonly #colors: readonly [head: string, tail: string];
  readonly #size: number;

  constructor(from: Point, to: Point, colors: readonly [string, string], size: number) {
    super(0.28);
    this.#from = from;
    this.#to = to;
    this.#colors = colors;
    this.#size = size;
  }

  draw(context: CanvasRenderingContext2D): void {
    const x = this.#from.x + (this.#to.x - this.#from.x) * this.progress;
    const y = this.#from.y + (this.#to.y - this.#from.y) * this.progress;
    const [head, tail] = this.#colors;

    context.fillStyle = tail;
    context.fillRect(Math.round(x) - this.#size * 2, Math.round(y), this.#size * 2, this.#size);
    context.fillStyle = head;
    context.fillRect(Math.round(x), Math.round(y), this.#size, this.#size);
  }
}

export class Beam extends TimedEffect {
  readonly #from: Point;
  readonly #to: Point;

  constructor(from: Point, to: Point) {
    super(0.55);
    this.#from = from;
    this.#to = to;
  }

  draw(context: CanvasRenderingContext2D): void {
    const reach = Math.min(this.progress / 0.5, 1);
    const thickness = this.progress < 0.5 ? 6 : 6 + (this.progress - 0.5) * 24;

    context.save();
    context.globalAlpha = this.progress < 0.5 ? 1 : 1 - (this.progress - 0.5) / 0.5;
    context.fillStyle = FX_COLOR.gold;
    context.fillRect(
      this.#from.x,
      this.#from.y - thickness / 2 - 1,
      (this.#to.x - this.#from.x) * reach,
      thickness + 2,
    );
    context.fillStyle = FX_COLOR.holy;
    context.fillRect(
      this.#from.x,
      this.#from.y - thickness / 2,
      (this.#to.x - this.#from.x) * reach,
      thickness,
    );
    context.restore();
  }
}
