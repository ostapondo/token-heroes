import { withAlpha } from '../color';
import { ARENA, floorTop } from '../scene/geometry';
import { type Weather, WeatherLayer, type WeatherScene } from './weather';

export class Glow implements Weather {
  readonly layer = WeatherLayer.Back;
  readonly #color: string;
  #time = 0;

  constructor(color: string) {
    this.#color = color;
  }

  update(dt: number): void {
    this.#time += dt;
  }

  draw(context: CanvasRenderingContext2D, scene: WeatherScene): void {
    const strength = 0.4 + Math.sin(this.#time * 4) * 0.12;
    const { x } = scene.focus;
    const gradient = context.createRadialGradient(x, ARENA.height, 4, x, ARENA.height, 120);

    gradient.addColorStop(0, withAlpha(this.#color, strength));
    gradient.addColorStop(1, withAlpha(this.#color, 0));
    context.fillStyle = gradient;
    context.fillRect(0, 0, ARENA.width, ARENA.height);
  }
}

export class Fog implements Weather {
  readonly layer = WeatherLayer.Front;
  readonly #color: string;
  #time = 0;

  constructor(color: string) {
    this.#color = color;
  }

  update(dt: number): void {
    this.#time += dt;
  }

  draw(context: CanvasRenderingContext2D): void {
    const drift = Math.sin(this.#time * 0.5) * 14;

    context.fillStyle = withAlpha(this.#color, 0.12);
    context.fillRect(drift - 20, floorTop() - 8, ARENA.width + 40, 18);
    context.fillStyle = withAlpha(this.#color, 0.08);
    context.fillRect(-drift - 30, floorTop() - 22, ARENA.width + 60, 10);
  }
}

export class Pulse implements Weather {
  readonly layer = WeatherLayer.Front;
  readonly #color: string;
  #time = 0;

  constructor(color: string) {
    this.#color = color;
  }

  update(dt: number): void {
    this.#time += dt;
  }

  draw(context: CanvasRenderingContext2D): void {
    const strength = 0.35 + Math.sin(this.#time * 2.6) * 0.25;
    const { width, height } = ARENA;
    const middle = { x: width / 2, y: height / 2 };
    const gradient = context.createRadialGradient(
      middle.x,
      middle.y,
      height * 0.35,
      middle.x,
      middle.y,
      width * 0.75,
    );

    gradient.addColorStop(0, withAlpha(this.#color, 0));
    gradient.addColorStop(1, withAlpha(this.#color, strength));
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
}
