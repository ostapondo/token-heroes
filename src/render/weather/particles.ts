import { ParticlePreset } from '@content';
import { ARENA } from '../scene/geometry';
import { type Weather, WeatherLayer, randomBetween } from './weather';

const Edge = { Top: 'top', Bottom: 'bottom' } as const;

interface Preset {
  readonly count: number;
  readonly from: (typeof Edge)[keyof typeof Edge];
  readonly vx: readonly [number, number];
  readonly vy: readonly [number, number];
  readonly size: readonly [number, number];
  readonly length?: number;
  readonly colors: readonly string[];
}

const PRESETS: Readonly<Record<ParticlePreset, Preset>> = {
  [ParticlePreset.Embers]: {
    count: 18,
    from: Edge.Bottom,
    vx: [-6, 0],
    vy: [-50, -30],
    size: [1, 2],
    colors: ['#ffb02e', '#ff5a1f'],
  },
  [ParticlePreset.Snow]: {
    count: 24,
    from: Edge.Top,
    vx: [-14, -8],
    vy: [18, 30],
    size: [1, 2],
    colors: ['#ffffff'],
  },
  [ParticlePreset.Rocks]: {
    count: 12,
    from: Edge.Top,
    vx: [-2, 0],
    vy: [50, 80],
    size: [1, 2],
    colors: ['#8a6a3a', '#c9a05a'],
  },
  [ParticlePreset.Rain]: {
    count: 40,
    from: Edge.Top,
    vx: [-60, -50],
    vy: [220, 260],
    size: [1, 1],
    length: 6,
    colors: ['#b9cff0'],
  },
  [ParticlePreset.Drips]: {
    count: 14,
    from: Edge.Top,
    vx: [0, 0],
    vy: [40, 60],
    size: [1, 1],
    length: 3,
    colors: ['#a6d83d'],
  },
  [ParticlePreset.Wisps]: {
    count: 12,
    from: Edge.Bottom,
    vx: [-3, 3],
    vy: [-25, -15],
    size: [1, 2],
    colors: ['#52e0c4'],
  },
  [ParticlePreset.Ash]: {
    count: 16,
    from: Edge.Bottom,
    vx: [-5, 0],
    vy: [-35, -20],
    size: [1, 1],
    colors: ['#ff4a3d', '#ff9a3d'],
  },
  [ParticlePreset.Coins]: {
    count: 14,
    from: Edge.Top,
    vx: [-2, 2],
    vy: [30, 45],
    size: [2, 2],
    colors: ['#ffd36a'],
  },
  [ParticlePreset.Motes]: {
    count: 14,
    from: Edge.Bottom,
    vx: [-2, 2],
    vy: [-14, -8],
    size: [1, 1],
    colors: ['#d8dde6'],
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export class Particles implements Weather {
  readonly layer = WeatherLayer.Front;
  readonly #preset: Preset;
  readonly #particles: Particle[];

  constructor(preset: ParticlePreset) {
    this.#preset = PRESETS[preset];
    this.#particles = Array.from({ length: this.#preset.count }, () => this.#spawn(true));
  }

  update(dt: number): void {
    this.#particles.forEach((particle, index) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      const gone = particle.y < -8 || particle.y > ARENA.height + 8 || particle.x < -8;

      if (gone) this.#particles[index] = this.#spawn(false);
    });
  }

  // One fill per colour: a storm is forty drops a frame.
  draw(context: CanvasRenderingContext2D): void {
    const length = this.#preset.length ?? 0;

    for (const color of this.#preset.colors) {
      context.fillStyle = color;
      context.beginPath();
      for (const particle of this.#particles) {
        if (particle.color !== color) continue;
        context.rect(
          Math.round(particle.x),
          Math.round(particle.y),
          particle.size,
          particle.size + length,
        );
      }
      context.fill();
    }
  }

  #spawn(anywhere: boolean): Particle {
    const { from, vx, vy, size, colors } = this.#preset;
    const edge = from === Edge.Top ? -4 : ARENA.height + 4;

    return {
      x: randomBetween(0, ARENA.width + 40),
      y: anywhere ? randomBetween(0, ARENA.height) : edge,
      vx: randomBetween(...vx),
      vy: randomBetween(...vy),
      size: Math.round(randomBetween(...size)),
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff',
    };
  }
}
