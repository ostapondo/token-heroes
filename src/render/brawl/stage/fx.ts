import { heatOf } from './heat';

// Loose bits of a fight: flame, smoke, dust, rock, chips, sparks, stars, motes and embers. Nothing
// here touches a body.
export type Kind =
  | 'fire'
  | 'smoke'
  | 'dust'
  | 'rock'
  | 'chip'
  | 'spark'
  | 'star'
  | 'mote'
  | 'ember';

export interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  spin: number;
  floor: number;
  color: string;
  steps: readonly string[];
  hot: boolean;
}

export interface Ring {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly color: string;
  t: number;
}

export interface Decal {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  life: number;
}

export interface Text {
  readonly x: number;
  readonly y: number;
  readonly value: string;
  readonly color: string;
  readonly size: number;
  readonly max: number;
  readonly rise: number;
  life: number;
}

// How a floating line reads: a hit's number, a crit, a banner across the arena.
export interface TextStyle {
  readonly color: string;
  readonly size: number;
  readonly life?: number;
  readonly rise?: number;
}

// A frame past this many particles drops new ones; nine hundred is a boss dying under a meteor.
const MAX = 900;
const DEFAULT = heatOf('#ff7a2b').steps;

export const RING_LIFE = 0.45;

export const random = (a: number, b: number): number => a + Math.random() * (b - a);

export class Fx {
  parts: Particle[] = [];
  rings: Ring[] = [];
  decals: Decal[] = [];
  texts: Text[] = [];
  flash = 0;

  add(
    kind: Kind,
    x: number,
    y: number,
    vx: number,
    vy: number,
    max: number,
    size: number,
    extra: Partial<Particle> = {},
  ): void {
    if (this.parts.length >= MAX) return;
    this.parts.push({
      kind,
      x,
      y,
      vx,
      vy,
      life: 0,
      max,
      size,
      rot: random(0, 6),
      spin: random(-12, 12),
      floor: y + 40,
      color: '#2a1208',
      steps: DEFAULT,
      hot: false,
      ...extra,
    });
  }

  ring(x: number, y: number, radius: number, color: string, t = 0): void {
    this.rings.push({ x, y, radius, color, t });
  }

  text(x: number, y: number, value: string, style: TextStyle): void {
    const { color, size, life = 0.9, rise = 28 } = style;

    this.texts.push({ x, y, value, color, size, max: life, rise, life: 0 });
  }

  step(dt: number, floor: number): void {
    for (const p of this.parts) {
      p.life += dt;
      move(p, dt, floor);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.parts = this.parts.filter((p) => p.life < p.max);
    for (const ring of this.rings) ring.t += dt;
    this.rings = this.rings.filter((ring) => ring.t < RING_LIFE);
    for (const decal of this.decals) decal.life -= dt;
    this.decals = this.decals.filter((decal) => decal.life > 0);
    for (const text of this.texts) text.life += dt;
    this.texts = this.texts.filter((text) => text.life < text.max);
    this.flash = Math.max(0, this.flash - dt * 3);
  }
}

function move(p: Particle, dt: number, floor: number): void {
  switch (p.kind) {
    case 'fire':
      p.vx *= 1 - 4 * dt;
      p.vy = p.vy * (1 - 4 * dt) - 140 * dt;
      break;
    case 'smoke':
    case 'dust':
      p.vx *= 1 - 1.5 * dt;
      p.vy = p.vy * (1 - 1.2 * dt) - 18 * dt;
      p.size += 12 * dt;
      break;
    case 'rock':
    case 'chip': {
      const ground = p.kind === 'rock' ? p.floor : Math.min(p.floor, floor);

      p.vy += 900 * dt;
      p.rot += p.spin * dt;
      if (p.y > ground - p.size && p.vy > 0) {
        p.y = ground - p.size;
        p.vy *= -0.35;
        p.vx *= 0.6;
        p.spin *= 0.5;
      }
      break;
    }
    case 'spark':
      p.vy += 600 * dt;
      p.vx *= 1 - 2 * dt;
      break;
    case 'ember':
    case 'mote':
      p.vx = Math.sin(p.life * 3 + p.rot) * 12;
      break;
    case 'star':
      break;
  }
}
