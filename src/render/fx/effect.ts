export interface Effect {
  update(dt: number): boolean;
  draw(context: CanvasRenderingContext2D): void;
}

export abstract class TimedEffect implements Effect {
  readonly #life: number;
  #age = 0;

  constructor(life: number) {
    this.#life = life;
  }

  protected get progress(): number {
    return Math.min(this.#age / this.#life, 1);
  }

  update(dt: number): boolean {
    this.#age += dt;
    return this.#age < this.#life;
  }

  abstract draw(context: CanvasRenderingContext2D): void;
}

export const PIXEL_FONT = '"Jersey 10", monospace';
