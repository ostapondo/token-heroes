type Report = (error: unknown, where: string) => void;

// Runs a step of the frame and reports what fails instead of letting one bad step stop the arena.
export class Guarded {
  readonly #report: Report;

  constructor(report: Report) {
    this.#report = report;
  }

  attempt<T>(where: string, work: () => T, fallback: T): T {
    try {
      return work();
    } catch (error) {
      this.#report(error, where);

      return fallback;
    }
  }

  survives(where: string, work: () => void): boolean {
    return this.attempt(
      where,
      () => {
        work();

        return true;
      },
      false,
    );
  }
}
