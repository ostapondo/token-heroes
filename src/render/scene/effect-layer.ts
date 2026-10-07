import type { Effect } from '../fx/effect';
import type { Guarded } from './guarded';

// Effects drawn together at one depth of the scene. One that fails is reported and dropped, so a
// broken effect never takes the frame down with it.
export class EffectLayer {
  readonly #where: string;
  readonly #guard: Guarded;
  #effects: Effect[] = [];

  constructor(where: string, guard: Guarded) {
    this.#where = where;
    this.#guard = guard;
  }

  push(effects: readonly Effect[]): void {
    this.#effects.push(...effects);
  }

  update(dt: number): void {
    this.#effects = this.#effects.filter((effect) =>
      this.#guard.attempt(this.#where, () => effect.update(dt), false),
    );
  }

  draw(context: CanvasRenderingContext2D): void {
    this.#effects = this.#effects.filter((effect) =>
      this.#guard.survives(this.#where, () => effect.draw(context)),
    );
  }
}
