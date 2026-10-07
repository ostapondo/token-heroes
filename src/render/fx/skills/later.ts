import type { Effect } from '../effect';

// Effects that start after a delay, such as the blast of a meteor still falling.
export class Later implements Effect {
  readonly #start: () => readonly Effect[];
  #wait: number;
  #effects: Effect[] | null = null;

  constructor(delay: number, start: () => readonly Effect[]) {
    this.#wait = delay;
    this.#start = start;
  }

  update(dt: number): boolean {
    if (this.#effects === null) {
      this.#wait -= dt;
      if (this.#wait > 0) return true;
      this.#effects = [...this.#start()];
    }
    this.#effects = this.#effects.filter((effect) => effect.update(dt));

    return this.#effects.length > 0;
  }

  draw(context: CanvasRenderingContext2D): void {
    for (const effect of this.#effects ?? []) effect.draw(context);
  }
}
