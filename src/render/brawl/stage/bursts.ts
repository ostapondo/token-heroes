import { darken } from '../paint/colors';
import { random, type Fx } from './fx';
import { heatOf } from './heat';

// Bursts spawn particles and rings for one moment of a fight: a blast, a blow, a heal.
export function blast(
  fx: Fx,
  x: number,
  y: number,
  radius: number,
  color: string,
  floor: number,
): void {
  const n = Math.round(radius * 0.5);
  const k = radius / 80;
  const { steps } = heatOf(color);

  for (let i = 0; i < n; i += 1) {
    const a = random(0, Math.PI * 2);
    const v = random(40, 280) * k;

    fx.add(
      'fire',
      x,
      y,
      Math.cos(a) * v,
      Math.sin(a) * v - 60,
      random(0.3, 0.75),
      random(4, 11) * k,
      { steps },
    );
  }
  for (let i = 0; i < n * 0.6; i += 1) {
    const a = random(0, Math.PI * 2);
    const v = random(20, 100);
    const vy = Math.sin(a) * v * 0.4 - random(20, 60);

    fx.add(
      'smoke',
      x + random(-radius, radius) * 0.3,
      y - random(0, radius * 0.3),
      Math.cos(a) * v,
      vy,
      random(1.1, 2.4),
      random(8, 16) * k,
    );
  }
  for (let i = 0; i < n * 0.35; i += 1) {
    const a = random(-Math.PI * 0.95, -Math.PI * 0.05);
    const v = random(160, 440);

    fx.add('rock', x, y - 2, Math.cos(a) * v, Math.sin(a) * v, random(1.6, 2.8), random(1.6, 3.8), {
      floor,
      color: darken(color, 0.25),
      hot: true,
    });
  }
  sparks(fx, x, y, Math.round(n * 0.5));
  fx.ring(x, y, radius, steps[1] ?? '255,200,140');
  fx.flash = Math.min(1, fx.flash + radius / 220);
}

export function sparks(fx: Fx, x: number, y: number, n: number): void {
  for (let i = 0; i < n; i += 1) {
    const a = random(0, Math.PI * 2);
    const v = random(120, 420);

    fx.add('spark', x, y, Math.cos(a) * v, Math.sin(a) * v - 60, random(0.15, 0.5), 1);
  }
}

// A blow lands: a white star, a ring, and chips of whatever the body is made of.
export function impact(
  fx: Fx,
  x: number,
  y: number,
  dir: number,
  chip: string,
  metal: boolean,
  big: boolean,
): void {
  fx.add('star', x, y, 0, 0, big ? 0.16 : 0.11, big ? 17 : 11);
  fx.ring(x, y, big ? 22 : 13, '255,255,255', 0.12);
  if (metal || big) sparks(fx, x, y, big ? 12 : 6);
  for (let i = 0; i < (big ? 9 : 5); i += 1) {
    const a = random(-1.2, 0.3);
    const v = random(80, 220);

    fx.add(
      'chip',
      x,
      y,
      Math.cos(a) * v * dir,
      Math.sin(a) * v - 40,
      random(0.4, 0.8),
      random(1, 2.2),
      { color: chip },
    );
  }
}

export function trail(fx: Fx, x: number, y: number, big: boolean, color: string): void {
  const grow = big ? 2.2 : 1;

  fx.add(
    'fire',
    x + random(-2, 2),
    y + random(-2, 2),
    random(-20, 20),
    random(-30, 10),
    random(0.2, 0.45),
    random(3, 6) * grow,
    { steps: heatOf(color).steps },
  );
  if (Math.random() < 0.3)
    fx.add('smoke', x, y, random(-10, 10), random(-30, -10), random(0.6, 1.2), random(4, 7) * grow);
}

export function mend(fx: Fx, x: number, y: number, color: string): void {
  const { steps } = heatOf(color);

  fx.ring(x, y, 14, steps[1] ?? '255,240,200', 0.05);
  for (let i = 0; i < 10; i += 1)
    fx.add(
      'mote',
      x + random(-12, 12),
      y + random(-6, 16),
      random(-8, 8),
      random(-60, -25),
      random(0.6, 1.1),
      random(1.2, 2.4),
      { steps },
    );
}
