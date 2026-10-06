import { ARENA, floorTop } from '../scene/geometry';
import { type Weather, WeatherLayer, type WeatherScene } from './weather';

const LAVA = { surface: '#e0451a', rim: '#ffb02e', crust: '#3a1408', bubble: '#ffd36a' } as const;
const CRUSTS = [
  [6, 12, 20, 4],
  [70, 22, 30, 5],
  [140, 10, 18, 4],
] as const;
const BUBBLES = [18, 52, 96, 128, 166] as const;
const BUBBLE_CYCLE = 1.6;

export class LavaFloor implements Weather {
  readonly layer = WeatherLayer.Back;
  #time = 0;

  update(dt: number): void {
    this.#time += dt;
  }

  draw(context: CanvasRenderingContext2D): void {
    const top = floorTop();

    context.fillStyle = LAVA.surface;
    context.fillRect(0, top, ARENA.width, ARENA.floorHeight);
    context.fillStyle = LAVA.rim;
    context.fillRect(0, top, ARENA.width, 1);
    context.fillStyle = LAVA.crust;
    for (const [x, depth, width, height] of CRUSTS) context.fillRect(x, top + depth, width, height);

    context.fillStyle = LAVA.bubble;
    BUBBLES.forEach((x, index) => {
      const phase = ((this.#time + index * 0.37) % BUBBLE_CYCLE) / BUBBLE_CYCLE;

      if (phase > 0.6) return;
      const size = Math.ceil(phase * 5);

      context.fillRect(x, top + 6 + (index % 3) * 7 - size, size, size);
    });
  }
}

const ICICLES = [
  [0, 9],
  [3, 4],
  [6, 6],
  [9, 3],
  [12, 2],
] as const;
const FROST = { ice: '#bfeaff', shine: '#ffffff' } as const;

export class FrostEdges implements Weather {
  readonly layer = WeatherLayer.Back;

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = FROST.ice;
    context.fillRect(0, 0, ARENA.width, 1);
    for (const [offset, length] of ICICLES) {
      context.fillRect(offset, 1, 1, length);
      context.fillRect(ARENA.width - 1 - offset, 1, 1, length);
    }
    context.fillStyle = FROST.shine;
    context.fillRect(3, 4, 1, 1);
    context.fillRect(ARENA.width - 4, 4, 1, 1);
  }
}

export class SummoningRing implements Weather {
  readonly layer = WeatherLayer.Back;
  #offset = 0;

  update(dt: number): void {
    this.#offset -= dt * 18;
  }

  draw(context: CanvasRenderingContext2D, scene: WeatherScene): void {
    context.save();
    context.lineWidth = 2;
    context.setLineDash([6, 3]);
    context.lineDashOffset = this.#offset;
    context.strokeStyle = '#e0252f';
    context.beginPath();
    context.ellipse(scene.focus.x, scene.focus.y, 38, 8, 0, 0, Math.PI * 2);
    context.stroke();
    context.lineWidth = 1;
    context.setLineDash([2, 4]);
    context.lineDashOffset = -this.#offset;
    context.strokeStyle = '#ff7a3d';
    context.beginPath();
    context.ellipse(scene.focus.x, scene.focus.y, 28, 5, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
}
