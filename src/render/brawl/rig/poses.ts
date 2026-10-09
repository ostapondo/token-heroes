import { Stance } from '@content';
import { clamp01, mix, smooth, type Pose } from './skeleton';

// A swing the body plays: the sword's arc, the bow's draw, a cast, a slam, a leap, a cheer.
export const Move = {
  Sword: 'sword',
  Bow: 'bow',
  Staff: 'staff',
  Stab: 'stab',
  Slam: 'slam',
  Leap: 'leap',
  Cast: 'cast',
  Cheer: 'cheer',
} as const;
export type Move = (typeof Move)[keyof typeof Move];

type Hold = Partial<Pose>;

// Where each stance rests its arms between blows.
const HOLDS: Readonly<Record<Stance, Hold>> = {
  [Stance.Guard]: { uF: 0.1, eF: 0.4, uB: 0.5, eB: 1 },
  [Stance.Blade]: { uF: 0.15, eF: 0.45 },
  [Stance.Archer]: { uF: 0.9, eF: 0.55, uB: 0.35, eB: 1 },
  [Stance.Caster]: { uF: 0.15, eF: 1.3, uB: 0.05, eB: 0.5 },
  [Stance.Brawler]: { uF: 0.9, eF: 1.6, uB: 0.6, eB: 1.8 },
  [Stance.Stalker]: { uF: 0.6, eF: 1, uB: 0.3, eB: 1.2 },
  [Stance.Shambler]: { uF: 1.45, eF: 0.1, uB: 1.35, eB: 0.15, lean: 0.2, head: 0.25 },
  [Stance.Brute]: { uF: 0.35, eF: 0.3, uB: -0.05, eB: 0.3 },
};

type Key = readonly [at: number, pose: Hold];

// Each swing is keyframes over its progress; a part left out keeps the stance.
const SWINGS: Readonly<Record<Move, readonly Key[]>> = {
  sword: [
    [0, {}],
    [0.32, { uF: 2.75, eF: 0.7, lean: -0.08, tF: 0.25, tB: -0.2 }],
    [0.46, { uF: 0.75, eF: 0.05, lean: 0.32, tF: 0.6, kF: 0.5, tB: -0.45 }],
    [0.72, { uF: 0.6, eF: 0.25, lean: 0.2, tF: 0.4, tB: -0.35 }],
    [1, {}],
  ],
  bow: [
    [0, {}],
    [0.2, { uF: 1.5, eF: 0.05, uB: 1.45, eB: 0.2 }],
    [0.56, { uF: 1.55, eF: 0, uB: 1.3, eB: 2.5, lean: -0.06 }],
    [0.64, { uF: 1.55, eF: 0, uB: 1, eB: 0.5 }],
    [1, {}],
  ],
  staff: [
    [0, {}],
    [0.38, { uF: 2.9, eF: 0.3, uB: 2.5, eB: 0.4, lean: -0.14, head: -0.2 }],
    [0.56, { uF: 1.55, eF: 0.1, uB: 1.3, eB: 0.3, lean: 0.28, tF: 0.45, tB: -0.32 }],
    [1, {}],
  ],
  stab: [
    [0, {}],
    [0.35, { uF: -0.5, eF: 1.7, lean: -0.05 }],
    [0.5, { uF: 1.5, eF: 0, lean: 0.32, tF: 0.5, tB: -0.4 }],
    [1, {}],
  ],
  slam: [
    [0, {}],
    [0.45, { uF: 3.05, eF: 0.3, uB: 2.95, eB: 0.4, lean: -0.22, head: -0.25 }],
    [
      0.62,
      { uF: 0.5, eF: 0.1, uB: 0.45, eB: 0.1, lean: 0.6, tF: 0.55, kF: 0.8, tB: -0.4, kB: 0.6 },
    ],
    [0.82, { uF: 0.55, eF: 0.2, uB: 0.5, eB: 0.2, lean: 0.5, tF: 0.5, kF: 0.7, tB: -0.35 }],
    [1, {}],
  ],
  leap: [
    [0, {}],
    [0.25, { tF: 0.9, kF: 1.6, tB: 0.2, kB: 1.4, uF: -0.6, uB: -0.7, lean: 0.4 }],
    [0.5, { uF: 3, eF: 0.4, uB: 2.9, eB: 0.4, tF: 0.6, kF: 1.2, tB: -0.6, kB: 1, lean: -0.1 }],
    [0.66, { uF: 0.6, eF: 0.1, uB: 0.5, eB: 0.2, lean: 0.55, tF: 1.2, kF: 1.6, tB: 0.1, kB: 1.5 }],
    [1, {}],
  ],
  cast: [
    [0, {}],
    [0.35, { uF: 2.9, eF: 0.2, uB: 2.8, eB: 0.2, lean: -0.18, head: -0.3 }],
    [0.55, { uF: 2.5, eF: 0.1, uB: 2.4, eB: 0.1, lean: -0.08 }],
    [1, {}],
  ],
  cheer: [
    [0, {}],
    [0.3, { uF: 2.9, eF: 0.3, uB: 2.7, eB: 0.5, lean: -0.1, head: -0.3 }],
    [0.5, { uF: 2.6, eF: 0.6, uB: 2.9, eB: 0.2 }],
    [0.7, { uF: 2.9, eF: 0.3, uB: 2.7, eB: 0.5 }],
    [1, {}],
  ],
};

