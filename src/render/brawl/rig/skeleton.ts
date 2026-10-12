import type { Build } from '@content';
import type { Point } from '../../geometry';

// B is the far limb, drawn behind the torso; F is the near one.
export const J = {
  head: 0,
  neck: 1,
  pelvis: 2,
  elbowB: 3,
  handB: 4,
  elbowF: 5,
  handF: 6,
  kneeB: 7,
  footB: 8,
  kneeF: 9,
  footF: 10,
} as const;

type Length = 'neck' | 'torso' | 'upper' | 'fore' | 'thigh' | 'shin';

export const BONES: readonly (readonly [number, number, Length])[] = [
  [J.head, J.neck, 'neck'],
  [J.neck, J.pelvis, 'torso'],
  [J.neck, J.elbowB, 'upper'],
  [J.elbowB, J.handB, 'fore'],
  [J.neck, J.elbowF, 'upper'],
  [J.elbowF, J.handF, 'fore'],
  [J.pelvis, J.kneeB, 'thigh'],
  [J.kneeB, J.footB, 'shin'],
  [J.pelvis, J.kneeF, 'thigh'],
  [J.kneeF, J.footF, 'shin'],
];

// Joint angles, measured from straight down and positive toward the way the body faces.
export interface Pose {
  readonly lean: number;
  readonly head: number;
  readonly uB: number;
  readonly eB: number;
  readonly uF: number;
  readonly eF: number;
  readonly tB: number;
  readonly kB: number;
  readonly tF: number;
  readonly kF: number;
}

export const HUMAN: Build = {
  scale: 1,
  head: 6.5,
  neck: 8,
  torso: 16,
  upper: 10,
  fore: 9.5,
  thigh: 11.5,
  shin: 11.5,
  shoulders: 6.5,
  hips: 5.2,
  arm: 3.2,
  forearm: 2.8,
  leg: 3.8,
  calf: 3.2,
};
export const FOOT = 2.4;

export const smooth = (k: number): number => k * k * (3 - 2 * k);
export const clamp01 = (k: number): number => Math.min(1, Math.max(0, k));

export function mix(from: Pose, to: Pose, k: number): Pose {
  const at = (a: number, b: number): number => a + (b - a) * k;

  return {
    lean: at(from.lean, to.lean),
    head: at(from.head, to.head),
    uB: at(from.uB, to.uB),
    eB: at(from.eB, to.eB),
    uF: at(from.uF, to.uF),
    eF: at(from.eF, to.eF),
    tB: at(from.tB, to.tB),
    kB: at(from.kB, to.kB),
    tF: at(from.tF, to.tF),
    kF: at(from.kF, to.kF),
  };
}

const segment = (from: Point, angle: number, length: number, facing: number): Point => ({
  x: from.x + Math.sin(angle) * length * facing,
  y: from.y + Math.cos(angle) * length,
});

// Lays the joints out from the pelvis and stands the lower foot on the ground.
export function buildPose(
  build: Build,
  q: Pose,
  x: number,
  ground: number,
  facing: number,
): Point[] {
  const s = build.scale;
  const origin = { x: 0, y: 0 };
  const neck = segment(origin, Math.PI - q.lean, build.torso * s, facing);
  const head = segment(neck, Math.PI - q.lean - q.head, build.neck * s, facing);
  const elbowB = segment(neck, q.uB, build.upper * s, facing);
  const handB = segment(elbowB, q.uB + q.eB, build.fore * s, facing);
  const elbowF = segment(neck, q.uF, build.upper * s, facing);
  const handF = segment(elbowF, q.uF + q.eF, build.fore * s, facing);
  const kneeB = segment(origin, q.tB, build.thigh * s, facing);
  const footB = segment(kneeB, q.tB - q.kB, build.shin * s, facing);
  const kneeF = segment(origin, q.tF, build.thigh * s, facing);
  const footF = segment(kneeF, q.tF - q.kF, build.shin * s, facing);
  const dy = ground - FOOT * s - Math.max(footB.y, footF.y);

  return [head, neck, origin, elbowB, handB, elbowF, handF, kneeB, footB, kneeF, footF].map(
    (point) => ({ x: point.x + x, y: point.y + dy }),
  );
}

export const lerpPoints = (from: readonly Point[], to: readonly Point[], k: number): Point[] =>
  from.map((point, index) => {
    const target = to[index] ?? point;

    return { x: point.x + (target.x - point.x) * k, y: point.y + (target.y - point.y) * k };
  });
