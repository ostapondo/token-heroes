import { DeathKind } from '@content';
import type { Actor } from '../../scene/cast';
import { bodyOf } from './body';
import { ash, bones, melt } from './crumbled-deaths';
import type { Demise, DemiseScene } from './demise';
import { drain, shock, sink } from './fallen-deaths';
import { clip, context } from './taken-deaths';
import type { DemiseMoment } from './timing';
import { gold, ice, stone } from './turned-deaths';

const DEMISES: Readonly<Record<DeathKind, Demise>> = {
  [DeathKind.Ash]: ash,
  [DeathKind.Ice]: ice,
  [DeathKind.Stone]: stone,
  [DeathKind.Shock]: shock,
  [DeathKind.Melt]: melt,
  [DeathKind.Bones]: bones,
  [DeathKind.Drain]: drain,
  [DeathKind.Gold]: gold,
  [DeathKind.Sink]: sink,
  [DeathKind.Context]: context,
  [DeathKind.Clip]: clip,
};

export function paintDemise(
  canvas: CanvasRenderingContext2D,
  actor: Actor,
  kind: DeathKind,
  moment: Exclude<DemiseMoment, { stage: 'standing' }>,
  scene: DemiseScene,
): void {
  const demise = DEMISES[kind];
  const body = bodyOf(actor);

  canvas.save();
  if (moment.stage === 'dying') demise.dying(canvas, body, moment.progress, scene);
  else demise.down(canvas, body, scene);
  canvas.restore();
}

export type { DemiseScene } from './demise';
export { demiseMoment } from './timing';
