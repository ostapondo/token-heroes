interface Pending {
  readonly at: number;
  readonly run: () => void;
}

// Things the director shows a moment after the rules decide them: a number when the arrow lands,
// a body thrown when the meteor hits.
export class Later {
  #now = 0;
  #queue: Pending[] = [];

  get now(): number {
    return this.#now;
  }

  after(delay: number, run: () => void): void {
    if (delay <= 0) run();
    else this.#queue.push({ at: this.#now + delay, run });
  }

  step(dt: number): void {
    this.#now += dt;
    const due = this.#queue.filter((pending) => pending.at <= this.#now);

    this.#queue = this.#queue.filter((pending) => pending.at > this.#now);
    for (const pending of due) pending.run();
  }

  clear(): void {
    this.#queue = [];
  }
}
