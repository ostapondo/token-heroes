import { ARENA } from '../scene/geometry';
import { type Weather, WeatherLayer, type WeatherScene } from './weather';

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
