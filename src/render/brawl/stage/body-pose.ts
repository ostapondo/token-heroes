import type { Build, Look } from '@content';
import type { Point } from '../../geometry';
import { BEAST_RIGS, strikeCurve, type BeastState } from '../beasts';
import { KNEEL, poseOf, type Move } from '../rig/poses';
import { buildPose, clamp01, J, lerpPoints, smooth } from '../rig/skeleton';
import type { Wobble } from './wobble';

// What a body's pose depends on this frame.
export interface Posable {
  readonly look: Look;
  readonly build: Build;
  readonly x: number;
  readonly ground: number;
  readonly facing: number;
  readonly scale: number;
  readonly seed: number;
  readonly phase: number;
  readonly walking: number;
  readonly move: Move | null;
  readonly progress: number;
  readonly flinch: number;
  readonly lift: number;
  readonly wobble: Wobble;
}

const SHAKE: readonly (readonly [number, number])[] = [
  [J.head, 1],
  [J.neck, 0.55],
  [J.elbowF, 0.5],
  [J.handF, 1],
  [J.elbowB, 0.45],
  [J.handB, 0.9],
];

export function beastOf(body: Posable): BeastState | null {
  if (body.look.rig !== 'beast') return null;

  return {
    look: body.look,
    x: body.x,
    ground: body.ground,
    facing: body.facing,
    scale: body.scale,
    walking: body.walking,
    phase: body.phase,
    strike: strikeCurve(body.move ? body.progress : null),
    flinch: body.flinch,
    lift: body.lift,
    seed: body.seed,
  };
}

// The standing pose: breathing, walking or swinging, with the hit springs thrown on top.
export function poseBody(body: Posable, t: number): Point[] {
  const { core, limb } = body.wobble;
  const beast = beastOf(body);

  if (beast && body.look.rig === 'beast') {
    const rig = BEAST_RIGS[body.look.form];
    const points = rig.pose(beast, t);
    const head = points[rig.anchors.head];

    if (head)
      points[rig.anchors.head] = {
        x: head.x + core.x * body.scale,
        y: head.y + core.y * body.scale,
      };

    return points;
  }
  if (body.look.rig !== 'biped') return [];
  const motion = { ...body, stance: body.look.stance };
  const points = buildPose(body.build, poseOf(motion, t), body.x, body.ground, body.facing);

  return points.map((point, index) => {
    const share = SHAKE.find(([joint]) => joint === index)?.[1] ?? 0;
    const spring = index === J.head || index === J.neck ? core : limb;

    return {
      x: point.x + spring.x * share * body.scale,
      y: point.y + spring.y * share * body.scale - body.lift,
    };
  });
}

// Getting up: a two-legged body goes from where it lies to a kneel, then to its feet.
export function risingPose(body: Posable, from: readonly Point[], k: number, t: number): Point[] {
  const up = poseBody(body, t);

  if (body.look.rig !== 'biped') return lerpPoints(from, up, smooth(k));
  const kneel = buildPose(body.build, KNEEL, body.x, body.ground, body.facing);

  return k < 0.45
    ? lerpPoints(from, kneel, smooth(k / 0.45))
    : lerpPoints(kneel, up, smooth(clamp01((k - 0.45) / 0.55)));
}
