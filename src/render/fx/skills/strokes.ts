import { withAlpha } from '../../color';
import type { Point } from '../../scene/geometry';
import { TimedEffect } from '../effect';
import { between, dot, fadeAfter, jagged, polyline } from './pixels';

const BOLT = { segment: 7, sway: 7, crackles: 22, branchChance: 0.55 } as const;

// A lightning bolt that redraws its path a few times a second so it crackles.
export class Bolt extends TimedEffect {
  readonly #from: Point;
  readonly #to: Point;
  readonly #colors: readonly [glow: string, core: string];
  readonly #width: number;
  #path: Point[] = [];
  #branches: Point[][] = [];
  #age = 0;

  constructor(from: Point, to: Point, colors: readonly [string, string], width = 2, life = 0.38) {
    super(life);
    this.#from = from;
    this.#to = to;
    this.#colors = colors;
    this.#width = width;
    this.#shape();
  }

  #shape(): void {
    const length = Math.hypot(this.#to.x - this.#from.x, this.#to.y - this.#from.y);

    this.#path = jagged(
      this.#from,
      this.#to,
      Math.max(5, Math.round(length / BOLT.segment)),
      BOLT.sway,
    );
    this.#branches = this.#path
      .filter((_, index) => index > 1 && index < this.#path.length - 2 && index % 2 === 0)
      .filter(() => Math.random() < BOLT.branchChance)
      .map((start) =>
        jagged(start, { x: start.x + between(-16, 16), y: start.y + between(6, 18) }, 3, 3),
      );
  }

  override update(dt: number): boolean {
    const before = Math.floor(this.#age * BOLT.crackles);

    this.#age += dt;
    if (Math.floor(this.#age * BOLT.crackles) !== before) this.#shape();

    return super.update(dt);
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;

    if (progress > 0.55 && Math.floor(progress * 30) % 2 === 0) return;
    const [glow, core] = this.#colors;

    context.save();
    context.globalAlpha = fadeAfter(progress, 0.5);
    context.fillStyle = withAlpha(glow, 0.55);
    polyline(context, this.#path, this.#width + 3);
    for (const branch of this.#branches) polyline(context, branch, 2);
    context.fillStyle = core;
    polyline(context, this.#path, this.#width);
    for (const branch of this.#branches) polyline(context, branch, 1);
    context.restore();
  }
}

// A beam along the floor or through a line of foes.
export class Ray extends TimedEffect {
  readonly #y: number;
  readonly #from: number;
  readonly #to: number;
  readonly #colors: readonly [glow: string, core: string];
  readonly #thickness: number;

  constructor(
    y: number,
    from: number,
    to: number,
    colors: readonly [string, string],
    thickness = 4,
  ) {
    super(0.45);
    this.#y = y;
    this.#from = from;
    this.#to = to;
    this.#colors = colors;
    this.#thickness = thickness;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;
    const reach = this.#from + (this.#to - this.#from) * Math.min(1, progress / 0.25);
    const half = Math.max(
      1,
      Math.round(this.#thickness * (progress < 0.25 ? 1 : 1 - (progress - 0.25))),
    );
    const [glow, core] = this.#colors;

    context.save();
    context.globalAlpha = fadeAfter(progress, 0.5);
    context.fillStyle = withAlpha(glow, 0.6);
    context.fillRect(this.#from, this.#y - half - 1, reach - this.#from, half * 2 + 2);
    context.fillStyle = core;
    context.fillRect(
      this.#from,
      this.#y - Math.ceil(half / 2),
      reach - this.#from,
      Math.ceil(half / 2) * 2,
    );
    context.restore();
  }
}

// The aiming line of a charged shot, blinking faster as the shot nears.
export class AimLine extends TimedEffect {
  readonly #from: () => Point;
  readonly #to: () => Point;
  readonly #color: string;

  constructor(from: () => Point, to: () => Point, color: string, life: number) {
    super(life);
    this.#from = from;
    this.#to = to;
    this.#color = color;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { progress } = this;

    if (progress > 0.75 && Math.floor(progress * 40) % 2 === 1) return;
    const from = this.#from();
    const to = this.#to();
    const steps = Math.max(1, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / 3));

    context.save();
    context.fillStyle = withAlpha(this.#color, 0.35 + progress * 0.65);
    for (let step = 0; step < steps; step += 1) {
      if ((step + Math.floor(progress * 30)) % 3 === 0) continue;
      dot(
        context,
        from.x + ((to.x - from.x) * step) / steps,
        from.y + ((to.y - from.y) * step) / steps,
      );
    }
    context.restore();
  }
}
