import { withAlpha } from '../../color';
import type { Point } from '../../scene/geometry';
import { FX_COLOR } from '../colors';
import { TimedEffect } from '../effect';
import { between, dot, fadeAfter } from './pixels';

// A blade's arc swept round a foe, brightest at its head.
export class SpinSlash extends TimedEffect {
  readonly #at: Point;
  readonly #radius: number;
  readonly #color: string;

  constructor(at: Point, radius: number, color: string) {
    super(0.45);
    this.#at = at;
    this.#radius = radius;
    this.#color = color;
  }

  draw(context: CanvasRenderingContext2D): void {
    const head = this.progress * Math.PI * 3;

    context.save();
    context.globalAlpha = fadeAfter(this.progress, 0.6);
    for (let trail = 0; trail < 26; trail += 1) {
      const angle = head - trail * 0.09;
      const radius = this.#radius * (0.85 + 0.15 * Math.sin(trail));

      context.fillStyle =
        trail < 4 ? FX_COLOR.steel : trail < 12 ? this.#color : withAlpha(this.#color, 0.4);
      dot(
        context,
        this.#at.x + Math.cos(angle) * radius,
        this.#at.y + Math.sin(angle) * radius * 0.45,
        2,
        2,
      );
    }
    context.restore();
  }
}

// A column of light that falls on a spot from the top of the arena.
export class LightFall extends TimedEffect {
  readonly #x: number;
  readonly #floor: number;
  readonly #width: number;
  readonly #colors: readonly [glow: string, core: string];

  constructor(x: number, floor: number, width: number, colors: readonly [string, string]) {
    super(0.7);
    this.#x = x;
    this.#floor = floor;
    this.#width = width;
    this.#colors = colors;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const height = this.#floor * Math.min(1, progress / 0.12);
    const width = Math.round(
      this.#width * (progress < 0.15 ? 1.6 - progress * 4 : 1) * (1 - Math.max(0, progress - 0.5)),
    );
    const [glow, core] = this.#colors;

    context.save();
    context.globalAlpha = fadeAfter(progress, 0.4);
    context.fillStyle = withAlpha(glow, 0.5);
    context.fillRect(this.#x - width, 0, width * 2, height);
    context.fillStyle = core;
    context.fillRect(this.#x - Math.ceil(width / 3), 0, Math.ceil(width / 3) * 2, height);
    context.restore();
  }
}

interface Speck {
  readonly angle: number;
  readonly distance: number;
}

// Specks of light that gather into a hero before its skill fires.
export class Gathering extends TimedEffect {
  readonly #at: () => Point;
  readonly #color: string;
  readonly #specks: readonly Speck[];

  constructor(at: () => Point, color: string, life: number) {
    super(life);
    this.#at = at;
    this.#color = color;
    this.#specks = Array.from({ length: 14 }, (_, index) => ({
      angle: (index / 14) * Math.PI * 2 + between(0, 0.4),
      distance: between(14, 22),
    }));
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const at = this.#at();

    context.save();
    for (const speck of this.#specks) {
      const distance = speck.distance * (1 - progress);

      context.fillStyle = Math.random() < 0.3 ? FX_COLOR.steel : this.#color;
      dot(
        context,
        at.x + Math.cos(speck.angle + progress * 2) * distance,
        at.y + Math.sin(speck.angle + progress * 2) * distance,
      );
    }
    context.globalAlpha = progress * 0.6;
    context.fillStyle = this.#color;
    const glow = Math.round(2 + progress * 3);

    dot(context, at.x - glow / 2, at.y - glow / 2, glow, glow);
    context.restore();
  }
}

// Corner brackets on the ground where a skill from the sky will land.
export class Target extends TimedEffect {
  readonly #at: Point;
  readonly #size: number;
  readonly #color: string;

  constructor(at: Point, size: number, color: string, life: number) {
    super(life);
    this.#at = at;
    this.#size = size;
    this.#color = color;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;

    if (progress > 0.5 && Math.floor(progress * 16) % 2 === 1) return;
    const size = Math.round(this.#size * (1.4 - Math.min(progress, 0.5) * 0.8));
    const { x, y } = this.#at;

    context.save();
    context.fillStyle = this.#color;
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const) {
      dot(context, x + sx * size - (sx > 0 ? 3 : 0), y + sy * size * 0.5, 4, 1);
      dot(context, x + sx * size - (sx > 0 ? 1 : 0), y + sy * size * 0.5 - (sy > 0 ? 2 : 0), 1, 3);
    }
    context.restore();
  }
}
