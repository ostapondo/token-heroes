import { describe, expect, it } from 'vitest';
import { Camera } from './camera';
import { FIELD } from './field';

const framed = (party: number) => {
  const camera = new Camera();
  const frame = { left: 0, zoom: 1, time: 0 };

  camera.frame(frame, party);
  camera.follow(frame, null);

  return { camera, frame };
};

describe('the camera', () => {
  it('holds a lone hero close and pulls back as the party grows', () => {
    expect(framed(1).frame.zoom).toBeCloseTo(1.3);
    expect(framed(14).frame.zoom).toBeCloseTo(0.845);
    expect(framed(7).frame.zoom).toBeLessThan(framed(6).frame.zoom);
  });

  it('keeps the near right corner of the floor where it is', () => {
    for (const party of [1, 6, 14]) {
      const { camera } = framed(party);
      const { x, y, scale } = camera.world;

      expect(x + FIELD.width * scale).toBeCloseTo(FIELD.width);
      expect(y + FIELD.ground * scale).toBeCloseTo(FIELD.ground);
    }
  });

  it('never shrinks the backdrop past its edges', () => {
    for (const party of [1, 6, 14]) {
      const { backdrop } = framed(party).camera;

      expect(backdrop.scale).toBeGreaterThanOrEqual(1);
      expect(backdrop.x).toBeLessThanOrEqual(0);
      expect(backdrop.y).toBeLessThanOrEqual(0);
    }
  });

  it('maps a tap on the screen back to the world', () => {
    const { camera } = framed(10);
    const { x, y, scale } = camera.world;
    const world = camera.toWorld({ x: x + 120 * scale, y: y + 300 * scale });

    expect(world.x).toBeCloseTo(120);
    expect(world.y).toBeCloseTo(300);
  });
});
