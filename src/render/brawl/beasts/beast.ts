import type { BeastLook } from '@content';
import type { Point } from '../../geometry';
import type { Kit } from '../paint/kit';
import type { Ragdoll } from '../rig/verlet';

// Which joints stand for the body's centre, its top, its head and the point it strikes with.
interface Anchors {
  readonly center: number;
  readonly top: number;
  readonly head: number;
  readonly hand: number;
}

// A beast between blows: where it stands, how it moves, and how far through a strike it is.
export interface BeastState {
  readonly look: BeastLook;
  readonly x: number;
  readonly ground: number;
  readonly facing: number;
  readonly scale: number;
  readonly walking: number;
  readonly phase: number;
  readonly strike: number;
  readonly flinch: number;
  readonly lift: number;
  readonly seed: number;
}

export interface BeastRig {
  readonly anchors: Anchors;
  pose: (state: BeastState, t: number) => Point[];
  ragdoll: (points: readonly Point[], state: BeastState) => Ragdoll;
  paint: (kit: Kit, state: BeastState, points: readonly Point[]) => void;
}

// The curve every strike follows: draw back, snap forward on the blow, settle.
export function strikeCurve(progress: number | null): number {
  if (progress === null) return 0;
  if (progress < 0.4) return -0.35 * (progress / 0.4);
  if (progress < 0.55) return -0.35 + 1.35 * ((progress - 0.4) / 0.15);

  return Math.max(0, 1 - (progress - 0.55) / 0.35);
}

export const lifted = (points: Point[], lift: number): Point[] =>
  lift ? points.map((point) => ({ x: point.x, y: point.y - lift })) : points;

export const pick = (points: readonly Point[], index: number): Point =>
  points[index] ?? { x: 0, y: 0 };
