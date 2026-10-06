import type { Point } from '../scene/geometry';

export const WeatherLayer = { Back: 'back', Front: 'front' } as const;
export type WeatherLayer = (typeof WeatherLayer)[keyof typeof WeatherLayer];

export interface WeatherScene {
  readonly focus: Point;
}

export interface Weather {
  readonly layer: WeatherLayer;
  update?(dt: number): void;
  draw(context: CanvasRenderingContext2D, scene: WeatherScene): void;
}

export const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);
