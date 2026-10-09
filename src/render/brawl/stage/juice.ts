import type { Point } from '../../geometry';

const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// While time runs slow the world moves at this share of real time; a hit-stop nearly halts it.
const SLOW = 0.35;
const STOP = 0.05;
const PUNCH = { seconds: 0.6, zoom: 0.07 } as const;
const DAMPING = 0.004;

// The feel of a blow: screen shake, slow motion, hit-stop and a quick push of the camera toward
// the last foe of a stage. Reduced motion keeps the slow-down but drops the shake and the push.
export class Juice {
  readonly calm = reducedMotion();
  shake = 0;
  slow = 0;
  stop = 0;
  #punch: (Point & { t: number }) | null = null;

  kick(amount: number): void {
    if (!this.calm) this.shake = Math.max(this.shake, amount);
  }

  hold(seconds: number): void {
    if (!this.calm) this.stop = Math.max(this.stop, seconds);
  }

  slowFor(seconds: number): void {
    this.slow = Math.max(this.slow, seconds);
  }

  punch(at: Point): void {
    if (!this.calm) this.#punch = { x: at.x, y: at.y, t: 0 };
  }

  // The share of real time the world moves this frame.
  rate(): number {
    if (this.stop > 0) return STOP;

    return this.slow > 0 ? SLOW : 1;
  }

  step(real: number): void {
    this.stop = Math.max(0, this.stop - real);
    this.slow = Math.max(0, this.slow - real);
    this.shake *= DAMPING ** real;
    if (this.#punch) {
      this.#punch.t += real;
      if (this.#punch.t > PUNCH.seconds) this.#punch = null;
    }
  }

  applyPunch(ctx: CanvasRenderingContext2D): void {
    const punch = this.#punch;

    if (!punch) return;
    const k = 1 + PUNCH.zoom * Math.max(0, 1 - punch.t / PUNCH.seconds);

    ctx.translate(punch.x, punch.y);
    ctx.scale(k, k);
    ctx.translate(-punch.x, -punch.y);
  }

  jitter(): number {
    return (Math.random() - 0.5) * this.shake;
  }
}
