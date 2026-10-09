import type { Build, Look, Palette } from '@content';
import type { Point } from '../../geometry';
import { BEAST_RIGS, strikeCurve, type BeastRig, type BeastState } from '../beasts';
import { beastOf, poseBody, risingPose } from './body-pose';
import type { Mood } from '../paint/painter';
import type { Move } from '../rig/poses';
import { HUMAN, J } from '../rig/skeleton';
import { bipedRagdoll, blast, energy, stepRagdoll, type Pin, type Ragdoll } from '../rig/verlet';
import { Wardrobe } from './cloth-sim';
import { depthScale, FIELD, groundAt, MODEL_SCALE, type Frame } from './field';
import { Wobble } from './wobble';

const RISE = 0.8;
const BIPED = { center: J.pelvis, top: J.neck, head: J.head, hand: J.handF } as const;

export interface BodyInit {
  readonly look: Look;
  readonly palette: Palette;
  readonly tint?: string | undefined;
  readonly hero: boolean;
  readonly boss: boolean;
  readonly x: number;
  readonly z: number;
  readonly facing: number;
}

// A body on the floor: one model, standing on its pose or falling as a ragdoll. Where it walks is
// the director's call; when it may stand up again is the rules'.
export class Body {
  readonly look: Look;
  readonly palette: Palette;
  readonly tint: string | undefined;
  readonly hero: boolean;
  readonly boss: boolean;
  readonly seed = Math.random() * 9;
  readonly wobble = new Wobble();
  x: number;
  z: number;
  facing: number;
  ground = 0;
  scale = 1;
  build: Build = HUMAN;
  points: Point[] = [];
  ragdoll: Ragdoll | null = null;
  state: 'stand' | 'rag' | 'rise' = 'stand';
  walking = 0;
  phase = Math.random() * 6;
  move: Move | null = null;
  progress = 0;
  duration = 1;
  flinch = 0;
  flash = 0;
  lift = 0;
  kx = 0;
  vx = 0;
  vz = 0;
  tier = 0;
  alpha = 1;
  disarmed = false;
  dead = false;
  deadFor = 0;
  mayRise = true;
  asleep = false;
  downFor = 0;
  cheering = false;
  lastHurt = -9;
  #riseFor = 0;
  #from: Point[] = [];
  readonly #wardrobe = new Wardrobe();

  constructor(init: BodyInit) {
    this.look = init.look;
    this.palette = init.palette;
    this.tint = init.tint;
    this.hero = init.hero;
    this.boss = init.boss;
    this.x = init.x;
    this.z = init.z;
    this.facing = init.facing;
    this.place();
    this.points = this.pose(0);
  }

  get rig(): BeastRig | null {
    return this.look.rig === 'beast' ? BEAST_RIGS[this.look.form] : null;
  }

  get anchors(): { center: number; top: number; head: number; hand: number } {
    return this.rig?.anchors ?? BIPED;
  }

  at(index: number): Point {
    return this.points[index] ?? { x: this.x, y: this.ground };
  }

  get center(): Point {
    return this.at(this.anchors.center);
  }

  get headPoint(): Point {
    return this.at(this.anchors.head);
  }

  // The scale already carries the look's own size.
  get radius(): number {
    return (this.look.rig === 'beast' ? 10 : 9) * this.scale;
  }

  get mood(): Mood {
    if (this.dead) return 'dead';
    if (this.state !== 'stand' || this.flash > 0.25) return 'hurt';
    if (this.cheering) return 'happy';

    return this.move ? 'shout' : 'idle';
  }

  get strike(): number {
    return strikeCurve(this.move ? this.progress : null);
  }

  place(): void {
    this.ground = groundAt(this.z);
    const own = this.look.rig === 'biped' ? (this.look.build?.scale ?? 1) : (this.look.scale ?? 1);

    this.scale = own * MODEL_SCALE * depthScale(this.z);
    if (this.look.rig === 'biped') this.build = { ...HUMAN, ...this.look.build, scale: this.scale };
  }

  beastState(): BeastState | null {
    return beastOf(this);
  }

  pose(t: number): Point[] {
    return poseBody(this, t);
  }

  swing(move: Move, duration: number, at = 0): void {
    this.move = move;
    this.duration = duration;
    this.progress = at;
  }

  launch(x: number, y: number, radius: number, force: number): void {
    if (!this.ragdoll) {
      const beast = this.beastState();

      this.ragdoll =
        beast && this.rig
          ? this.rig.ragdoll(this.points, beast)
          : bipedRagdoll(this.build, this.points, this.look.mass);
      this.state = 'rag';
      this.downFor = 0;
      this.move = null;
      this.lift = 0;
      this.points = this.ragdoll.points;
    }
    this.asleep = false;
    if (force > 0) blast(this.ragdoll, x, y, radius, force, FIELD.step);
  }

  step(dt: number, frame: Frame, pin: Pin | null): void {
    this.flash = Math.max(0, this.flash - dt * 7);
    this.flinch = Math.max(0, this.flinch - dt * 4.5);
    this.wobble.step(dt);
    if (this.move) {
      this.progress += dt / this.duration;
      if (this.progress >= 1) {
        this.move = null;
        this.cheering = false;
      }
    }
    this.#stepBody(dt, frame, pin);
    if (this.look.rig === 'biped')
      this.#wardrobe.step(this.look, this, dt, Math.sin(this.seed + this.phase) * 0.15);
  }

  #stepBody(dt: number, frame: Frame, pin: Pin | null): void {
    if (this.state === 'stand') {
      this.place();
      this.points = this.pose(frame.time);

      return;
    }
    if (this.state === 'rise') {
      this.#riseFor += dt;
      const k = Math.min(1, this.#riseFor / RISE);

      this.points = risingPose(this, this.#from, k, frame.time);
      if (k >= 1) this.state = 'stand';

      return;
    }
    const body = this.ragdoll;

    if (!body || (this.asleep && !pin)) return;
    body.pin = pin;
    stepRagdoll(body, dt, this.ground, frame.left, FIELD.width);
    this.points = body.points;
    this.downFor += dt;
    // Bodies in a pile keep nudging each other, so stillness is judged on smoothed energy.
    body.calm = body.calm * 0.95 + energy(body) * 0.05;
    body.quiet = body.calm < 0.006 * this.scale ? body.quiet + dt : 0;
    if (pin) {
      this.downFor = 0;

      return;
    }
    if (this.mayRise && this.downFor > 0.6 && (body.quiet > 0.25 || this.downFor > 2.5))
      this.#rise(frame);
    else if (!this.mayRise && body.quiet > 0.8) this.asleep = true;
  }

  #rise(frame: Frame): void {
    this.state = 'rise';
    this.#riseFor = 0;
    this.#from = this.points.map((point) => ({ x: point.x, y: point.y }));
    this.x = Math.min(FIELD.width - 16, Math.max(frame.left + 16, this.center.x));
    this.ragdoll = null;
    // Back on its feet, a body has its weapon in hand again, so the next fall can throw it.
    this.disarmed = false;
    this.walking = 0;
    this.vx = 0;
    this.vz = 0;
  }

  get cloth(): readonly (readonly Point[])[] {
    return this.#wardrobe.chains;
  }
}
