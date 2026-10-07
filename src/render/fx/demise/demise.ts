import type { Point } from '../../scene/geometry';
import type { Body } from './body';

export interface DemiseScene {
  // Where a death that streams away goes: the foe that dealt the blow.
  readonly target: Point;
  readonly accent: string;
  readonly time: number;
}

export interface Demise {
  dying(context: CanvasRenderingContext2D, body: Body, progress: number, scene: DemiseScene): void;
  down(context: CanvasRenderingContext2D, body: Body, scene: DemiseScene): void;
}
