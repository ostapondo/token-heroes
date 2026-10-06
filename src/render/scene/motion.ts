export const MotionCue = {
  Flash: 'flash',
  Dash: 'dash',
  Lunge: 'lunge',
  Hop: 'hop',
  Hurt: 'hurt',
  Dying: 'dying',
  Entering: 'entering',
  Glow: 'glow',
} as const;
type MotionCue = (typeof MotionCue)[keyof typeof MotionCue];

const DURATION: Readonly<Record<MotionCue, number>> = {
  [MotionCue.Flash]: 0.32,
  [MotionCue.Dash]: 0.45,
  [MotionCue.Lunge]: 0.5,
  [MotionCue.Hop]: 0.3,
  [MotionCue.Hurt]: 0.5,
  [MotionCue.Dying]: 1.2,
  [MotionCue.Entering]: 0.5,
  [MotionCue.Glow]: 0.6,
};

const REACH = { dash: 64, lunge: 70, hop: 8, knockback: 5, enterDrop: 120 } as const;
const BOB_PERIOD = 1;
const SWING_PEAK = 0.4;

export class Motion {
  readonly #left = new Map<MotionCue, number>();
  #time = Math.random() * BOB_PERIOD;

  cue(cue: MotionCue): void {
    this.#left.set(cue, DURATION[cue]);
  }

  update(dt: number): void {
    this.#time += dt;
    for (const [cue, left] of this.#left) {
      if (left <= dt) this.#left.delete(cue);
      else this.#left.set(cue, left - dt);
    }
  }

  offset(facing: 1 | -1): { x: number; y: number } {
    const bob = Math.floor((this.#time % BOB_PERIOD) * 2) === 0 ? 0 : -1;
    const x =
      (this.#swing(MotionCue.Dash) * REACH.dash +
        this.#swing(MotionCue.Lunge) * REACH.lunge +
        this.#swing(MotionCue.Hop) * REACH.hop -
        this.#fraction(MotionCue.Flash) * REACH.knockback) *
      facing;
    const y = bob - this.#fraction(MotionCue.Entering) * REACH.enterDrop;

    return { x: Math.round(x), y: Math.round(y) };
  }

  get flashing(): boolean {
    return this.#fraction(MotionCue.Flash) > 0.4;
  }

  get hurting(): boolean {
    return this.#blinking(MotionCue.Hurt, 8);
  }

  get glowing(): boolean {
    return this.#blinking(MotionCue.Glow, 10);
  }

  get fade(): number {
    return this.#left.has(MotionCue.Dying) ? this.#fraction(MotionCue.Dying) : 1;
  }

  #fraction(cue: MotionCue): number {
    return (this.#left.get(cue) ?? 0) / DURATION[cue];
  }

  #blinking(cue: MotionCue, rate: number): boolean {
    return Math.floor((this.#left.get(cue) ?? 0) * rate) % 2 === 1;
  }

  #swing(cue: MotionCue): number {
    if (!this.#left.has(cue)) return 0;
    const progress = 1 - this.#fraction(cue);

    return progress < SWING_PEAK ? progress / SWING_PEAK : (1 - progress) / (1 - SWING_PEAK);
  }
}
