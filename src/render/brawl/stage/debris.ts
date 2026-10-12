import { random, type Fx } from './fx';
import { heatOf } from './heat';

// What a fight throws up from the floor: flame and rock under a slam, dust under feet, a boss's
// breath, armour shed, and embers on the air.
export function erupt(fx: Fx, x: number, floor: number, color: string): void {
  const { steps } = heatOf(color);

  for (let i = 0; i < 5; i += 1)
    fx.add(
      'fire',
      x + random(-6, 6),
      floor - 2,
      random(-40, 40),
      random(-260, -120),
      random(0.3, 0.6),
      random(4, 8),
      { steps },
    );
  for (let i = 0; i < 2; i += 1)
    fx.add(
      'rock',
      x,
      floor - 3,
      random(-80, 80),
      random(-320, -160),
      random(1.2, 2),
      random(2, 4),
      { floor, hot: true },
    );
  fx.add('smoke', x, floor - 4, random(-15, 15), random(-40, -15), random(0.9, 1.6), random(8, 12));
}

export function dust(fx: Fx, x: number, floor: number): void {
  for (let i = 0; i < 4; i += 1)
    fx.add(
      'dust',
      x + random(-8, 8),
      floor - 2,
      random(-50, 50),
      random(-25, -5),
      random(0.5, 0.9),
      random(4, 7),
    );
}

export function breath(
  fx: Fx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const { steps } = heatOf(color);

  for (let i = 0; i < 26; i += 1) {
    const angle = a + random(-0.25, 0.25);
    const v = random(260, 440);

    fx.add(
      'fire',
      x0,
      y0,
      Math.cos(angle) * v,
      Math.sin(angle) * v,
      random(0.25, 0.5),
      random(4, 9),
      { steps },
    );
  }
}

// A torn-off piece of armour: a hero who starts over sheds the gear its levels earned.
export function shed(fx: Fx, x: number, y: number, tint: string, pieces: number): void {
  for (let i = 0; i < pieces; i += 1)
    fx.add('rock', x, y, random(-120, 120), random(-260, -80), 1.6, random(1.8, 3.2), {
      floor: y + 50,
      color: i % 2 ? '#d5dce6' : tint,
    });
}

// Embers drift up from the floor and fade; the element's accent colours them.
export function ambient(
  fx: Fx,
  left: number,
  width: number,
  floor: number,
  dt: number,
  color: string,
): void {
  if (Math.random() < dt * 6)
    fx.add(
      'ember',
      random(left, width),
      floor + random(0, 40),
      random(-8, 8),
      random(-45, -18),
      random(2.5, 5),
      random(0.8, 1.8),
      { color },
    );
}
