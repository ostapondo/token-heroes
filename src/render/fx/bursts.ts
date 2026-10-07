import type { Point } from '../scene/geometry';
import { FX_COLOR } from './colors';
import { TimedEffect } from './effect';

interface Spark {
  readonly angle: number;
  readonly speed: number;
  readonly color: string;
  readonly long: boolean;
}

export class Sparks extends TimedEffect {
  readonly #at: Point;
  readonly #reach: number;
  readonly #colors: readonly string[];
  readonly #sparks: readonly Spark[];

  constructor(at: Point, colors: readonly string[], options: { count: number; reach: number }) {
    super(0.45);
    this.#at = at;
    this.#reach = options.reach;
    this.#sparks = Array.from({ length: options.count }, (_, index) => ({
      angle: (index / options.count) * Math.PI * 2 + Math.random() * 0.4,
      speed: 0.6 + Math.random() * 0.4,
      color: colors[index % colors.length] ?? FX_COLOR.steel,
      long: index % 2 === 1,
    }));
    this.#colors = [...new Set(this.#sparks.map((spark) => spark.color))];
  }

  draw(context: CanvasRenderingContext2D): void {
    const distance = this.progress * this.#reach;

    context.save();
    context.globalAlpha = 1 - this.progress;
    for (const color of this.#colors) {
      context.fillStyle = color;
      context.beginPath();
      for (const spark of this.#sparks) {
        if (spark.color !== color) continue;
        const x = this.#at.x + Math.cos(spark.angle) * distance * spark.speed;
        const y = this.#at.y + Math.sin(spark.angle) * distance * spark.speed;

        context.rect(Math.round(x), Math.round(y), spark.long ? 3 : 2, spark.long ? 1 : 2);
      }
      context.fill();
    }
    context.restore();
  }
}

export class Shockwave extends TimedEffect {
  readonly #at: Point;
  readonly #color: string;

  constructor(at: Point, color: string) {
    super(0.45);
    this.#at = at;
    this.#color = color;
  }

  draw(context: CanvasRenderingContext2D): void {
    const half = Math.round(4 + this.progress * 22);

    context.save();
    context.globalAlpha = 1 - this.progress;
    context.strokeStyle = this.#color;
    context.lineWidth = 2;
    context.strokeRect(this.#at.x - half, this.#at.y - half, half * 2, half * 2);
    context.restore();
  }
}
