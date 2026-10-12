import type { BipedLook, Build, Cloth } from '@content';
import type { Point } from '../../geometry';
import { CLOTH_LINKS, clothAnchor, clothOf, hanging } from '../paint/cloth';

interface Link {
  x: number;
  y: number;
  px: number;
  py: number;
}

const GRAVITY = 900;

// A cloth chain pinned at its first link; the rest swing behind the body and settle under gravity.
export class ClothChain {
  #links: Link[] = [];

  get points(): readonly Point[] {
    return this.#links;
  }

  step(
    cloth: Cloth,
    anchor: Point,
    scale: number,
    facing: number,
    ground: number,
    dt: number,
    wind: number,
  ): void {
    const link = (cloth.length * scale) / (CLOTH_LINKS - 1);
    const first = this.#links[0];

    if (!first || Math.hypot(first.x - anchor.x, first.y - anchor.y) > 40) {
      this.#links = hanging(cloth, anchor, scale, facing).map((point) => ({
        ...point,
        px: point.x,
        py: point.y,
      }));

      return;
    }
    const fall = GRAVITY * dt * dt;

    for (const point of this.#links.slice(1)) {
      const vx = (point.x - point.px) * 0.94;
      const vy = (point.y - point.py) * 0.94;

      point.px = point.x;
      point.py = point.y;
      point.x += vx - facing * wind * dt * link;
      point.y += vy + fall;
    }
    first.x = anchor.x;
    first.y = anchor.y;
    first.px = anchor.x;
    first.py = anchor.y;
    for (let iteration = 0; iteration < 3; iteration += 1) {
      for (let i = 1; i < this.#links.length; i += 1) {
        const a = this.#links[i - 1];
        const b = this.#links[i];

        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-3;
        const k = (d - link) / d;

        if (i === 1) {
          b.x -= dx * k;
          b.y -= dy * k;
        } else {
          a.x += dx * k * 0.5;
          a.y += dy * k * 0.5;
          b.x -= dx * k * 0.5;
          b.y -= dy * k * 0.5;
        }
        b.y = Math.min(b.y, ground - 1);
      }
    }
  }
}

// Every piece of cloth a body wears, each a chain stepped from where the body stands now.
export class Wardrobe {
  readonly #chains: ClothChain[] = [];

  get chains(): readonly (readonly Point[])[] {
    return this.#chains.map((chain) => chain.points);
  }

  step(
    look: BipedLook,
    body: {
      tier: number;
      tint: string | undefined;
      build: Build;
      points: readonly Point[];
      facing: number;
      scale: number;
      ground: number;
    },
    dt: number,
    wind: number,
  ): void {
    const cloth = clothOf(look, body.tier, body.tint);

    while (this.#chains.length < cloth.length) this.#chains.push(new ClothChain());
    cloth.forEach((piece, index) => {
      const anchor = clothAnchor(piece, body.build, body.points, body.facing);

      this.#chains[index]?.step(piece, anchor, body.scale, body.facing, body.ground, dt, wind);
    });
  }
}
