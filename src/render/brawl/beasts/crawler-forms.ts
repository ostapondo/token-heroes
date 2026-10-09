import type { BeastForm } from '@content';
import type { Point } from '../../geometry';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';

// The abdomen behind the thorax, and the head, of each many-legged form.
export const CRAWL_BODIES: Readonly<
  Partial<Record<BeastForm, (kit: Kit, a: Point, b: Point, s: number) => void>>
> = {
  scorpion(kit, a, b, s) {
    for (let i = 0; i < 3; i += 1) {
      const k = i * 0.3;

      kit.p.cel(
        kit.p.ellipse(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, 5.5 * s, 4.5 * s),
        kit.shade('a'),
        5 * s,
      );
    }
  },
  beetle(kit, a, b, s) {
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 3 * s };

    kit.p.cel(kit.p.ellipse(mid.x, mid.y, 11 * s, 7.5 * s), kit.shade('a'), 9 * s);
    kit.p.segment(mid.x - 8 * s, mid.y - 4 * s, mid.x + 6 * s, mid.y - 5 * s, s, kit.lit('c'));
  },
};

export const CRAWL_HEADS: Readonly<Partial<Record<BeastForm, (kit: Kit, r: number) => void>>> = {
  scorpion(kit, r) {
    kit.p.cel(kit.p.ellipse(0, 0, r, r * 0.7), kit.shade('a'), r);
    kit.p.cel(
      kit.p.shape('0.6,-0.2 2,-1 2.5,-0.3 1.9,-0.5 2.4,0.3 0.7,0.4', r),
      kit.shade('a'),
      r * 0.5,
    );
    eye(kit, r * 0.4, -r * 0.3, r * 0.14, kit.lit('e'));
  },
  beetle(kit, r) {
    kit.p.cel(kit.p.ellipse(0, 0, r * 0.9, r * 0.7), kit.shade('b'), r);
    kit.p.cel(kit.p.shape('0.4,-0.4 1.6,-2 1.2,-0.2', r), kit.shade('h'), r * 0.4);
    eye(kit, r * 0.4, -r * 0.1, r * 0.14, kit.lit('e'));
  },
};
