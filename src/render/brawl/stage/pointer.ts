import type { Point } from '../../geometry';
import type { Body } from './body';
import { FIELD } from './field';
import type { Scene } from './scene';

// A press this close to a fallen joint picks the body up; a tap this close to a foe strikes it.
const GRAB_REACH = 18;
const STRIKE_REACH = 120;
// A quick tap on a fallen body, shorter and stiller than these, boots it instead of lifting it.
const TAP = { ms: 250, moved: 6 } as const;

// The player's hand in the arena: a tap strikes the nearest foe, a press on a fallen body picks it
// up to throw.
export class Pointer {
  readonly #canvas: HTMLCanvasElement;
  readonly #scene: Scene;
  readonly #strike: (foe: number) => void;
  #lastMove = 0;
  #attached = false;

  constructor(canvas: HTMLCanvasElement, scene: Scene, strike: (foe: number) => void) {
    this.#canvas = canvas;
    this.#scene = scene;
    this.#strike = strike;
  }

  attach(): void {
    if (this.#attached) return;
    this.#attached = true;
    this.#canvas.addEventListener('pointerdown', this.#down);
    this.#canvas.addEventListener('pointermove', this.#move);
    this.#canvas.addEventListener('pointerup', this.#release);
    this.#canvas.addEventListener('pointercancel', this.#release);
  }

  detach(): void {
    this.#attached = false;
    this.#canvas.removeEventListener('pointerdown', this.#down);
    this.#canvas.removeEventListener('pointermove', this.#move);
    this.#canvas.removeEventListener('pointerup', this.#release);
    this.#canvas.removeEventListener('pointercancel', this.#release);
  }

  #toWorld(event: PointerEvent): Point {
    const rect = this.#canvas.getBoundingClientRect();
    const screen = {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };

    return this.#scene.camera.toWorld(screen);
  }

  readonly #down = (event: PointerEvent): void => {
    const at = this.#toWorld(event);
    const { world } = this.#scene;
    const held = this.#nearestJoint(at);

    if (held) {
      world.grab = { ...held, from: at, at: performance.now(), x: at.x, y: at.y, vx: 0, vy: 0 };
      held.body.deadFor = Math.min(held.body.deadFor, 1);
      this.#lastMove = performance.now();
      this.#canvas.setPointerCapture(event.pointerId);

      return;
    }
    const foe = this.#nearestFoe(at);

    if (foe !== null) this.#strike(foe);
  };

  #nearestJoint(at: Point): { body: Body; index: number } | null {
    let found: { body: Body; index: number } | null = null;
    let nearest = GRAB_REACH;

    for (const body of this.#scene.world.cast.all) {
      if (!body.ragdoll || body.alpha <= 0) continue;
      for (const [index, point] of body.points.entries()) {
        const d = Math.hypot(point.x - at.x, point.y - at.y);

        if (d < nearest) {
          nearest = d;
          found = { body, index };
        }
      }
    }

    return found;
  }

  #nearestFoe(at: Point): number | null {
    const { world } = this.#scene;
    let found: number | null = null;
    let nearest = STRIKE_REACH;

    world.cast.foes.forEach((body, index) => {
      if (body.dead || (world.ruleFoe(index)?.hp ?? 0) <= 0) return;
      const d = Math.hypot(body.center.x - at.x, (body.center.y - at.y) * 0.7);

      if (d < nearest) {
        nearest = d;
        found = index;
      }
    });

    return found;
  }

  readonly #move = (event: PointerEvent): void => {
    const grab = this.#scene.world.grab;

    if (!grab) return;
    if (!grab.body.ragdoll) {
      this.#scene.world.grab = null;

      return;
    }
    const at = this.#toWorld(event);
    const now = performance.now();
    const dt = Math.max(0.008, (now - this.#lastMove) / 1000);

    this.#lastMove = now;
    grab.vx = grab.vx * 0.4 + ((at.x - grab.x) / dt) * 0.6;
    grab.vy = grab.vy * 0.4 + ((at.y - grab.y) / dt) * 0.6;
    grab.x = at.x;
    grab.y = Math.min(at.y, grab.body.ground - 2);
  };

  readonly #release = (): void => {
    const { world } = this.#scene;
    const grab = world.grab;

    world.grab = null;
    if (!grab?.body.ragdoll) return;
    const still = Math.hypot(grab.x - grab.from.x, grab.y - grab.from.y) <= TAP.moved;

    if (still && performance.now() - grab.at <= TAP.ms)
      grab.body.launch(
        grab.from.x + (Math.random() - 0.5) * 8,
        grab.from.y + 10,
        30 * grab.body.scale,
        1100,
      );
  };
}
