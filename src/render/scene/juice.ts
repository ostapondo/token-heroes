import type { Effect } from '../fx/effect';
import type { Reaction } from '../fx/reaction';
import { ScreenFlash } from '../fx/screen';

const SHAKE_DECAY = 18;
// One screen-wide beat per this many seconds; any other in that window stays on its foe.
const BEAT_GAP = 1.2;
const LOCAL_SHAKE = 1.5;
const FLASH = { strength: 0.45, life: 0.18, reduced: 0.3 } as const;

const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Screen shake, hit-stop and flashes for a whole party of skills: a full party casts about once a
// second, so only the first big blow in a window may flash and hold the screen.
export class Juice {
  #shake = 0;
  #hitstop = 0;
  #lastBeat = -Infinity;
  #clock = 0;

  get shake(): number {
    return this.#shake;
  }

  // The time the world moves this frame; nothing moves while a blow holds the screen still.
  advance(dt: number): number {
    this.#clock += dt;
    this.#shake = Math.max(0, this.#shake - dt * SHAKE_DECAY);
    if (this.#hitstop <= 0) return dt;
    this.#hitstop -= dt;

    return 0;
  }

  apply(reaction: Reaction): Effect[] {
    const reduced = reducedMotion();
    const beat = reaction.beat;
    const granted = beat !== undefined && this.#clock - this.#lastBeat >= BEAT_GAP;

    if (!granted) {
      if (!reduced)
        this.#shake = Math.max(
          this.#shake,
          beat ? Math.min(reaction.shake, LOCAL_SHAKE) : reaction.shake,
        );

      return [];
    }
    this.#lastBeat = this.#clock;
    if (!reduced) {
      this.#shake = Math.max(this.#shake, reaction.shake);
      this.#hitstop = Math.max(this.#hitstop, beat.hitstop);
    }

    return [
      new ScreenFlash(
        beat.flash,
        reduced ? FLASH.strength * FLASH.reduced : FLASH.strength,
        FLASH.life,
      ),
    ];
  }
}
