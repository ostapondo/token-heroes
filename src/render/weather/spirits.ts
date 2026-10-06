import { withAlpha } from '../color';
import { ARENA } from '../scene/geometry';
import { type Weather, WeatherLayer, type WeatherScene, randomBetween } from './weather';

const STRIKE_GAP: readonly [number, number] = [2.5, 4.5];
const FLASH_PATTERN = [0.06, 0.06, 0.06] as const;
const BOLT = { color: '#fff7b0', flash: '#e6f0ff', segments: 6, sway: 8 } as const;

export class Lightning implements Weather {
  readonly layer = WeatherLayer.Front;
  #untilStrike = randomBetween(...STRIKE_GAP);
  #flashTime = -1;
  #bolt: readonly number[] = [];

  update(dt: number): void {
    if (this.#flashTime >= 0) {
      this.#flashTime += dt;
      if (this.#flashTime > FLASH_PATTERN.reduce((sum, part) => sum + part, 0))
        this.#flashTime = -1;

      return;
    }
    this.#untilStrike -= dt;
    if (this.#untilStrike > 0) return;
    this.#untilStrike = randomBetween(...STRIKE_GAP);
    this.#flashTime = 0;
    const start = randomBetween(40, ARENA.width - 40);

    this.#bolt = Array.from({ length: BOLT.segments + 1 }, (_, step) =>
      step === 0 ? start : start + randomBetween(-BOLT.sway, BOLT.sway),
    );
  }

  draw(context: CanvasRenderingContext2D): void {
    if (!this.#lit()) return;
    context.fillStyle = withAlpha(BOLT.flash, 0.3);
    context.fillRect(0, 0, ARENA.width, ARENA.height);
    context.strokeStyle = BOLT.color;
    context.lineWidth = 2;
    context.beginPath();
    const stepHeight = (ARENA.height * 0.7) / BOLT.segments;

    this.#bolt.forEach((x, step) => {
      if (step === 0) context.moveTo(x, 0);
      else context.lineTo(x, step * stepHeight);
    });
    context.stroke();
  }

  #lit(): boolean {
    const [on, off] = FLASH_PATTERN;

    return this.#flashTime >= 0 && (this.#flashTime < on || this.#flashTime > on + off);
  }
}

const FLAME_OFFSETS = [-46, 44] as const;
const FLAME = { body: '#52e0c4', core: '#d6fff5', flicker: 0.25 } as const;

export class GhostFlames implements Weather {
  readonly layer = WeatherLayer.Back;
  #time = 0;

  update(dt: number): void {
    this.#time += dt;
  }

  draw(context: CanvasRenderingContext2D, scene: WeatherScene): void {
    const tall = Math.floor(this.#time / FLAME.flicker) % 2 === 0;

    for (const offset of FLAME_OFFSETS) {
      const x = Math.round(scene.focus.x + offset);
      const height = tall ? 8 : 6;
      const base = scene.focus.y;

      context.fillStyle = FLAME.body;
      context.fillRect(x, base - height, 4, height);
      context.fillRect(x + 1, base - height - 2, 2, 2);
      context.fillStyle = FLAME.core;
      context.fillRect(x + 1, base - 4, 2, 3);
    }
  }
}