// The share of a swing at which its blow lands.
export const LANDS: Readonly<Record<Move, number>> = {
  sword: 0.46,
  bow: 0.6,
  staff: 0.56,
  stab: 0.5,
  slam: 0.62,
  leap: 0.66,
  cast: 0.5,
  cheer: 0.5,
};

export const KNEEL: Pose = {
  lean: 0.5,
  head: -0.3,
  uB: 0.6,
  eB: 0.4,
  uF: 0.9,
  eF: 0.6,
  tB: 0.1,
  kB: 1.6,
  tF: 1.4,
  kF: 1.5,
};

function idle(t: number, hold: Hold): Pose {
  const breath = Math.sin(t * 2.4);
  const base: Pose = {
    lean: 0.05 + 0.02 * breath,
    head: -0.03 * breath,
    uB: -0.18,
    eB: 0.4,
    uF: 0.25,
    eF: 0.55,
    tB: -0.16,
    kB: 0.12,
    tF: 0.18,
    kF: 0.14,
  };
  const held = { ...base, ...hold };

  return { ...held, uF: held.uF + 0.04 * breath, uB: held.uB - 0.03 * breath };
}

function walk(t: number, phase: number, hold: Hold): Pose {
  const q = idle(t, hold);
  const s = Math.sin(phase);
  const c = Math.cos(phase);

  return {
    ...q,
    lean: 0.14,
    tF: 0.5 * s,
    kF: 0.15 + 0.85 * Math.max(0, c),
    tB: -0.5 * s,
    kB: 0.15 + 0.85 * Math.max(0, -c),
    uF: q.uF - 0.3 * s,
    uB: q.uB + 0.4 * s,
  };
}

function keyed(keys: readonly Key[], u: number, base: Pose): Pose {
  let index = 0;

  while (index < keys.length - 2 && u > (keys[index + 1]?.[0] ?? 1)) index += 1;
  const [from, fromPose] = keys[index] ?? [0, {}];
  const [to, toPose] = keys[index + 1] ?? [1, {}];
  const k = smooth(clamp01((u - from) / (to - from)));

  return mix({ ...base, ...fromPose }, { ...base, ...toPose }, k);
}

export interface Motion {
  readonly stance: Stance;
  readonly seed: number;
  readonly phase: number;
  readonly walking: number;
  readonly move: Move | null;
  readonly progress: number;
  readonly flinch: number;
}

// The pose of a standing body at time t: breathing, walking, swinging, and a hit thrown on top.
export function poseOf(motion: Motion, t: number): Pose {
  const hold = HOLDS[motion.stance];
  const base = mix(
    idle(t + motion.seed, hold),
    walk(t + motion.seed, motion.phase, hold),
    motion.walking,
  );
  const q = motion.move ? keyed(SWINGS[motion.move], motion.progress, base) : base;
  const k = motion.flinch;

  if (k <= 0) return q;

  return {
    ...q,
    lean: q.lean - 0.45 * k,
    head: q.head - 0.7 * k,
    uF: q.uF + 0.5 * k,
    uB: q.uB + 0.8 * k,
    eF: q.eF + 0.3 * k,
    eB: q.eB + 0.4 * k,
    kF: q.kF + 0.3 * k,
    kB: q.kB + 0.3 * k,
  };
}
