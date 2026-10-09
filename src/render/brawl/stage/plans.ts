import type { Body } from './body';
import { FIELD } from './field';
import type { Goal } from './steering';

// Where a standing body is headed and whom it faces; the lane is its own depth when it has no foe
// to ring.
export interface Plan {
  goal: Goal | null;
  faceX: number | null;
  readonly lane: number;
  side: number;
  ringOf: number;
  reach: number;
}

export class Plans {
  readonly #plans = new WeakMap<Body, Plan>();

  of(body: Body): Plan {
    let plan = this.#plans.get(body);

    if (!plan) {
      plan = {
        goal: null,
        faceX: null,
        lane: 0.1 + Math.random() * 0.8,
        side: body.x < FIELD.width / 2 ? -1 : 1,
        ringOf: -1,
        reach: 0,
      };
      this.#plans.set(body, plan);
    }

    return plan;
  }
}
