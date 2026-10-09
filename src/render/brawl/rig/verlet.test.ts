import { describe, expect, it } from 'vitest';
import { HUMAN, J, BONES, buildPose } from './skeleton';
import { KNEEL } from './poses';
import { bipedRagdoll, blast, energy, stepRagdoll, type Ragdoll } from './verlet';

const GROUND = 300;
const STEP = 1 / 120;
const build = { ...HUMAN, scale: 1.3 };

function fallen(seconds: number, push?: (body: Ragdoll) => void): Ragdoll {
  const body = bipedRagdoll(build, buildPose(build, KNEEL, 200, GROUND, 1), 1);

  push?.(body);
  for (let t = 0; t < seconds; t += STEP) stepRagdoll(body, STEP, GROUND, 0, 400);

  return body;
}

const boneLength = (body: Ragdoll, a: number, b: number): number => {
  const from = body.points[a];
  const to = body.points[b];

  return from && to ? Math.hypot(to.x - from.x, to.y - from.y) : 0;
};

describe('a two-legged ragdoll', () => {
  it('comes to rest on the floor', () => {
    const body = fallen(4);

    expect(energy(body)).toBeLessThan(0.01);
    for (const p of body.points) expect(p.y).toBeLessThanOrEqual(GROUND);
  });

  it('keeps every bone its length through a blast', () => {
    const body = fallen(3, (rag) => blast(rag, 200, GROUND, 90, 1100, STEP));

    for (const [a, b, key] of BONES) {
      expect(boneLength(body, a, b)).toBeCloseTo(build[key] * build.scale, 0);
    }
  });

  it('flies away from a blast and up off the floor', () => {
    const body = bipedRagdoll(build, buildPose(build, KNEEL, 200, GROUND, 1), 1);

    blast(body, 170, GROUND, 120, 1100, STEP);
    let highest = GROUND;

    for (let t = 0; t < 0.5; t += STEP) {
      stepRagdoll(body, STEP, GROUND, 0, 400);
      highest = Math.min(highest, body.points[J.pelvis]?.y ?? GROUND);
    }

    expect(body.points[J.pelvis]?.x).toBeGreaterThan(220);
    expect(highest).toBeLessThan(GROUND - 40);
  });

  it('stays between the walls', () => {
    const body = fallen(3, (rag) => blast(rag, 390, GROUND, 400, 4000, STEP));

    for (const p of body.points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(400);
    }
  });
});
