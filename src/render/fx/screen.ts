import { withAlpha } from '../color';
import { ARENA } from '../scene/geometry';
import { FX_COLOR } from './colors';
import { TimedEffect } from './effect';

export class ScreenFlash extends TimedEffect {
  readonly #color: string;
  readonly #strength: number;

  constructor(color: string, strength: number, life = 0.6) {
    super(life);
    this.#color = color;
    this.#strength = strength;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = withAlpha(this.#color, this.#strength * (1 - this.progress));
    context.fillRect(0, 0, ARENA.width, ARENA.height);
  }
}

const PILLAR = { color: FX_COLOR.gold, width: 14, height: 70 } as const;

export class LightPillar extends TimedEffect {
  readonly #x: number;
  readonly #floor: number;

  constructor(x: number, floor: number) {
    super(1.1);
    this.#x = x;
    this.#floor = floor;
  }

  draw(context: CanvasRenderingContext2D): void {
    const grow = Math.min(this.progress / 0.25, 1);
    const height = PILLAR.height * grow;
    const fade = this.progress < 0.25 ? 1 : 1 - (this.progress - 0.25) / 0.75;
    const gradient = context.createLinearGradient(0, this.#floor, 0, this.#floor - height);

    gradient.addColorStop(0, withAlpha(PILLAR.color, 0.85 * fade));
    gradient.addColorStop(1, withAlpha(PILLAR.color, 0));
    context.fillStyle = gradient;
    context.fillRect(this.#x - PILLAR.width / 2, this.#floor - height, PILLAR.width, height);
  }
}
