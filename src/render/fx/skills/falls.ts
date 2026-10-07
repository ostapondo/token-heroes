import { withAlpha } from '../../color';
import type { Point } from '../../scene/geometry';
import { FX_COLOR } from '../colors';
import { TimedEffect } from '../effect';
import { between, dot, line } from './pixels';

const METEOR = { rock: '#7a2f12', shell: '#3a1a0c' } as const;
const TRAIL = 14;
const TRAIL_COLORS = { far: 9, near: 4 };

// A burning rock that falls on its target and lands at the end of its life.
export class Meteor extends TimedEffect {
  readonly #from: Point;
  readonly #to: Point;
  readonly #size: number;

  constructor(from: Point, to: Point, life: number, size = 5) {
    super(life);
    this.#from = from;
    this.#to = to;
    this.#size = size;
  }

  draw(context: CanvasRenderingContext2D): void {
    const along = this.progress ** 1.6;
    const x = this.#from.x + (this.#to.x - this.#from.x) * along;
    const y = this.#from.y + (this.#to.y - this.#from.y) * along;
    const dx = this.#to.x - this.#from.x;
    const dy = this.#to.y - this.#from.y;
    const length = Math.hypot(dx, dy) || 1;
    const half = this.#size / 2;

    // Drawn from the tail to the head, so the hotter pixels near the rock sit on top.
    const steps = Array.from({ length: TRAIL + 1 }, (_, index) => TRAIL - index);

    for (const step of steps) {
      const behind = step * 2.2;
      const size = Math.max(1, this.#size - Math.floor(step / 3));

      context.fillStyle =
        step > TRAIL_COLORS.far
          ? withAlpha(FX_COLOR.ember, 0.4)
          : step > TRAIL_COLORS.near
            ? FX_COLOR.ember
            : FX_COLOR.gold;
      dot(
        context,
        x - (dx / length) * behind - size / 2 + between(-1, 1),
        y - (dy / length) * behind - size / 2 + between(-1, 1),
        size,
        size,
      );
    }
    context.fillStyle = METEOR.shell;
    dot(context, x - half - 1, y - half - 1, this.#size + 2, this.#size + 2);
    context.fillStyle = METEOR.rock;
    dot(context, x - half, y - half, this.#size, this.#size);
    context.fillStyle = FX_COLOR.gold;
    dot(context, x - half, y - half, 2, 2);
  }
}

const ARROW_FLIGHT = 0.22;

// One arrow of a volley, falling after its delay.
export class FallingArrow extends TimedEffect {
  readonly #x: number;
  readonly #floor: number;
  readonly #delay: number;
  readonly #head: string;

  constructor(x: number, floor: number, delay: number, head: string) {
    super(delay + ARROW_FLIGHT);
    this.#x = x;
    this.#floor = floor;
    this.#delay = delay;
    this.#head = head;
  }

  draw(context: CanvasRenderingContext2D): void {
    const flown = this.progress * (this.#delay + ARROW_FLIGHT) - this.#delay;

    if (flown < 0) return;
    const share = flown / ARROW_FLIGHT;
    const y = -10 + (this.#floor + 10) * share;
    const x = this.#x - (1 - share) * 18;

    context.fillStyle = FX_COLOR.wood;
    line(context, { x: x - 4, y: y - 9 }, { x, y }, 1);
    context.fillStyle = this.#head;
    dot(context, x - 1, y - 1, 2, 2);
  }
}

const HAMMER_ROWS = [
  '..xxxxx..',
  '.xhhhhhx.',
  '.xhhhhhx.',
  '..xxwxx..',
  '....w....',
  '....w....',
  '....w....',
  '....k....',
] as const;
const HAMMER_COLORS: Readonly<Record<string, string>> = {
  x: '#5a4a20',
  h: '#e8b23a',
  w: '#6b4a2e',
  k: '#fff6d6',
};

export class FallingHammer extends TimedEffect {
  readonly #to: Point;

  constructor(to: Point, life: number) {
    super(life);
    this.#to = to;
  }

  draw(context: CanvasRenderingContext2D): void {
    const along = this.progress ** 2;
    const turn = Math.round((1 - along) * 12) / 4;

    context.save();
    context.translate(Math.round(this.#to.x), Math.round(-20 + (this.#to.y + 20) * along));
    context.rotate(turn * Math.PI);
    HAMMER_ROWS.forEach((row, rowIndex) => {
      row.split('').forEach((pixel, column) => {
        const color = HAMMER_COLORS[pixel];

        if (!color) return;
        context.fillStyle = color;
        context.fillRect((column - 4) * 2, (rowIndex - 7) * 2, 2, 2);
      });
    });
    context.restore();
  }
}
