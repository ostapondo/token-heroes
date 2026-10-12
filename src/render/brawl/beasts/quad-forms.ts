import type { BeastForm } from '@content';
import type { Point } from '../../geometry';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';

// Proportions of a four-legged body in design units.
export interface QuadShape {
  readonly length: number;
  readonly leg: number;
  readonly hip: number;
  readonly neck: number;
  readonly tail: number;
  readonly tailUp: number;
  readonly bulk: number;
  readonly legWidth: number;
  readonly tailWidth: number;
  readonly neckWidth: number;
  readonly head: number;
  readonly wag: number;
  readonly radius: number;
  // How high the neck rises over the chest, in neck lengths.
  readonly rear?: number;
}

export const QUADS: Readonly<Partial<Record<BeastForm, QuadShape>>> = {
  wolf: {
    length: 22,
    leg: 15,
    hip: 0.95,
    neck: 9,
    tail: 13,
    tailUp: 0.35,
    bulk: 6.2,
    legWidth: 2.3,
    tailWidth: 2.6,
    neckWidth: 4.4,
    head: 5,
    wag: 4,
    radius: 10,
  },
  boar: {
    length: 21,
    leg: 10,
    hip: 1,
    neck: 5,
    tail: 5,
    tailUp: 0.6,
    bulk: 8.5,
    legWidth: 2.6,
    tailWidth: 1.2,
    neckWidth: 6.5,
    head: 5.5,
    wag: 4,
    radius: 11,
  },
  rat: {
    length: 14,
    leg: 6,
    hip: 1,
    neck: 5,
    tail: 18,
    tailUp: -0.1,
    bulk: 4.6,
    legWidth: 1.4,
    tailWidth: 0.9,
    neckWidth: 3.2,
    head: 3.6,
    wag: 7,
    radius: 7,
  },
  dragon: {
    length: 30,
    leg: 21,
    hip: 1,
    neck: 27,
    tail: 36,
    tailUp: 0.25,
    bulk: 11,
    legWidth: 3.4,
    tailWidth: 4.5,
    neckWidth: 5,
    head: 8.5,
    wag: 2,
    radius: 22,
    rear: 1.05,
  },
};

type Paint = (kit: Kit, r: number) => void;

// Each head in its own frame, snout forward along +x.
const HEADS: Readonly<Partial<Record<BeastForm, Paint>>> = {
  wolf(kit, r) {
    const { p } = kit;
    const body = kit.shade('a');

    p.cel(p.shape('-0.9,-0.3 -0.4,-1.7 0.1,-0.6', r), body, r * 0.4);
    p.cel(p.ellipse(0, 0, r, r * 0.8), body, r);
    p.cel(p.shape('0.5,-0.45 1.9,-0.05 1.85,0.45 0.4,0.6', r), body, r * 0.5);
    p.cel(p.shape('1.45,0.42 1.6,0.8 1.7,0.42', r), kit.shade('h'), r * 0.2);
    eye(kit, r * 0.35, -r * 0.3, r * 0.16, kit.lit('e'));
  },
  boar(kit, r) {
    const { p } = kit;
    const body = kit.shade('a');

    p.cel(p.ellipse(0, 0, r, r * 0.9), body, r);
    p.cel(p.shape('0.4,-0.5 1.7,-0.3 1.75,0.6 0.4,0.75', r), body, r * 0.5);
    p.cel(p.shape('1.2,0.5 1.7,-0.6 1.45,0.65', r), kit.shade('h'), r * 0.3);
    p.cel(p.shape('-0.5,-0.6 -0.2,-1.4 0.2,-0.7', r), kit.shade('b'), r * 0.3);
    eye(kit, r * 0.3, -r * 0.25, r * 0.15, kit.lit('e'));
  },
  rat(kit, r) {
    const { p } = kit;

    p.cel(p.ellipse(-r * 0.2, -r * 0.9, r * 0.6, r * 0.6), kit.shade('h'), r * 0.5);
    p.cel(p.shape('-0.8,-0.6 0.6,-0.5 2.1,0.2 0.5,0.7 -0.8,0.6', r), kit.shade('b'), r);
    p.segment(r * 1.6, r * 0.1, r * 2.6, -r * 0.3, 0.5, kit.lit('h'));
    eye(kit, r * 0.5, -r * 0.2, r * 0.18, kit.lit('e'));
  },
};

export function quadHead(kit: Kit, form: BeastForm, r: number): void {
  HEADS[form]?.(kit, r);
}

// What a form carries on its back: a boar's bristles.
export function quadBack(
  kit: Kit,
  form: BeastForm,
  chest: Point,
  hip: Point,
  s: number,
  far: boolean,
): void {
  const { p } = kit;

  if (form === 'boar' && !far) {
    for (let i = 0; i < 5; i += 1) {
      const k = i / 4;
      const x = hip.x + (chest.x - hip.x) * k;
      const y = hip.y + (chest.y - hip.y) * k - 8 * s;

      p.cel(
        p.polygon(x - 2 * s, y + 3 * s, x, y - 3 * s, x + 2 * s, y + 3 * s),
        kit.shade('x'),
        2 * s,
      );
    }
  }
}
