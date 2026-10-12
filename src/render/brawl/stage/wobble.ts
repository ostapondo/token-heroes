// A standing body's head rides a stiff spring and its hands a looser one, so a blow throws them
// about while the legs keep it up. Only the look moves; the rules never see it.
interface Spring {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const STIFF = { core: [230, 13], limb: [120, 7] } as const;

export class Wobble {
  readonly core: Spring = { x: 0, y: 0, vx: 0, vy: 0 };
  readonly limb: Spring = { x: 0, y: 0, vx: 0, vy: 0 };

  kick(dx: number, dy: number, amount: number): void {
    this.core.vx += dx * amount;
    this.core.vy += dy * amount;
    this.limb.vx += dx * amount * 1.6;
    this.limb.vy += (dy - 0.6) * amount * 1.6;
  }

  step(dt: number): void {
    for (const [spring, [k, damping]] of [
      [this.core, STIFF.core],
      [this.limb, STIFF.limb],
    ] as const) {
      spring.vx += (-k * spring.x - damping * spring.vx) * dt;
      spring.vy += (-k * spring.y - damping * spring.vy) * dt;
      spring.x += spring.vx * dt;
      spring.y += spring.vy * dt;
    }
  }
}
